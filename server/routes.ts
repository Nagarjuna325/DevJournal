import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertIssueSchema, 
  insertTagSchema, 
  insertIssueTagSchema,
  insertIssueLinkSchema,
  issueStatusEnum,
   issueFiles 
} from "@shared/schema";
import multer from "multer";
import fs from "fs/promises";
import { db } from "./db";

// Middleware to ensure the user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {

  // ✅ Add this log to see every request that hits your server
  app.use((req, res, next) => {
    //console.log(`${req.method} ${req.url}`);
    next();
  });

  
  // Setup authentication routes
  setupAuth(app);

  // --- ADD THIS BLOCK BELOW ---

  // Registration route
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, name } = req.body;
      // Basic validation (replace with zod or your preferred validation)
      if (!username || !email || !password || !name) {
        return res.status(400).json({ message: "All fields are required" });
      }
      // TODO: Check if user already exists
      // TODO: Hash the password before saving (use bcrypt or similar)
      // TODO: Save the new user to your database
      const newUser = await storage.createUser({ username, email, password, name});
      res.status(201).json({ message: "User registered", user: newUser });
    } catch (error) {
      next(error);
    }
  });

  // --- EXISTING ROUTES BELOW ---
  
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

      const newIssue = await storage.createIssue(issueData, req.body.files);
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
  

  app.post("/api/issues", ensureAuthenticated, async (req, res, next) => {
    try {
      // Log the incoming request body to debug the issue
      console.log("🔥 POST /api/issues hit", req.body);  // Logs the body of the request
      console.log("Request Body:", req.body);  // Logs the request body for further inspection
  
      // Ensure the user is authenticated
      const userId = req.user!.id;
      
      // Validate the incoming issue data using Zod schema
      const issueData = insertIssueSchema.parse({
        ...req.body,
        userId
      });
      
      // Create the issue in the database
      const newIssue = await storage.createIssue(issueData);
      
      // Respond with the newly created issue
      res.status(201).json(newIssue);
    } catch (error) {
      // Handle validation errors from Zod
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid issue data", errors: error.errors });
      }
  
      // Pass other errors to the next middleware (for global error handling)
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

app.use("/uploads", express.static("uploads"));

const upload = multer({ dest: "uploads/" }); // or configure as needed

app.post(
  "/api/upload",
  ensureAuthenticated,
  upload.single("file"),
  async (req, res) => {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    
    // Read file as buffer
    const fileBuffer = await fs.readFile(file.path);

    // // Log what will be inserted
    // console.log("Inserting into issueFiles from /api/upload:", {
    //   url: `/uploads/${file.filename}`,
    //   name: file.originalname,
    //   size: file.size,
    //   type: file.mimetype,
    //   data: fileBuffer ? "[buffer present]" : "[no buffer]"
    // });


    // Save file metadata and content to the database
    const inserted = await db.insert(issueFiles).values({
      // You may need to pass issueId from the client or associate later
      //issueId: null, // or the actual issueId if available
      url: `/uploads/${file.filename}`,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      data: fileBuffer
    }).returning();

    res.json({
      url: `/uploads/${file.filename}`,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      id: inserted[0].id // return the DB id for later association
    });
  }
);
  
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
