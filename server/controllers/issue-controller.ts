import { Request, Response } from "express";
import { storage } from "../storage";
import { insertIssueSchema, insertTagSchema, insertIssueLinkSchema } from "@shared/schema";
import { format, parseISO } from "date-fns";

// Get all issues for the authenticated user
export async function getUserIssues(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const issues = await storage.getIssuesByUserId(req.user!.id);
    res.json(issues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
}

// Get issues by date
export async function getIssuesByDate(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dateParam = req.params.date;
    const date = parseISO(dateParam);

    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const issues = await storage.getIssuesByDate(req.user!.id, date);
    res.json(issues);
  } catch (error) {
    console.error("Error fetching issues by date:", error);
    res.status(500).json({ message: "Failed to fetch issues" });
  }
}

// Get a single issue by ID
export async function getIssueById(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const issueId = parseInt(req.params.id);
    if (isNaN(issueId)) {
      return res.status(400).json({ message: "Invalid issue ID" });
    }

    const issue = await storage.getIssueById(issueId);
    
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check if the issue belongs to the authenticated user
    if (issue.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(issue);
  } catch (error) {
    console.error("Error fetching issue:", error);
    res.status(500).json({ message: "Failed to fetch issue" });
  }
}

// Create a new issue
export async function createIssue(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = insertIssueSchema.parse({
      ...req.body,
      userId: req.user!.id
    });

    const newIssue = await storage.createIssue(validatedData);

    // Handle tags
    if (req.body.tags && Array.isArray(req.body.tags)) {
      for (const tagName of req.body.tags) {
        const tag = await storage.findOrCreateTag(tagName);
        await storage.addTagToIssue(newIssue.id, tag.id);
      }
    }

    // Handle links
    if (req.body.links && Array.isArray(req.body.links)) {
      for (const link of req.body.links) {
        const validatedLink = insertIssueLinkSchema.parse({
          ...link,
          issueId: newIssue.id
        });
        await storage.createLink(validatedLink);
      }
    }

    // Get the complete issue with tags and links
    const completeIssue = await storage.getIssueById(newIssue.id);
    res.status(201).json(completeIssue);
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(400).json({ message: "Failed to create issue", error: (error as Error).message });
  }
}

// Update an existing issue
export async function updateIssue(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const issueId = parseInt(req.params.id);
    if (isNaN(issueId)) {
      return res.status(400).json({ message: "Invalid issue ID" });
    }

    const existingIssue = await storage.getIssueById(issueId);
    
    if (!existingIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check if the issue belongs to the authenticated user
    if (existingIssue.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Update the basic issue data
    const validatedData = insertIssueSchema.partial().parse({
      ...req.body,
      userId: req.user!.id
    });

    const updatedIssue = await storage.updateIssue(issueId, validatedData);

    // Handle tags if provided
    if (req.body.tags && Array.isArray(req.body.tags)) {
      // Remove existing tags
      for (const tag of existingIssue.tags) {
        await storage.removeTagFromIssue(issueId, tag.id);
      }
      
      // Add new tags
      for (const tagName of req.body.tags) {
        const tag = await storage.findOrCreateTag(tagName);
        await storage.addTagToIssue(issueId, tag.id);
      }
    }

    // Handle links if provided
    if (req.body.links && Array.isArray(req.body.links)) {
      // Delete existing links
      for (const link of existingIssue.links) {
        await storage.deleteLink(link.id);
      }
      
      // Add new links
      for (const link of req.body.links) {
        const validatedLink = insertIssueLinkSchema.parse({
          ...link,
          issueId
        });
        await storage.createLink(validatedLink);
      }
    }

    // Get the complete updated issue
    const completeUpdatedIssue = await storage.getIssueById(issueId);
    res.json(completeUpdatedIssue);
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(400).json({ message: "Failed to update issue", error: (error as Error).message });
  }
}

// Delete an issue
export async function deleteIssue(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const issueId = parseInt(req.params.id);
    if (isNaN(issueId)) {
      return res.status(400).json({ message: "Invalid issue ID" });
    }

    const existingIssue = await storage.getIssueById(issueId);
    
    if (!existingIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check if the issue belongs to the authenticated user
    if (existingIssue.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deleteIssue(issueId);
    
    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ message: "Failed to delete issue" });
  }
}

// Get all tags
export async function getTags(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tags = await storage.getTags();
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
}

// Create a new tag
export async function createTag(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = insertTagSchema.parse(req.body);
    const newTag = await storage.createTag(validatedData);
    
    res.status(201).json(newTag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(400).json({ message: "Failed to create tag", error: (error as Error).message });
  }
}
