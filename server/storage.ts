import {
  users, issues, tags, issueTags, links,
  type User, type InsertUser,
  type Issue, type InsertIssue,
  type Tag, type InsertTag,
  type Link, type InsertLink,
  type IssueWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Issue methods
  getIssue(id: number): Promise<Issue | undefined>;
  getIssueWithDetails(id: number): Promise<IssueWithDetails | undefined>;
  getIssuesByUser(userId: number): Promise<Issue[]>;
  getIssuesByDate(userId: number, date: Date): Promise<IssueWithDetails[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, issue: Partial<InsertIssue>): Promise<Issue | undefined>;
  deleteIssue(id: number): Promise<boolean>;
  
  // Tag methods
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  getAllTags(): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  addTagToIssue(issueId: number, tagId: number): Promise<void>;
  removeTagFromIssue(issueId: number, tagId: number): Promise<void>;
  
  // Link methods
  addLinkToIssue(link: InsertLink): Promise<Link>;
  removeLinkFromIssue(linkId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Issue methods
  async getIssue(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue;
  }

  async getIssueWithDetails(id: number): Promise<IssueWithDetails | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    if (!issue) return undefined;

    const issueTags = await this.getIssueTagsById(id);
    const issueLinks = await this.getIssueLinkById(id);

    return {
      ...issue,
      tags: issueTags,
      links: issueLinks
    };
  }

  async getIssuesByUser(userId: number): Promise<Issue[]> {
    return await db
      .select()
      .from(issues)
      .where(eq(issues.userId, userId))
      .orderBy(desc(issues.date));
  }

  async getIssuesByDate(userId: number, date: Date): Promise<IssueWithDetails[]> {
    // Create start and end dates for the given day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const issuesList = await db
      .select()
      .from(issues)
      .where(
        and(
          eq(issues.userId, userId),
          gte(issues.date, startDate),
          lte(issues.date, endDate)
        )
      )
      .orderBy(desc(issues.date));
    
    // Enhance issues with tags and links
    const enhancedIssues: IssueWithDetails[] = [];
    
    for (const issue of issuesList) {
      const issueTags = await this.getIssueTagsById(issue.id);
      const issueLinks = await this.getIssueLinkById(issue.id);
      
      enhancedIssues.push({
        ...issue,
        tags: issueTags,
        links: issueLinks
      });
    }
    
    return enhancedIssues;
  }

  private async getIssueTagsById(issueId: number): Promise<Tag[]> {
    const tagRelations = await db
      .select({
        tagId: issueTags.tagId
      })
      .from(issueTags)
      .where(eq(issueTags.issueId, issueId));
    
    if (tagRelations.length === 0) return [];
    
    const tagIds = tagRelations.map(rel => rel.tagId);
    return await db
      .select()
      .from(tags)
      .where(sql`${tags.id} IN (${tagIds.join(',')})`);
  }

  private async getIssueLinkById(issueId: number): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(eq(links.issueId, issueId));
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const [issue] = await db
      .insert(issues)
      .values(insertIssue)
      .returning();
    return issue;
  }

  async updateIssue(id: number, updatedIssue: Partial<InsertIssue>): Promise<Issue | undefined> {
    const [issue] = await db
      .update(issues)
      .set({
        ...updatedIssue,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();
    return issue;
  }

  async deleteIssue(id: number): Promise<boolean> {
    // Delete related links and tags first
    await db.delete(links).where(eq(links.issueId, id));
    await db.delete(issueTags).where(eq(issueTags.issueId, id));
    
    const result = await db
      .delete(issues)
      .where(eq(issues.id, id))
      .returning({ id: issues.id });
    
    return result.length > 0;
  }

  // Tag methods
  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id));
    return tag;
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name));
    return tag;
  }

  async getAllTags(): Promise<Tag[]> {
    return await db.select().from(tags);
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    // First check if tag already exists
    const existingTag = await this.getTagByName(insertTag.name);
    if (existingTag) return existingTag;
    
    // If not, create it
    const [tag] = await db
      .insert(tags)
      .values(insertTag)
      .returning();
    return tag;
  }

  async addTagToIssue(issueId: number, tagId: number): Promise<void> {
    // Check if relation already exists
    const [existingRelation] = await db
      .select()
      .from(issueTags)
      .where(
        and(
          eq(issueTags.issueId, issueId),
          eq(issueTags.tagId, tagId)
        )
      );
    
    if (!existingRelation) {
      await db
        .insert(issueTags)
        .values({ issueId, tagId });
    }
  }

  async removeTagFromIssue(issueId: number, tagId: number): Promise<void> {
    await db
      .delete(issueTags)
      .where(
        and(
          eq(issueTags.issueId, issueId),
          eq(issueTags.tagId, tagId)
        )
      );
  }

  // Link methods
  async addLinkToIssue(insertLink: InsertLink): Promise<Link> {
    const [link] = await db
      .insert(links)
      .values(insertLink)
      .returning();
    return link;
  }

  async removeLinkFromIssue(linkId: number): Promise<boolean> {
    const result = await db
      .delete(links)
      .where(eq(links.id, linkId))
      .returning({ id: links.id });
    
    return result.length > 0;
  }
}

// Use database storage
export const storage = new DatabaseStorage();
