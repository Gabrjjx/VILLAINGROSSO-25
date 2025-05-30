import { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { type InsertBooking, type InsertContactMessage } from "@shared/schema";
import { log } from "./vite";
import { 
  sendEmail, 
  createContactNotificationEmail, 
  createBookingConfirmationEmail,
  sendWelcomeEmail,
  addToNewsletter,
  sendNewsletter,
  sendSMS
} from "./sendgrid";

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
      
      // Invia notifica email al proprietario
      try {
        const emailData = createContactNotificationEmail(
          contactData.name,
          contactData.email,
          contactData.message
        );
        await sendEmail(emailData);
        log(`Contact notification email sent for message ${newMessage.id}`, "info");
      } catch (emailError) {
        log(`Failed to send contact notification email: ${emailError}`, "error");
        // Non blocchiamo la risposta se l'email fallisce
      }
      
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

  // API per inviare email di conferma prenotazione
  app.post("/api/send-booking-confirmation", async (req: Request, res: Response) => {
    try {
      const { guestEmail, guestName, checkIn, checkOut, guests } = req.body;
      
      if (!guestEmail || !guestName || !checkIn || !checkOut || !guests) {
        return res.status(400).json({
          success: false,
          error: "Missing required booking information"
        });
      }
      
      const emailData = createBookingConfirmationEmail(
        guestEmail,
        guestName,
        checkIn,
        checkOut,
        guests
      );
      
      const emailSent = await sendEmail(emailData);
      
      if (emailSent) {
        log(`Booking confirmation email sent to ${guestEmail}`, "info");
        res.json({
          success: true,
          message: "Booking confirmation email sent successfully"
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to send booking confirmation email"
        });
      }
    } catch (error) {
      log(`Error sending booking confirmation email: ${error}`, "error");
      res.status(500).json({
        success: false,
        error: "Failed to send booking confirmation email"
      });
    }
  });

  // API per testare l'invio di email
  app.post("/api/test-email", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const { to, subject, message } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({
          success: false,
          error: "Missing required email fields"
        });
      }
      
      const emailSent = await sendEmail({
        to,
        from: 'g.ingrosso@villaingrosso.com',
        subject,
        text: message,
        html: `<p>${message}</p>`
      });
      
      if (emailSent) {
        res.json({
          success: true,
          message: "Test email sent successfully"
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to send test email"
        });
      }
    } catch (error) {
      log(`Error sending test email: ${error}`, "error");
      res.status(500).json({
        success: false,
        error: "Failed to send test email"
      });
    }
  });

  // Email di benvenuto per nuovi ospiti
  app.post("/api/send-welcome-email", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      const success = await sendWelcomeEmail(email, name);
      
      if (success) {
        res.json({ success: true, message: "Welcome email sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send welcome email" });
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Iscrizione alla newsletter
  app.post("/api/newsletter/subscribe", async (req: Request, res: Response) => {
    try {
      const { email, firstName } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const success = await addToNewsletter(email, firstName || '');
      
      if (success) {
        res.json({ success: true, message: "Successfully subscribed to newsletter" });
      } else {
        res.status(500).json({ success: false, message: "Failed to subscribe to newsletter" });
      }
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Invio newsletter (solo admin)
  app.post("/api/newsletter/send", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { subject, content, listId } = req.body;
      
      if (!subject || !content) {
        return res.status(400).json({ error: "Subject and content are required" });
      }

      const success = await sendNewsletter(subject, content, listId);
      
      if (success) {
        res.json({ success: true, message: "Newsletter sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send newsletter" });
      }
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Invio WhatsApp (solo admin)
  app.post("/api/send-sms", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: "Phone number and message are required" });
      }

      // Ora invia via WhatsApp invece di SMS
      const success = await sendSMS(phoneNumber, message);
      
      if (success) {
        res.json({ success: true, message: "WhatsApp message sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send WhatsApp message. Check Twilio configuration." });
      }
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Invio WhatsApp di conferma prenotazione
  app.post("/api/send-booking-whatsapp", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, guestName, checkIn, checkOut } = req.body;

      if (!phoneNumber || !guestName || !checkIn || !checkOut) {
        return res.status(400).json({ 
          success: false, 
          message: "Dati mancanti per l'invio WhatsApp" 
        });
      }

      const { createBookingConfirmationWhatsApp } = await import('./sendgrid');
      const whatsappMessage = createBookingConfirmationWhatsApp(guestName, checkIn, checkOut);
      const success = await sendSMS(phoneNumber, whatsappMessage);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "WhatsApp di conferma prenotazione inviato" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Errore nell'invio WhatsApp di conferma" 
        });
      }
    } catch (error) {
      console.error('Booking WhatsApp error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Errore interno del server" 
      });
    }
  });

  // Invio WhatsApp di benvenuto
  app.post("/api/send-welcome-whatsapp", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, guestName } = req.body;

      if (!phoneNumber || !guestName) {
        return res.status(400).json({ 
          success: false, 
          message: "Numero WhatsApp e nome ospite richiesti" 
        });
      }

      const { createWelcomeWhatsApp } = await import('./sendgrid');
      const whatsappMessage = createWelcomeWhatsApp(guestName);
      const success = await sendSMS(phoneNumber, whatsappMessage);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "WhatsApp di benvenuto inviato" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Errore nell'invio WhatsApp di benvenuto" 
        });
      }
    } catch (error) {
      console.error('Welcome WhatsApp error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Errore interno del server" 
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
  
  // Endpoint per gli amministratori per ottenere i messaggi di chat di un utente specifico
  app.get("/api/admin/chat-messages/:userId", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(401).json({ error: "Admin privileges required" });
    }
    
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getChatMessagesByUser(userId);
      res.json(messages);
    } catch (error) {
      log(`Error fetching admin chat messages: ${error}`, "error");
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

  // Endpoint per calcolare distanze reali tramite Google Maps API
  app.post("/api/calculate-distances", async (req: Request, res: Response) => {
    try {
      const { origin, destinations } = req.body;
      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps API key not configured" });
      }

      const origins = `${origin.lat},${origin.lng}`;
      const destinationsString = destinations.map((dest: any) => 
        `${dest.lat},${dest.lng}`
      ).join('|');

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinationsString}&units=metric&mode=driving&language=it&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        res.json(data);
      } else {
        res.status(400).json({ error: `Google Maps API error: ${data.status}` });
      }
    } catch (error) {
      console.error("Error calculating distances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Importa gli schemi e il database per le query dirette nelle API admin
import * as schema from "@shared/schema";
import { db } from "./db";
