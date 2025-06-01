import { pgTable, serial, text, varchar, boolean, timestamp, integer, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema per gli utenti
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull().default(""),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: timestamp("date_of_birth"),
  privacyAccepted: boolean("privacy_accepted").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema per le prenotazioni
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  guestName: varchar("guest_name", { length: 100 }).notNull(),
  guestEmail: varchar("guest_email", { length: 100 }).notNull(),
  guestPhone: varchar("guest_phone", { length: 50 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  numberOfGuests: integer("number_of_guests").notNull().default(2),
  totalPrice: real("total_price").notNull().default(0),
  status: varchar("status", { length: 20 }).default("pending"),
  source: varchar("source", { length: 20 }).default("website"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema per i messaggi di contatto
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema per i post del blog
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  category: varchar("category", { length: 50 }).default("news"),
  status: varchar("status", { length: 20 }).default("published"), // draft, published
  authorId: serial("author_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema per la gestione inventario
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  currentQuantity: integer("current_quantity").notNull().default(0),
  minimumQuantity: integer("minimum_quantity").notNull().default(1),
  location: varchar("location", { length: 100 }),
  notes: text("notes"),
  lastChecked: timestamp("last_checked").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema per movimenti inventario
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  itemId: serial("item_id").references(() => inventoryItems.id),
  type: varchar("type", { length: 20 }).notNull(), // in, out, damaged, maintenance
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  userId: serial("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema per FAQ
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 50 }).default("general"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  viewCount: integer("view_count").default(0),
  helpfulVotes: integer("helpful_votes").default(0),
  notHelpfulVotes: integer("not_helpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema per voti FAQ
export const faqVotes = pgTable("faq_votes", {
  id: serial("id").primaryKey(),
  faqId: serial("faq_id").references(() => faqs.id),
  userId: serial("user_id").references(() => users.id),
  isHelpful: boolean("is_helpful").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relazioni tra le tabelle
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isFromAdmin: boolean("is_from_admin").notNull().default(false),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  chatMessages: many(chatMessages),
  blogPosts: many(blogPosts),
  inventoryMovements: many(inventoryMovements),
  faqVotes: many(faqVotes),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ many }) => ({
  movements: many(inventoryMovements),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  item: one(inventoryItems, {
    fields: [inventoryMovements.itemId],
    references: [inventoryItems.id],
  }),
  user: one(users, {
    fields: [inventoryMovements.userId],
    references: [users.id],
  }),
}));

export const faqsRelations = relations(faqs, ({ many }) => ({
  votes: many(faqVotes),
}));

export const faqVotesRelations = relations(faqVotes, ({ one }) => ({
  faq: one(faqs, {
    fields: [faqVotes.faqId],
    references: [faqs.id],
  }),
  user: one(users, {
    fields: [faqVotes.userId],
    references: [users.id],
  }),
}));

// Schemi di inserimento usando Zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true }).extend({
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: "Devi accettare il trattamento dei dati personali per procedere"
  })
});
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, read: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, createdAt: true, lastChecked: true });
export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({ id: true, createdAt: true });
export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true, helpfulVotes: true, notHelpfulVotes: true });
export const insertFaqVoteSchema = createInsertSchema(faqVotes).omit({ id: true, createdAt: true });

// Tipi di inferenza per le operazioni del database
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type FaqVote = typeof faqVotes.$inferSelect;
export type InsertFaqVote = z.infer<typeof insertFaqVoteSchema>;

// Schema per le promozioni sconto 10%
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountPercentage: integer("discount_percentage").notNull().default(10),
  maxUsages: integer("max_usages").notNull().default(20),
  currentUsages: integer("current_usages").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Schema per tenere traccia degli utilizzi delle promozioni
export const promotionUsages = pgTable("promotion_usages", {
  id: serial("id").primaryKey(),
  promotionId: serial("promotion_id").references(() => promotions.id),
  bookingId: serial("booking_id").references(() => bookings.id),
  userId: serial("user_id").references(() => users.id),
  discountAmount: real("discount_amount").notNull(),
  usedAt: timestamp("used_at").defaultNow(),
});

// Schema Zod per le promozioni
export const insertPromotionSchema = createInsertSchema(promotions);
export const insertPromotionUsageSchema = createInsertSchema(promotionUsages);

// Tipi TypeScript per le promozioni
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type PromotionUsage = typeof promotionUsages.$inferSelect;
export type InsertPromotionUsage = z.infer<typeof insertPromotionUsageSchema>;
