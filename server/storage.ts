import { users, chatMessages, bookings, contactMessages, blogPosts, inventoryItems, inventoryMovements, faqs, faqVotes, promotions, promotionUsages, newsletters, type User, type InsertUser, type ChatMessage, type InsertChatMessage, type Booking, type InsertBooking, type ContactMessage, type InsertContactMessage, type BlogPost, type InsertBlogPost, type InventoryItem, type InsertInventoryItem, type InventoryMovement, type InsertInventoryMovement, type Faq, type InsertFaq, type FaqVote, type InsertFaqVote, type Promotion, type InsertPromotion, type PromotionUsage, type InsertPromotionUsage, type Newsletter, type InsertNewsletter } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, sql, like, ilike } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Booking methods
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(insertBooking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // Contact methods
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(insertContact: InsertContactMessage): Promise<ContactMessage>;
  markContactAsRead(id: number): Promise<boolean>;
  
  // Additional user methods
  getUserByEmail(email: string): Promise<User | undefined>;
  setResetToken(userId: number, token: string, expiry: Date): Promise<boolean>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearResetToken(userId: number): Promise<boolean>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markContactMessageAsRead(id: number): Promise<boolean>;
  getChatMessagesByUser(userId: number): Promise<ChatMessage[]>;
  
  // Chat methods
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage>;
  
  // Blog methods
  getBlogPosts(limit?: number, category?: string): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Inventory methods
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  addInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  getInventoryMovements(itemId?: number): Promise<InventoryMovement[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  
  // FAQ methods
  getFaqs(category?: string): Promise<Faq[]>;
  getFaq(id: number): Promise<Faq | undefined>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: number, faqData: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: number): Promise<boolean>;
  incrementFaqView(id: number): Promise<void>;
  voteFaq(faqId: number, userId: number, helpful: boolean): Promise<boolean>;
  getFaqVote(faqId: number, userId: number): Promise<FaqVote | undefined>;
  
  // Promotion methods
  getActivePromotion(): Promise<Promotion | undefined>;
  applyPromotion(promotionId: number, bookingId: number, userId: number, discountAmount: number): Promise<PromotionUsage>;
  incrementPromotionUsage(promotionId: number): Promise<void>;
  
  // Newsletter methods
  subscribeToNewsletter(email: string, name?: string): Promise<Newsletter>;
  unsubscribeFromNewsletter(email: string): Promise<boolean>;
  getNewsletterSubscriber(email: string): Promise<Newsletter | undefined>;
  getAllNewsletterSubscribers(): Promise<Newsletter[]>;
  getActiveNewsletterSubscribers(): Promise<Newsletter[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async setResetToken(userId: number, token: string, expiry: Date): Promise<boolean> {
    try {
      await db.update(users)
        .set({ resetToken: token, resetTokenExpiry: expiry })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(and(
        eq(users.resetToken, token),
        sql`${users.resetTokenExpiry} > NOW()`
      ));
    return user || undefined;
  }

  async clearResetToken(userId: number): Promise<boolean> {
    try {
      await db.update(users)
        .set({ resetToken: null, resetTokenExpiry: null })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings).set(bookingData).where(eq(bookings.id, id)).returning();
    return booking || undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    try {
      await db.delete(bookings).where(eq(bookings.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Contact methods
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(insertContact: InsertContactMessage): Promise<ContactMessage> {
    const [contact] = await db.insert(contactMessages).values(insertContact).returning();
    return contact;
  }

  async markContactAsRead(id: number): Promise<boolean> {
    try {
      await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async markContactMessageAsRead(id: number): Promise<boolean> {
    try {
      await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async getChatMessagesByUser(userId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(asc(chatMessages.createdAt));
  }

  // Chat methods
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  // Blog methods
  async getBlogPosts(limit?: number, category?: string): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (category) {
      query = query.where(eq(blogPosts.category, category));
    }
    
    query = query.orderBy(desc(blogPosts.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async updateBlogPost(id: number, postData: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db.update(blogPosts).set(postData).where(eq(blogPosts.id, id)).returning();
    return post || undefined;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    try {
      await db.delete(blogPosts).where(eq(blogPosts.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Inventory methods
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).orderBy(asc(inventoryItems.name));
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventoryItems).values(insertItem).returning();
    return item;
  }

  async updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [item] = await db.update(inventoryItems).set(itemData).where(eq(inventoryItems.id, id)).returning();
    return item || undefined;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    try {
      await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async addInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [newMovement] = await db.insert(inventoryMovements).values(movement).returning();
    
    if (movement.itemId) {
      const item = await this.getInventoryItem(movement.itemId);
      if (item) {
        let newQuantity = item.currentQuantity;
        if (movement.type === 'in') {
          newQuantity += movement.quantity;
        } else if (movement.type === 'out' || movement.type === 'damaged') {
          newQuantity -= movement.quantity;
        }
        await this.updateInventoryItem(movement.itemId, { currentQuantity: newQuantity });
      }
    }
    
    return newMovement;
  }

  async getInventoryMovements(itemId?: number): Promise<InventoryMovement[]> {
    try {
      if (itemId) {
        return await db.select().from(inventoryMovements)
          .where(eq(inventoryMovements.itemId, itemId))
          .orderBy(desc(inventoryMovements.createdAt));
      } else {
        return await db.select().from(inventoryMovements)
          .orderBy(desc(inventoryMovements.createdAt));
      }
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      return [];
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      return await db.select().from(inventoryItems)
        .where(sql`current_quantity <= minimum_quantity`);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  }

  // FAQ methods
  async getFaqs(category?: string): Promise<Faq[]> {
    try {
      if (category) {
        return await db.select().from(faqs)
          .where(and(eq(faqs.isActive, true), eq(faqs.category, category)))
          .orderBy(asc(faqs.sortOrder));
      } else {
        return await db.select().from(faqs)
          .where(eq(faqs.isActive, true))
          .orderBy(asc(faqs.sortOrder));
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  }

  async getFaq(id: number): Promise<Faq | undefined> {
    try {
      const [faq] = await db.select().from(faqs).where(eq(faqs.id, id));
      return faq;
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
      const [updatedFaq] = await db.update(faqs)
        .set(faqData)
        .where(eq(faqs.id, id))
        .returning();
      return updatedFaq;
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

  async incrementFaqView(id: number): Promise<void> {
    await db.update(faqs)
      .set({ viewCount: sql`${faqs.viewCount} + 1` })
      .where(eq(faqs.id, id));
  }

  async voteFaq(faqId: number, userId: number, helpful: boolean): Promise<boolean> {
    try {
      const existingVote = await this.getFaqVote(faqId, userId);
      
      if (existingVote) {
        await db.update(faqVotes)
          .set({ isHelpful: helpful })
          .where(and(eq(faqVotes.faqId, faqId), eq(faqVotes.userId, userId)));
      } else {
        await db.insert(faqVotes).values({
          faqId,
          userId,
          isHelpful: helpful
        });
      }
      
      const votes = await db.select().from(faqVotes).where(eq(faqVotes.faqId, faqId));
      const helpfulCount = votes.filter(v => v.isHelpful).length;
      const notHelpfulCount = votes.filter(v => !v.isHelpful).length;
      
      await db.update(faqs)
        .set({ 
          helpfulVotes: helpfulCount,
          notHelpfulVotes: notHelpfulCount
        })
        .where(eq(faqs.id, faqId));
      
      return true;
    } catch (error) {
      console.error('Error voting on FAQ:', error);
      return false;
    }
  }

  async getFaqVote(faqId: number, userId: number): Promise<FaqVote | undefined> {
    const [vote] = await db.select().from(faqVotes)
      .where(and(eq(faqVotes.faqId, faqId), eq(faqVotes.userId, userId)));
    return vote;
  }

  // Promotion methods
  async getActivePromotion(): Promise<Promotion | undefined> {
    const [promotion] = await db.select().from(promotions)
      .where(and(
        eq(promotions.isActive, true),
        sql`${promotions.currentUsages} < ${promotions.maxUsages}`
      ))
      .orderBy(asc(promotions.createdAt))
      .limit(1);
    return promotion;
  }

  async applyPromotion(promotionId: number, bookingId: number, userId: number, discountAmount: number): Promise<PromotionUsage> {
    const [usage] = await db.insert(promotionUsages).values({
      promotionId,
      bookingId,
      userId,
      discountAmount
    }).returning();
    return usage;
  }

  async incrementPromotionUsage(promotionId: number): Promise<void> {
    await db.update(promotions)
      .set({ currentUsages: sql`${promotions.currentUsages} + 1` })
      .where(eq(promotions.id, promotionId));
  }

  // Metodi aggiuntivi richiesti dall'interfaccia
  async searchFaqs(query: string): Promise<Faq[]> {
    return await db.select().from(faqs)
      .where(and(
        eq(faqs.isPublished, true),
        or(
          ilike(faqs.question, `%${query}%`),
          ilike(faqs.answer, `%${query}%`)
        )
      ))
      .orderBy(desc(faqs.priority), desc(faqs.createdAt));
  }

  async incrementFaqViews(faqId: number): Promise<void> {
    await db.update(faqs)
      .set({ viewCount: sql`${faqs.viewCount} + 1` })
      .where(eq(faqs.id, faqId));
  }

  async incrementFaqView(faqId: number): Promise<void> {
    await this.incrementFaqViews(faqId);
  }

  async incrementBlogPostViews(postId: number): Promise<void> {
    await db.update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, postId));
  }

  // Newsletter methods
  async subscribeToNewsletter(email: string, name?: string): Promise<Newsletter> {
    try {
      const [subscriber] = await db
        .insert(newsletters)
        .values({ 
          email, 
          name: name || null,
          isActive: true 
        })
        .returning();
      return subscriber;
    } catch (error) {
      // Se l'email esiste già, riattiva la sottoscrizione
      const [existing] = await db
        .update(newsletters)
        .set({ 
          isActive: true, 
          unsubscribedAt: null,
          name: name || undefined
        })
        .where(eq(newsletters.email, email))
        .returning();
      return existing;
    }
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const result = await db
      .update(newsletters)
      .set({ 
        isActive: false, 
        unsubscribedAt: new Date() 
      })
      .where(eq(newsletters.email, email))
      .returning();
    return result.length > 0;
  }

  async getNewsletterSubscriber(email: string): Promise<Newsletter | undefined> {
    const [subscriber] = await db
      .select()
      .from(newsletters)
      .where(eq(newsletters.email, email));
    return subscriber || undefined;
  }

  async getAllNewsletterSubscribers(): Promise<Newsletter[]> {
    return await db
      .select()
      .from(newsletters)
      .orderBy(desc(newsletters.subscribedAt));
  }

  async getActiveNewsletterSubscribers(): Promise<Newsletter[]> {
    return await db
      .select()
      .from(newsletters)
      .where(eq(newsletters.isActive, true))
      .orderBy(desc(newsletters.subscribedAt));
  }
}

export const storage = new DatabaseStorage();