import { users, bookings, contactMessages, chatMessages, blogPosts, inventoryItems, inventoryMovements, faqs, faqVotes } from "@shared/schema";
import { eq, and, gte, lte, desc, lt, ilike, or, sql } from "drizzle-orm";
import { db } from "./db";
import type { 
  User, InsertUser, Booking, InsertBooking, ContactMessage, InsertContactMessage, 
  ChatMessage, InsertChatMessage, BlogPost, InsertBlogPost, InventoryItem, 
  InsertInventoryItem, InventoryMovement, InsertInventoryMovement, Faq, InsertFaq,
  FaqVote, InsertFaqVote
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Operazioni sugli utenti
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Operazioni per il reset password
  setResetToken(email: string, token: string, expiry: Date): Promise<boolean>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearResetToken(userId: number): Promise<boolean>;
  
  // Operazioni sulle prenotazioni
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Operazioni sui messaggi di contatto
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  getUnreadContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markContactMessageAsRead(id: number): Promise<boolean>;
  deleteContactMessage(id: number): Promise<boolean>;
  
  // Operazioni sui messaggi di chat
  getChatMessagesByUser(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Operazioni sui post del blog
  getBlogPosts(limit?: number, category?: string): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  incrementBlogPostViews(id: number): Promise<boolean>;
  
  // Operazioni inventario
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  addInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getInventoryMovements(itemId?: number): Promise<InventoryMovement[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  
  // Operazioni FAQ
  getFaqs(category?: string): Promise<Faq[]>;
  getFaq(id: number): Promise<Faq | undefined>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: number, faq: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: number): Promise<boolean>;
  incrementFaqViews(id: number): Promise<boolean>;
  voteFaq(faqId: number, userId: number, isHelpful: boolean): Promise<boolean>;
  searchFaqs(query: string): Promise<Faq[]>;
  
  // Sessioni per l'autenticazione
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
  
  // Implementazioni dei metodi per la chat
  async getChatMessagesByUser(userId: number): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }
  
  // Implementazioni delle operazioni sugli utenti
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
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true; // In PostgreSQL, delete non restituisce il conteggio delle righe eliminate
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
    try {
      await db.update(users)
        .set({ 
          resetToken: token, 
          resetTokenExpiry: expiry 
        })
        .where(eq(users.email, email));
      return true;
    } catch (error) {
      console.error("Error setting reset token:", error);
      return false;
    }
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.resetToken, token));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by reset token:", error);
      return undefined;
    }
  }

  async clearResetToken(userId: number): Promise<boolean> {
    try {
      await db.update(users)
        .set({ 
          resetToken: null, 
          resetTokenExpiry: null 
        })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error("Error clearing reset token:", error);
      return false;
    }
  }
  
  // Implementazioni delle operazioni sulle prenotazioni
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }
  
  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.startDate, startDate),
          lte(bookings.endDate, endDate)
        )
      );
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }
  
  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }
  
  async deleteBooking(id: number): Promise<boolean> {
    await db.delete(bookings).where(eq(bookings.id, id));
    return true;
  }
  
  // Implementazioni delle operazioni sui messaggi di contatto
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }
  
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages);
  }
  
  async getUnreadContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).where(eq(contactMessages.read, false));
  }
  
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }
  
  async markContactMessageAsRead(id: number): Promise<boolean> {
    await db
      .update(contactMessages)
      .set({ read: true })
      .where(eq(contactMessages.id, id));
    return true;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return true;
  }

  // === BLOG METHODS ===
  async getBlogPosts(limit?: number, category?: string): Promise<BlogPost[]> {
    try {
      if (category) {
        if (limit) {
          return await db.select().from(blogPosts)
            .where(and(eq(blogPosts.status, 'published'), eq(blogPosts.category, category)))
            .orderBy(desc(blogPosts.createdAt))
            .limit(limit);
        }
        return await db.select().from(blogPosts)
          .where(and(eq(blogPosts.status, 'published'), eq(blogPosts.category, category)))
          .orderBy(desc(blogPosts.createdAt));
      }
      
      if (limit) {
        return await db.select().from(blogPosts)
          .where(eq(blogPosts.status, 'published'))
          .orderBy(desc(blogPosts.createdAt))
          .limit(limit);
      }
      
      return await db.select().from(blogPosts)
        .where(eq(blogPosts.status, 'published'))
        .orderBy(desc(blogPosts.createdAt));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    try {
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
      return post || undefined;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return undefined;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
      return post || undefined;
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      return undefined;
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    try {
      const [updatedPost] = await db
        .update(blogPosts)
        .set({ ...postData, updatedAt: new Date() })
        .where(eq(blogPosts.id, id))
        .returning();
      return updatedPost || undefined;
    } catch (error) {
      console.error('Error updating blog post:', error);
      return undefined;
    }
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      await db.delete(blogPosts).where(eq(blogPosts.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  async incrementBlogPostViews(id: number): Promise<boolean> {
    try {
      await db
        .update(blogPosts)
        .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
        .where(eq(blogPosts.id, id));
      return true;
    } catch (error) {
      console.error('Error incrementing blog post views:', error);
      return false;
    }
  }

  // === INVENTORY METHODS ===
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      return await db.select().from(inventoryItems).orderBy(inventoryItems.name);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    try {
      const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
      return item || undefined;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return undefined;
    }
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    try {
      const [updatedItem] = await db
        .update(inventoryItems)
        .set({ ...itemData, lastChecked: new Date() })
        .where(eq(inventoryItems.id, id))
        .returning();
      return updatedItem || undefined;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      return undefined;
    }
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    try {
      await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      return false;
    }
  }

  async addInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [newMovement] = await db.insert(inventoryMovements).values(movement).returning();
    
    const item = await this.getInventoryItem(movement.itemId);
    if (item) {
      let newQuantity = item.currentQuantity;
      if (movement.type === 'in') {
        newQuantity += movement.quantity;
      } else if (movement.type === 'out' || movement.type === 'damaged') {
        newQuantity -= movement.quantity;
      }
      
      if (movement.itemId) {
        await this.updateInventoryItem(movement.itemId, { currentQuantity: newQuantity });
      }
    }
    
    return newMovement;
  }

  async getInventoryMovements(itemId?: number): Promise<InventoryMovement[]> {
    try {
      let query = db.select().from(inventoryMovements).orderBy(desc(inventoryMovements.createdAt));
      
      if (itemId) {
        query = query.where(eq(inventoryMovements.itemId, itemId));
      }
      
      return await query;
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      return [];
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      return await db
        .select()
        .from(inventoryItems)
        .where(sql`${inventoryItems.currentQuantity} <= ${inventoryItems.minimumQuantity}`);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  }

  // === FAQ METHODS ===
  async getFaqs(category?: string): Promise<Faq[]> {
    try {
      let query = db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.sortOrder, faqs.id);
      
      if (category) {
        query = query.where(and(eq(faqs.isActive, true), eq(faqs.category, category)));
      }
      
      return await query;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  }

  async getFaq(id: number): Promise<Faq | undefined> {
    try {
      const [faq] = await db.select().from(faqs).where(eq(faqs.id, id));
      return faq || undefined;
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      return undefined;
    }
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const [newFaq] = await db.insert(faqs).values(faq).returning();
    return newFaq;
  }

  async updateFaq(id: number, faqData: Partial<InsertFaq>): Promise<Faq | undefined> {
    try {
      const [updatedFaq] = await db
        .update(faqs)
        .set({ ...faqData, updatedAt: new Date() })
        .where(eq(faqs.id, id))
        .returning();
      return updatedFaq || undefined;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      return undefined;
    }
  }

  async deleteFaq(id: number): Promise<boolean> {
    try {
      await db.delete(faqs).where(eq(faqs.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      return false;
    }
  }

  async incrementFaqViews(id: number): Promise<boolean> {
    try {
      await db
        .update(faqs)
        .set({ viewCount: sql`${faqs.viewCount} + 1` })
        .where(eq(faqs.id, id));
      return true;
    } catch (error) {
      console.error('Error incrementing FAQ views:', error);
      return false;
    }
  }

  async voteFaq(faqId: number, userId: number, isHelpful: boolean): Promise<boolean> {
    try {
      const [existingVote] = await db
        .select()
        .from(faqVotes)
        .where(and(eq(faqVotes.faqId, faqId), eq(faqVotes.userId, userId)));

      if (existingVote) {
        await db
          .update(faqVotes)
          .set({ isHelpful })
          .where(eq(faqVotes.id, existingVote.id));
      } else {
        await db.insert(faqVotes).values({ faqId, userId, isHelpful });
      }

      const helpfulCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(faqVotes)
        .where(and(eq(faqVotes.faqId, faqId), eq(faqVotes.isHelpful, true)));

      const notHelpfulCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(faqVotes)
        .where(and(eq(faqVotes.faqId, faqId), eq(faqVotes.isHelpful, false)));

      await db
        .update(faqs)
        .set({
          helpfulVotes: helpfulCount[0]?.count || 0,
          notHelpfulVotes: notHelpfulCount[0]?.count || 0
        })
        .where(eq(faqs.id, faqId));

      return true;
    } catch (error) {
      console.error('Error voting on FAQ:', error);
      return false;
    }
  }

  async searchFaqs(query: string): Promise<Faq[]> {
    try {
      return await db
        .select()
        .from(faqs)
        .where(
          and(
            eq(faqs.isActive, true),
            or(
              ilike(faqs.question, `%${query}%`),
              ilike(faqs.answer, `%${query}%`)
            )
          )
        )
        .orderBy(faqs.sortOrder, faqs.id);
    } catch (error) {
      console.error('Error searching FAQs:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
