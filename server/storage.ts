import { 
  users, 
  issues, 
  tags, 
  issueTags, 
  issueLinks,
  issueFiles,
  type User, 
  type InsertUser,
  type Issue,
  type InsertIssue,
  type Tag,
  type InsertTag,
  type IssueTag,
  type InsertIssueTag,
  type IssueLink,
  type InsertIssueLink
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Issue methods
  getIssue(id: number): Promise<Issue | undefined>;
  getIssuesByUser(userId: number): Promise<Issue[]>;
  getIssuesByUserAndDate(userId: number, date: Date): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, issue: Partial<InsertIssue>): Promise<Issue | undefined>;
  deleteIssue(id: number): Promise<boolean>;
  
  // Tag methods
  getAllTags(): Promise<Tag[]>;
  getTagsByIssue(issueId: number): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  addTagToIssue(issueTag: InsertIssueTag): Promise<void>;
  removeTagFromIssue(issueId: number, tagId: number): Promise<void>;
  
  // Link methods
  getLinksByIssue(issueId: number): Promise<IssueLink[]>;
  addLinkToIssue(link: InsertIssueLink): Promise<IssueLink>;
  deleteLinkFromIssue(linkId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Issue methods
  async getIssue(id: number): Promise<Issue | undefined> {
  const [issue] = await db.select().from(issues).where(eq(issues.id, id));
  if (issue) {
    (issue as any).files = await db.select().from(issueFiles).where(eq(issueFiles.issueId, issue.id));
  }
  return issue;
}
  
 async getIssuesByUser(userId: number): Promise<Issue[]> {
  const issuesList = await db.select().from(issues)
    .where(eq(issues.userId, userId))
    .orderBy(desc(issues.date), desc(issues.createdAt));
  for (const issue of issuesList) {
    (issue as any).files = await db.select().from(issueFiles).where(eq(issueFiles.issueId, issue.id));
  }
  return issuesList as any;
}
  
  async getIssuesByUserAndDate(userId: number, date: Date): Promise<Issue[]> {
    // Format the date as YYYY-MM-DD string for comparison
    const formattedDate = date.toISOString().split('T')[0];
    
    // return db.select().from(issues)
    //   .where(and(
    //     eq(issues.userId, userId),
    //     eq(issues.date, formattedDate)
    //   ))
    //   .orderBy(desc(issues.createdAt));
    const issuesList = await db.select().from(issues)
    .where(and(
      eq(issues.userId, userId),
      eq(issues.date, formattedDate)
    ))
    .orderBy(desc(issues.createdAt));
  for (const issue of issuesList) {
    (issue as any).files = await db.select().from(issueFiles).where(eq(issueFiles.issueId, issue.id));
  }
  return issuesList as any;
  }
  
  async createIssue(issue: InsertIssue, files?: any[]): Promise<Issue> {
  const [newIssue] = await db.insert(issues).values(issue).returning();
  if (files && files.length > 0) {
    for (const file of files) {
      //await db.insert(issueFiles).values({
        // issueId: newIssue.id,
        // url: file.url,
        // name: file.name,
        // size: file.size,
        // type: file.type,
        // data: file.data
        // Update the file's issueId instead of inserting a new row
      await db.update(issueFiles)
        .set({ issueId: newIssue.id })
        .where(eq(issueFiles.id, file.id));
    }
  }
  return { ...newIssue, files } as any;
}
  
  async updateIssue(id: number, issueData: Partial<InsertIssue>): Promise<Issue | undefined> {
    const [updatedIssue] = await db.update(issues)
      .set(issueData)
      .where(eq(issues.id, id))
      .returning();
    return updatedIssue;
  }
  
  async deleteIssue(id: number): Promise<boolean> {
    await db.delete(issueLinks).where(eq(issueLinks.issueId, id));
    await db.delete(issueTags).where(eq(issueTags.issueId, id));
    const result = await db.delete(issues).where(eq(issues.id, id)).returning();
    return result.length > 0;
  }
  
  // Tag methods
  async getAllTags(): Promise<Tag[]> {
    return db.select().from(tags);
  }
  
  async getTagsByIssue(issueId: number): Promise<Tag[]> {
    const result = await db.select({
      id: tags.id,
      name: tags.name,
      color: tags.color
    })
    .from(issueTags)
    .innerJoin(tags, eq(issueTags.tagId, tags.id))
    .where(eq(issueTags.issueId, issueId));
    
    return result.map(row => ({
      id: row.id,
      name: row.name,
      color: row.color
    }));
  }
  
  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }
  
  async addTagToIssue(issueTag: InsertIssueTag): Promise<void> {
    await db.insert(issueTags).values(issueTag);
  }
  
  async removeTagFromIssue(issueId: number, tagId: number): Promise<void> {
    await db.delete(issueTags)
      .where(and(
        eq(issueTags.issueId, issueId),
        eq(issueTags.tagId, tagId)
      ));
  }
  
  // Link methods
  async getLinksByIssue(issueId: number): Promise<IssueLink[]> {
    return db.select().from(issueLinks).where(eq(issueLinks.issueId, issueId));
  }
  
  async addLinkToIssue(link: InsertIssueLink): Promise<IssueLink> {
    const [newLink] = await db.insert(issueLinks).values(link).returning();
    return newLink;
  }
  
  async deleteLinkFromIssue(linkId: number): Promise<boolean> {
    const result = await db.delete(issueLinks).where(eq(issueLinks.id, linkId)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
