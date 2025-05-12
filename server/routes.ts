import { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { type InsertBooking, type InsertContactMessage } from "@shared/schema";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware già configurati nel file index.ts
  
  // Configurazione dell'autenticazione
  setupAuth(app);
  
  // Middleware di debug per sessioni e autenticazione
  app.use((req, res, next) => {
    log(`[Session Debug] Path: ${req.path}, isAuthenticated: ${req.isAuthenticated()}, SessionID: ${req.sessionID}`, "info");
    if (req.isAuthenticated()) {
      log(`[Session Debug] User: ${req.user?.username}, UserID: ${req.user?.id}`, "info");
    }
    next();
  });

  // API per i messaggi di contatto
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactData = req.body as InsertContactMessage;
      const newMessage = await storage.createContactMessage(contactData);
      res.status(201).json({
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
        id: newMessage.id
      });
    } catch (error) {
      log(`Error saving contact message: ${error}`, "error");
      res.status(500).json({
        success: false,
        error: "Failed to save your message. Please try again later."
      });
    }
  });

  // API per le prenotazioni (richiede autenticazione)
  app.get("/api/bookings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const userId = (req.user as Express.User).id;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      log(`Error fetching bookings: ${error}`, "error");
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const bookingData = req.body as InsertBooking;
      bookingData.userId = (req.user as Express.User).id;
      
      const newBooking = await storage.createBooking(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      log(`Error creating booking: ${error}`, "error");
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // API per gli amministratori
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    // La verifica dei permessi avviene nel middleware /api/admin in auth.ts
    try {
      const users = await db.select().from(schema.users);
      // Rimuovi le password dalla risposta
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      log(`Error fetching users: ${error}`, "error");
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/bookings", async (req: Request, res: Response) => {
    try {
      const bookings = await db.select().from(schema.bookings);
      res.json(bookings);
    } catch (error) {
      log(`Error fetching all bookings: ${error}`, "error");
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/messages", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      log(`Error fetching messages: ${error}`, "error");
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.patch("/api/admin/messages/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markContactMessageAsRead(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Message not found" });
      }
    } catch (error) {
      log(`Error marking message as read: ${error}`, "error");
      res.status(500).json({ error: "Failed to update message" });
    }
  });

  // Endpoints per la chat
  app.get("/api/chat-messages", async (req: Request, res: Response) => {
    log(`GET /api/chat-messages - isAuthenticated: ${req.isAuthenticated()}`, "info");
    console.log("GET /api/chat-messages - Headers:", req.headers);
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      log(`Fetching chat messages for user ID: ${req.user.id}`, "info");
      const messages = await storage.getChatMessagesByUser(req.user.id);
      log(`Found ${messages.length} messages`, "info");
      res.json(messages);
    } catch (error) {
      log(`Error fetching chat messages: ${error}`, "error");
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });
  
  app.post("/api/chat-messages", async (req: Request, res: Response) => {
    log(`POST /api/chat-messages - isAuthenticated: ${req.isAuthenticated()} - body: ${JSON.stringify(req.body)}`, "info");
    console.log("POST /api/chat-messages - Headers:", req.headers);
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      log(`Creating chat message for user ID: ${req.user.id} - message: ${req.body.message}`, "info");
      const newMessage = await storage.createChatMessage({
        userId: req.user.id,
        isFromAdmin: false,
        message: req.body.message,
      });
      
      log(`Created new message with ID: ${newMessage.id}`, "info");
      res.status(201).json(newMessage);
    } catch (error) {
      log(`Error creating chat message: ${error}`, "error");
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  
  // Endpoint per gli amministratori per rispondere ai messaggi di chat
  app.post("/api/admin/chat-messages/:userId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ error: "Admin privileges required" });
    }
    
    try {
      const userId = parseInt(req.params.userId);
      const newMessage = await storage.createChatMessage({
        userId,
        isFromAdmin: true,
        message: req.body.message,
      });
      
      res.status(201).json(newMessage);
    } catch (error) {
      log(`Error creating admin chat message: ${error}`, "error");
      res.status(500).json({ error: "Failed to send admin message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Importa gli schemi e il database per le query dirette nelle API admin
import * as schema from "@shared/schema";
import { db } from "./db";
