import OpenAI from "openai";
import { AISuggestion } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getSuggestionForIssue(
  title: string,
  description: string,
  stepsToReproduce: string
): Promise<AISuggestion> {
  try {
    const prompt = `
You are an expert developer assistant who helps analyze bugs and provides suggestions.
Analyze the following bug/issue and provide:
1. A potential solution suggestion
2. A brief explanation of why the issue might be occurring
3. Optional: Up to 3 relevant resources (documentation, articles) that could help

Bug Title: ${title}
Bug Description: ${description}
Steps to Reproduce: ${stepsToReproduce}

Respond with JSON in this format:
{
  "suggestion": "Clear, specific solution steps to try",
  "explanation": "Brief technical explanation of the likely underlying cause",
  "resources": ["Link 1 with title", "Link 2 with title", "Link 3 with title"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Ensure we have all required fields
    return {
      suggestion: result.suggestion || "No suggestion available",
      explanation: result.explanation || "No explanation available",
      resources: result.resources || [],
    };
  } catch (error) {
    console.error("Error getting AI suggestion:", error);
    return {
      suggestion: "Unable to generate suggestion at this time.",
      explanation: "There was an error connecting to the AI service. Please try again later.",
    };
  }
}

export async function summarizeIssue(issue: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a technical writing assistant who specializes in summarizing complex bug reports into concise descriptions. Keep summaries clear, technical, and under 100 words."
        },
        {
          role: "user",
          content: `Summarize this technical issue into a brief description: ${issue}`
        }
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || "No summary available";
  } catch (error) {
    console.error("Error summarizing issue:", error);
    return "Unable to generate summary at this time.";
  }
}
