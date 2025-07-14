import { pgTable, text, serial, integer, boolean, date, timestamp,customType} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

// Issue status enum
export const issueStatusEnum = z.enum(["unresolved", "in_progress", "resolved"]);
export type IssueStatus = z.infer<typeof issueStatusEnum>;

// Issues table
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  stepsToReproduce: text("steps_to_reproduce"),
  solution: text("solution"),
  status: text("status").notNull().default("unresolved"), // One of: unresolved, in_progress, resolved
  date: date("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Define the relations
export const usersRelations = relations(users, ({ many }) => ({
  issues: many(issues),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  user: one(users, {
    fields: [issues.userId],
    references: [users.id],
  }),
  tags: many(issueTags),
  links: many(issueLinks),
}));

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(), // Hex color code
});

// Issue tags join table
export const issueTags = pgTable("issue_tags", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull().references(() => issues.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
});

// Define the relations for tags
export const tagsRelations = relations(tags, ({ many }) => ({
  issues: many(issueTags),
}));

// Define the relations for issue tags
export const issueTagsRelations = relations(issueTags, ({ one }) => ({
  issue: one(issues, {
    fields: [issueTags.issueId],
    references: [issues.id],
  }),
  tag: one(tags, {
    fields: [issueTags.tagId],
    references: [tags.id],
  }),
}));

// Issue links table
export const issueLinks = pgTable("issue_links", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull().references(() => issues.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
});

// Then define your bytea column like this:
const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

// Issue files table
export const issueFiles = pgTable("issue_files", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").references(() => issues.id),
  url: text("url").notNull(),
  name: text("name").notNull(),
  size: integer("size"),
  type: text("type"),
  data: bytea("data").notNull()
});

// Define the relations for issue links
export const issueLinksRelations = relations(issueLinks, ({ one }) => ({
  issue: one(issues, {
    fields: [issueLinks.issueId],
    references: [issues.id],
  }),
}));

// Insert schemas
export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

export const insertIssueTagSchema = createInsertSchema(issueTags).omit({
  id: true,
});

export const insertIssueLinkSchema = createInsertSchema(issueLinks).omit({
  id: true,
});

// (Optional) Insert schema for issue files
export const insertIssueFileSchema = createInsertSchema(issueFiles).omit({
  id: true,
});
// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type IssueTag = typeof issueTags.$inferSelect;
export type InsertIssueTag = z.infer<typeof insertIssueTagSchema>;

export type IssueLink = typeof issueLinks.$inferSelect;
export type InsertIssueLink = z.infer<typeof insertIssueLinkSchema>;

export type IssueFile = typeof issueFiles.$inferSelect;
export type InsertIssueFile = z.infer<typeof insertIssueFileSchema>;

// Type for AI Suggestion Response
export interface AISuggestion {
  suggestion: string;
  explanation?: string;
  resources?: string[];
}
