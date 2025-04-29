import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertIssueSchema, 
  insertTagSchema, 
  insertIssueTagSchema,
  insertIssueLinkSchema,
  issueStatusEnum
} from "@shared/schema";

// Middleware to ensure the user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Issues routes
  app.get("/api/issues", ensureAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const issues = await storage.getIssuesByUser(userId);
      res.json(issues);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/issues/date/:date", ensureAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const dateParam = req.params.date;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const date = new Date(dateParam);
      const issues = await storage.getIssuesByUserAndDate(userId, date);
      res.json(issues);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/issues/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: "Invalid issue ID" });
      }
      
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      // Ensure user owns this issue
      if (issue.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(issue);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/issues", ensureAuthenticated, async (req, res, next) => {
    try {
      const userId = req.user!.id;
      
      // Validate issue data
      const issueData = insertIssueSchema.parse({
        ...req.body,
        userId
      });
      
      const newIssue = await storage.createIssue(issueData);
      res.status(201).json(newIssue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid issue data", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.put("/api/issues/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: "Invalid issue ID" });
      }
      
      // Check if issue exists and belongs to user
      const existingIssue = await storage.getIssue(issueId);
      if (!existingIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      if (existingIssue.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate update data
      const updateData = insertIssueSchema.partial().parse(req.body);
      
      // Update issue
      const updatedIssue = await storage.updateIssue(issueId, updateData);
      res.json(updatedIssue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid issue data", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.delete("/api/issues/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: "Invalid issue ID" });
      }
      
      // Check if issue exists and belongs to user
      const existingIssue = await storage.getIssue(issueId);
      if (!existingIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      if (existingIssue.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Delete issue
      await storage.deleteIssue(issueId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Tags routes
  app.get("/api/tags", ensureAuthenticated, async (req, res, next) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/issues/:id/tags", ensureAuthenticated, async (req, res, next) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: "Invalid issue ID" });
      }
      
      // Check if issue exists and belongs to user
      const existingIssue = await storage.getIssue(issueId);
      if (!existingIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      if (existingIssue.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const tags = await storage.getTagsByIssue(issueId);
      res.json(tags);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/tags", ensureAuthenticated, async (req, res, next) => {
    try {
      // Validate tag data
      const tagData = insertTagSchema.parse(req.body);
      
      // Create tag
      const newTag = await storage.createTag(tagData);
      res.status(201).json(newTag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.post("/api/issues/:id/tags", ensureAuthenticated, async (req, res, next) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: "Invalid issue ID" });
      }
      
      // Check if issue exists and belongs to user
      const existingIssue = await storage.getIssue(issueId);
      if (!existingIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      if (existingIssue.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate tag association data
      const tagData = insertIssueTagSchema.parse({
        ...req.body,
        issueId
      });
      
      // Add tag to issue
      await storage.addTagToIssue(tagData);
      res.status(201).end();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.delete("/api/issues/:issueId/tags/:tagId", ensureAuthenticated, async (req, res, next) => {
    try {
      const issueId = parseInt(req.params.issueId);
      const tagId = parseInt(req.params.tagId);
      
      if (isNaN(issueId) || isNaN(tagId)) {
        return res.status(400).json({ message: "Invalid issue or tag ID" });
      }
      
      // Check if issue exists and belongs to user
      const existingIssue = await storage.getIssue(issueId);
      if (!existingIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      if (existingIssue.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Remove tag from issue
      await storage.removeTagFromIssue(issueId, tagId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // Links routes
  app.get("/api/issues/:id/links", ensureAuthenticated, async (req, res, next) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: "Invalid issue ID" });
      }
      
      // Check if issue exists and belongs to user
      const existingIssue = await storage.getIssue(issueId);
      if (!existingIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      if (existingIssue.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const links = await storage.getLinksByIssue(issueId);
      res.json(links);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/issues/:id/links", ensureAuthenticated, async (req, res, next) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ message: "Invalid issue ID" });
      }
      
      // Check if issue exists and belongs to user
      const existingIssue = await storage.getIssue(issueId);
      if (!existingIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      if (existingIssue.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate link data
      const linkData = insertIssueLinkSchema.parse({
        ...req.body,
        issueId
      });
      
      // Add link to issue
      const newLink = await storage.addLinkToIssue(linkData);
      res.status(201).json(newLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid link data", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.delete("/api/issues/links/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const linkId = parseInt(req.params.id);
      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }
      
      // Delete link
      await storage.deleteLinkFromIssue(linkId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  
  // AI route for suggestions
  app.post("/api/ai/suggestions", ensureAuthenticated, async (req, res, next) => {
    try {
      const { description } = req.body;
      
      if (!description || typeof description !== 'string') {
        return res.status(400).json({ 
          message: "Invalid request. A description string is required." 
        });
      }
      
      // This is a placeholder - the actual OpenAI integration will be implemented in the client
      // In a real implementation, we would call an AI service here
      res.json({
        suggestions: [
          "Check for dependency array issues in your useEffect hooks",
          "Make sure you're not creating new object/array references in your render function",
          "Verify that your cleanup function is properly implemented in useEffect"
        ]
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
