import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Issue/Bug entries model
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  stepsToReproduce: text("steps_to_reproduce"),
  solution: text("solution"),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("in_progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tags model
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Issue-Tag relation (many-to-many)
export const issueTags = pgTable("issue_tags", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull().references(() => issues.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
});

// Links model
export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull().references(() => issues.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  issues: many(issues),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  user: one(users, {
    fields: [issues.userId],
    references: [users.id],
  }),
  tags: many(issueTags),
  links: many(links),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  issues: many(issueTags),
}));

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

export const linksRelations = relations(links, ({ one }) => ({
  issue: one(issues, {
    fields: [links.issueId],
    references: [issues.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const issueSchema = createInsertSchema(issues)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const tagSchema = createInsertSchema(tags)
  .omit({ id: true, createdAt: true });

export const linkSchema = createInsertSchema(links)
  .omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof issueSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof tagSchema>;

export type Link = typeof links.$inferSelect;
export type InsertLink = z.infer<typeof linkSchema>;

export type IssueWithDetails = Issue & {
  tags?: Tag[];
  links?: Link[];
};
