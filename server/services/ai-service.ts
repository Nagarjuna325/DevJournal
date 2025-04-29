import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Uses AI to suggest potential solutions for a bug based on description and reproduction steps
 * 
 * @param description The bug description
 * @param stepsToReproduce Optional steps to reproduce the bug
 * @returns A string containing the suggested solution
 */
export async function suggestSolution(
  description: string,
  stepsToReproduce?: string
): Promise<string> {
  try {
    // Create a prompt that includes all available information
    let prompt = `As an experienced software developer, please suggest a possible solution for the following bug:\n\n`;
    prompt += `Bug Description: ${description}\n\n`;
    
    if (stepsToReproduce) {
      prompt += `Steps to Reproduce:\n${stepsToReproduce}\n\n`;
    }
    
    prompt += `Please provide a clear and concise solution that addresses the root cause of this issue. Include code examples if relevant.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert software developer specialized in identifying and fixing bugs. Provide practical, accurate solutions focused on code fixes rather than general advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message.content || "I couldn't generate a solution. Please provide more information about the bug.";
  } catch (error) {
    console.error("AI service error:", error);
    throw new Error("Failed to generate AI solution suggestion");
  }
}

/**
 * Analyzes and summarizes a bug description to extract key information
 * 
 * @param description The bug description to analyze
 * @returns A structured analysis with key points and potential root causes
 */
export async function analyzeBugDescription(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing software bugs. Extract the key information from bug descriptions and identify potential root causes."
        },
        {
          role: "user",
          content: `Please analyze this bug description and extract the key information, potential causes, and any important technical details:\n\n${description}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    return response.choices[0].message.content || "Unable to analyze the bug description.";
  } catch (error) {
    console.error("AI analysis error:", error);
    throw new Error("Failed to analyze bug description");
  }
}
