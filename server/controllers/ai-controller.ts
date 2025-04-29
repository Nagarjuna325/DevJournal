import { Request, Response } from "express";
import { getSuggestionForIssue, summarizeIssue } from "../openai";

// Get AI suggestions for a bug issue
export async function getAISuggestion(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, stepsToReproduce } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const suggestion = await getSuggestionForIssue(
      title,
      description,
      stepsToReproduce || ""
    );

    res.json(suggestion);
  } catch (error) {
    console.error("Error getting AI suggestion:", error);
    res.status(500).json({ 
      message: "Failed to get AI suggestion",
      suggestion: "Unable to generate suggestion at this time.",
      explanation: "There was an error processing your request."
    });
  }
}

// Summarize an issue description
export async function getIssueSummary(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const summary = await summarizeIssue(description);
    
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing issue:", error);
    res.status(500).json({ 
      message: "Failed to summarize issue",
      summary: "Unable to generate summary at this time."
    });
  }
}
