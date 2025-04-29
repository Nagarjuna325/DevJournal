import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import * as IssueController from "./controllers/issue-controller";
import * as AIController from "./controllers/ai-controller";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up auth routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Issue routes
  app.get("/api/issues", IssueController.getUserIssues);
  app.get("/api/issues/date/:date", IssueController.getIssuesByDate);
  app.get("/api/issues/:id", IssueController.getIssueById);
  app.post("/api/issues", IssueController.createIssue);
  app.put("/api/issues/:id", IssueController.updateIssue);
  app.delete("/api/issues/:id", IssueController.deleteIssue);
  
  // Tag routes
  app.get("/api/tags", IssueController.getTags);
  app.post("/api/tags", IssueController.createTag);
  
  // AI routes
  app.post("/api/ai/suggestion", AIController.getAISuggestion);
  app.post("/api/ai/summary", AIController.getIssueSummary);

  const httpServer = createServer(app);

  return httpServer;
}
