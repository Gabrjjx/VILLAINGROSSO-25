import { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  type InsertBooking, 
  type InsertContactMessage, 
  type InsertBlogPost,
  type InsertInventoryItem,
  type InsertInventoryMovement,
  type InsertFaq,
  type InsertFaqVote,
  insertBlogPostSchema,
  insertInventoryItemSchema,
  insertInventoryMovementSchema,
  insertFaqSchema,
  insertFaqVoteSchema
} from "@shared/schema";
import { log } from "./vite";
import { 
  sendEmail as sendEmailSendGrid,
  createContactNotificationEmail, 
  createBookingConfirmationEmail,
  sendWelcomeEmail as sendWelcomeEmailOld,
  addToNewsletter,
  sendNewsletter,
  sendSMS
} from "./sendgrid";
import { 
  sendEmail as sendEmailBird, 
  createPasswordResetEmail,
  sendWelcomeEmail,
  sendNewUserNotificationEmail,
  sendBookingConfirmationEmail as sendBookingConfirmationEmailBird,
  sendContactNotificationEmail,
  sendNewsletterEmail,
  sendPasswordResetEmail
} from "./bird";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware SEO per redirect WWW e canonical URLs
  app.use((req, res, next) => {
    const host = req.get('host');
    const protocol = req.header('x-forwarded-proto') || req.protocol || 'http';
    
    // Redirect da non-www a www per villaingrosso.com
    if (host && host === 'villaingrosso.com') {
      return res.redirect(301, `${protocol}://www.villaingrosso.com${req.url}`);
    }
    
    // Force HTTPS redirect per domini di produzione
    if (protocol === 'http' && host && host.includes('villaingrosso.com')) {
      return res.redirect(301, `https://${host}${req.url}`);
    }
    
    next();
  });

  // Security headers middleware
  app.use((req, res, next) => {
    // HSTS Header
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://maps.googleapis.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: http:; " +
      "connect-src 'self' https://maps.googleapis.com; " +
      "frame-src https://www.google.com;"
    );
    
    next();
  });

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
        await sendEmailSendGrid(emailData);
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
      
      const emailSent = await sendEmailSendGrid(emailData);
      
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
      
      const emailSent = await sendEmailSendGrid({
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

  // Email di benvenuto per nuovi ospiti (usando Bird API)
  app.post("/api/send-welcome-email", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      // Usa Bird API per inviare email di benvenuto
      const { sendEmail, createWelcomeEmail } = await import('./bird');
      const welcomeEmailContent = createWelcomeEmail(
        name, 
        email, 
        'https://villaingrosso.com'
      );
      const success = await sendEmail(email, '🏖️ Benvenuto in Villa Ingrosso - La tua casa vacanze in Puglia', welcomeEmailContent);
      
      if (success) {
        res.json({ success: true, message: "Welcome email sent successfully via Bird API" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send welcome email via Bird API" });
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Newsletter temporaneamente disabilitata
  app.post("/api/newsletter/subscribe", async (req: Request, res: Response) => {
    try {
      const { email, firstName } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Valida formato email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Log per tracking temporaneo
      console.log('NEWSLETTER_SUBSCRIPTION:', {
        email,
        firstName: firstName || 'Non specificato',
        timestamp: new Date().toISOString()
      });

      // Risposta temporanea di successo
      res.json({ 
        success: true, 
        message: "Newsletter subscription received. You will be contacted soon." 
      });
      
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error"
      });
    }
  });

  // Test endpoint semplificato per debug newsletter
  app.post("/api/newsletter-debug", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      console.log('Debug newsletter endpoint called with:', email);
      
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      // Test molto semplice - usa la stessa funzione delle altre email che funzionano
      const birdModule = await import('./bird');
      
      // Usa direttamente sendWelcomeEmail che sappiamo funzionare
      const result = await birdModule.sendWelcomeEmail(email, "Test User", "temppass123");
      console.log('sendWelcomeEmail result:', result);
      
      res.json({ 
        success: result, 
        message: result ? "Test email sent" : "Test email failed",
        endpoint: "newsletter-debug"
      });
      
    } catch (error: any) {
      console.error("Newsletter debug error:", error);
      res.status(500).json({ 
        error: "Debug test failed", 
        details: error?.message || 'Unknown error' 
      });
    }
  });

  // Invio newsletter (solo admin) - usando Bird API
  app.post("/api/newsletter/send", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { subject, content, recipients } = req.body;
      
      if (!subject || !content || !recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ error: "Subject, content and recipients array are required" });
      }

      // Usa Bird API per inviare newsletter a lista di email
      const { sendEmail } = await import('./bird');
      
      // Invia email a tutti i destinatari
      let successCount = 0;
      let failureCount = 0;
      
      for (const email of recipients) {
        try {
          const newsletterHtml = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50;
            background: #f8fafc;
            padding: 20px;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #1976d2 0%, #0288d1 50%, #00acc1 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content { 
            padding: 30px;
        }
        .footer { 
            background: #f1f3f4;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🏖️ Villa Ingrosso</h1>
            <p>Newsletter</p>
        </div>
        
        <div class="content">
            ${content.replace(/\n/g, '<br>')}
        </div>
        
        <div class="footer">
            <p>Villa Ingrosso - Leporano Marina, Puglia</p>
            <p>🌐 <a href="https://villaingrosso.com">villaingrosso.com</a></p>
        </div>
    </div>
</body>
</html>
          `;
          
          const success = await sendEmail(email, subject, newsletterHtml);
          if (success) {
            successCount++;
          } else {
            failureCount++;
          }
          
          // Piccola pausa tra gli invii per evitare rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (emailError) {
          console.error(`Failed to send newsletter to ${email}:`, emailError);
          failureCount++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `Newsletter sent successfully to ${successCount} recipients. ${failureCount} failures.`,
        successCount,
        failureCount
      });
    } catch (error) {
      console.error("Error sending newsletter:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Invio SMS/WhatsApp tramite Bird API (solo admin)
  app.post("/api/send-sms", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: "Phone number and message are required" });
      }

      // Usa Bird API per inviare SMS
      const { sendSMS } = await import('./bird');
      const success = await sendSMS(phoneNumber, message);
      
      if (success) {
        res.json({ success: true, message: "SMS sent successfully via Bird API" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send SMS via Bird API. Check Bird configuration." });
      }
    } catch (error) {
      console.error("Error sending SMS via Bird:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Invio WhatsApp di conferma prenotazione tramite Bird API
  app.post("/api/send-booking-whatsapp", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, guestName, checkIn, checkOut } = req.body;

      if (!phoneNumber || !guestName || !checkIn || !checkOut) {
        return res.status(400).json({ 
          success: false, 
          message: "Dati mancanti per l'invio WhatsApp" 
        });
      }

      const { createBookingConfirmationWhatsApp, sendSMS } = await import('./bird');
      const whatsappMessage = createBookingConfirmationWhatsApp(guestName, checkIn, checkOut);
      const success = await sendSMS(phoneNumber, whatsappMessage);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "WhatsApp di conferma prenotazione inviato via Bird API" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Errore nell'invio WhatsApp di conferma via Bird API" 
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

  // Invio WhatsApp di benvenuto tramite Bird API
  app.post("/api/send-welcome-whatsapp", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, guestName } = req.body;

      if (!phoneNumber || !guestName) {
        return res.status(400).json({ 
          success: false, 
          message: "Numero WhatsApp e nome ospite richiesti" 
        });
      }

      const { createWelcomeWhatsApp, sendSMS } = await import('./bird');
      const whatsappMessage = createWelcomeWhatsApp(guestName);
      const success = await sendSMS(phoneNumber, whatsappMessage);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "WhatsApp di benvenuto inviato via Bird API" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Errore nell'invio WhatsApp di benvenuto via Bird API" 
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
      
      // Converti le date in oggetti Date se sono stringhe
      if (typeof bookingData.startDate === 'string') {
        bookingData.startDate = new Date(bookingData.startDate);
      }
      if (typeof bookingData.endDate === 'string') {
        bookingData.endDate = new Date(bookingData.endDate);
      }
      
      // Verifica se c'è una promozione attiva e applicala
      let appliedPromotion = null;
      let originalPrice = bookingData.totalPrice || 0;
      
      try {
        const activePromotion = await storage.getActivePromotion();
        if (activePromotion && originalPrice > 0) {
          const discountAmount = (originalPrice * activePromotion.discountPercentage) / 100;
          bookingData.totalPrice = originalPrice - discountAmount;
          appliedPromotion = {
            promotion: activePromotion,
            discountAmount,
            originalPrice
          };
        }
      } catch (promotionError) {
        console.log('Errore nella verifica promozioni:', promotionError);
        // Continua con la prenotazione anche se la promozione fallisce
      }
      
      const newBooking = await storage.createBooking(bookingData);
      
      // Se è stata applicata una promozione, registra l'utilizzo
      if (appliedPromotion) {
        try {
          await storage.applyPromotion(
            appliedPromotion.promotion.id,
            newBooking.id,
            bookingData.userId!,
            appliedPromotion.discountAmount
          );
          await storage.incrementPromotionUsage(appliedPromotion.promotion.id);
        } catch (promotionError) {
          console.error('Errore nel registrare utilizzo promozione:', promotionError);
        }
      }
      
      // Invia notifica WhatsApp automatica al proprietario
      try {
        const user = req.user as Express.User;
        const startDate = new Date(bookingData.startDate).toLocaleDateString('it-IT');
        const endDate = new Date(bookingData.endDate).toLocaleDateString('it-IT');
        
        const notificationMessage = `🏖️ *NUOVA RICHIESTA DI PRENOTAZIONE*

📋 *Dettagli prenotazione:*
👤 Cliente: ${user.fullName || user.username}
📧 Email: ${user.email}
📅 Check-in: ${startDate}
📅 Check-out: ${endDate}
👥 Ospiti: ${bookingData.numberOfGuests}

${bookingData.notes ? `📝 Note: ${bookingData.notes}` : ''}

*Villa Ingrosso* - Sistema Prenotazioni`;

        // Invia al numero del proprietario
        await sendSMS("+39 3470896961", notificationMessage);
        log("Notifica WhatsApp inviata al proprietario per nuova prenotazione", "info");
      } catch (notificationError) {
        log(`Errore invio notifica WhatsApp: ${notificationError}`, "error");
        // Non bloccare la prenotazione se l'invio della notifica fallisce
      }
      
      // Includi informazioni sulla promozione nella risposta
      const response = {
        ...newBooking,
        promotionApplied: appliedPromotion ? {
          discountPercentage: appliedPromotion.promotion.discountPercentage,
          discountAmount: appliedPromotion.discountAmount,
          originalPrice: appliedPromotion.originalPrice,
          promotionDescription: appliedPromotion.promotion.description
        } : null
      };
      
      res.status(201).json(response);
    } catch (error) {
      log(`Error creating booking: ${error}`, "error");
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // API per verificare promozioni attive
  app.get("/api/promotions/active", async (req: Request, res: Response) => {
    try {
      const activePromotion = await storage.getActivePromotion();
      if (activePromotion) {
        res.json({
          available: true,
          promotion: {
            id: activePromotion.id,
            code: activePromotion.code,
            description: activePromotion.description,
            discountPercentage: activePromotion.discountPercentage,
            remainingUsages: activePromotion.maxUsages - activePromotion.currentUsages
          }
        });
      } else {
        res.json({ available: false });
      }
    } catch (error) {
      console.error("Error checking active promotions:", error);
      res.status(500).json({ error: "Failed to check promotions" });
    }
  });

  // Invio email personalizzate da admin (usando Bird API)
  app.post("/api/admin/send-custom-email", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { email, name, subject, content } = req.body;
      
      if (!email || !subject || !content) {
        return res.status(400).json({ error: "Email, subject and content are required" });
      }

      // Usa Bird API per inviare email personalizzata
      const { sendEmail } = await import('./bird');
      
      // Converti il contenuto in HTML semplice mantenendo i line breaks
      const htmlContent = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50;
            background: #f8fafc;
            padding: 20px;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%); 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px;
        }
        .content { 
            padding: 30px; 
            background: white;
        }
        .message { 
            font-size: 16px; 
            line-height: 1.8;
            color: #555;
            white-space: pre-wrap;
        }
        .footer { 
            background: #37474f;
            color: #b0bec5;
            text-align: center; 
            padding: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🏖️ Villa Ingrosso</div>
            <div>La tua casa vacanze in Puglia</div>
        </div>
        
        <div class="content">
            <div class="message">${content}</div>
        </div>
        
        <div class="footer">
            Villa Ingrosso - Leporano Marina, Puglia<br>
            📧 info@villaingrosso.com | 🌐 villaingrosso.com
        </div>
    </div>
</body>
</html>`;
      
      const success = await sendEmail(email, subject, htmlContent);
      
      if (success) {
        res.json({ success: true, message: "Custom email sent successfully via Bird API" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send custom email via Bird API" });
      }
    } catch (error) {
      console.error("Error sending custom email:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // API per creare prenotazione manuale da admin
  app.post("/api/admin/manual-booking", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { guestName, guestEmail, guestPhone, checkIn, checkOut, numberOfGuests, totalPrice, notes, status, source } = req.body;

      if (!guestName || !guestEmail || !checkIn || !checkOut) {
        return res.status(400).json({ error: "Guest name, email, check-in and check-out are required" });
      }

      const booking = await storage.createBooking({
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        startDate: new Date(checkIn),
        endDate: new Date(checkOut),
        numberOfGuests: numberOfGuests || 2,
        totalPrice: totalPrice || 0,
        notes: notes || null,
        status: status || "confirmed",
        source: source || "phone"
      });

      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating manual booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // API per creare utente manuale da admin
  app.post("/api/admin/manual-user", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { username, email, fullName, phone, dateOfBirth, notes, password } = req.body;

      if (!username || !email || !fullName || !password) {
        return res.status(400).json({ error: "Username, email, full name and password are required" });
      }

      // Verifica se username o email esistono già
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash della password
      const { hashPassword } = await import('./auth');
      const hashedPassword = await hashPassword(password);

      const user = await storage.createUser({
        username,
        email,
        fullName,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        password: hashedPassword,
        privacyAccepted: true,
        isAdmin: false
      });

      // Invia email di benvenuto con la password
      try {
        const { sendWelcomeEmail } = await import('./bird');
        const welcomeEmailSent = await sendWelcomeEmail(email, fullName, password);
        
        if (!welcomeEmailSent) {
          console.warn("Failed to send welcome email to new user");
        }
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }

      // Rimuovi la password dalla risposta
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating manual user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // API per cambiare la password (utente autenticato)
  app.patch("/api/user/change-password", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      // Validazione
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
      }

      // Verifica che la password attuale sia corretta
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { comparePasswords } = await import("./auth");
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash della nuova password
      const { hashPassword } = await import("./auth");
      const hashedNewPassword = await hashPassword(newPassword);

      // Aggiorna la password
      await storage.updateUser(userId, { password: hashedNewPassword });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      log(`Error changing password: ${error}`, "error");
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // API per generare token di reset password (solo admin)
  app.post("/api/admin/generate-reset-token", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) {
      return res.sendStatus(403);
    }

    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Verifica che l'utente esista
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Genera token casuale
      const { randomBytes } = await import("crypto");
      const token = randomBytes(32).toString("hex");
      
      // Imposta scadenza a 24 ore
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);

      // Salva il token
      await storage.setResetToken(email, token, expiry);

      res.json({ 
        token, 
        expiresAt: expiry,
        message: "Reset token generated. Provide this token to the user to reset their password." 
      });
    } catch (error) {
      log(`Error generating reset token: ${error}`, "error");
      res.status(500).json({ error: "Failed to generate reset token" });
    }
  });

  // API per richiedere reset password via email
  app.post("/api/request-password-reset", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Trova utente per email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Non rivelare se l'email esiste o no per sicurezza
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      // Invia email con link diretto alla pagina reset (senza token)
      const baseUrl = 'https://villaingrosso.com';
      
      const emailContent = createPasswordResetEmail(user.fullName || user.username, baseUrl);
      
      // Invia email tramite Bird API
      const emailSent = await sendEmailBird(
        email, 
        "Villa Ingrosso - Reset Password", 
        emailContent
      );

      if (!emailSent) {
        log("Failed to send reset email via Bird", "error");
        return res.status(500).json({ error: "Failed to send reset email" });
      }

      res.json({ message: "Reset email sent successfully" });
    } catch (error) {
      log(`Error requesting password reset: ${error}`, "error");
      res.status(500).json({ error: "Failed to process reset request" });
    }
  });

  // API per reset password con token
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      // Trova utente per token
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      // Verifica scadenza token
      if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ error: "Reset token has expired" });
      }

      // Hash della nuova password
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(newPassword);

      // Aggiorna password e rimuovi token
      await storage.updateUser(user.id, { password: hashedPassword });
      await storage.clearResetToken(user.id);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      log(`Error resetting password: ${error}`, "error");
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Test endpoint per verificare invio email Bird
  app.post("/api/test-bird-email", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const testContent = `
        <h1>Test Email da Villa Ingrosso</h1>
        <p>Questo è un test di invio email tramite Bird API.</p>
        <p>Se ricevi questa email, il sistema funziona correttamente.</p>
      `;

      const emailSent = await sendEmailBird(
        email,
        "Test Email - Villa Ingrosso",
        testContent
      );

      if (emailSent) {
        res.json({ message: "Test email sent successfully via Bird" });
      } else {
        res.status(500).json({ error: "Failed to send test email via Bird" });
      }
    } catch (error) {
      log(`Error sending test email: ${error}`, "error");
      res.status(500).json({ error: "Failed to send test email" });
    }
  });

  // API per reset password diretto (senza token)
  app.post("/api/reset-password-direct", async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      // Trova utente per email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      // Hash della nuova password
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(newPassword);

      // Aggiorna password
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      log(`Error resetting password: ${error}`, "error");
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // API per aggiornare il profilo utente
  app.patch("/api/user/profile", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { fullName, email, dateOfBirth } = req.body;
      const userId = req.user!.id;

      // Validazione dei dati
      if (!fullName || !email) {
        return res.status(400).json({ error: "Full name and email are required" });
      }

      // Verifica che l'email non sia già in uso da un altro utente
      if (email !== req.user!.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      // Aggiorna l'utente
      const updateData: any = {
        fullName,
        email
      };

      // Aggiungi la data di nascita solo se è fornita e valida
      if (dateOfBirth && dateOfBirth.trim() !== "") {
        updateData.dateOfBirth = new Date(dateOfBirth);
      }

      const updatedUser = await storage.updateUser(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Rimuovi la password dalla risposta
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      log(`Error updating user profile: ${error}`, "error");
      res.status(500).json({ error: "Failed to update profile" });
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

  app.delete("/api/admin/bookings/:id", async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      if (isNaN(bookingId)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }

      const success = await storage.deleteBooking(bookingId);
      if (success) {
        res.json({ success: true, message: "Booking deleted successfully" });
      } else {
        res.status(404).json({ error: "Booking not found" });
      }
    } catch (error) {
      log(`Error deleting booking: ${error}`, "error");
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  app.patch("/api/admin/bookings/:id/status", async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(bookingId)) {
        return res.status(400).json({ error: "Invalid booking ID" });
      }
      
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedBooking = await storage.updateBooking(bookingId, { status });
      if (updatedBooking) {
        res.json(updatedBooking);
      } else {
        res.status(404).json({ error: "Booking not found" });
      }
    } catch (error) {
      log(`Error updating booking status: ${error}`, "error");
      res.status(500).json({ error: "Failed to update booking status" });
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
    log(`GET /api/admin/chat-messages/${req.params.userId} - isAuthenticated: ${req.isAuthenticated()} - isAdmin: ${req.user?.isAdmin}`, "info");
    
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      log(`Admin access denied - authenticated: ${req.isAuthenticated()}, isAdmin: ${req.user?.isAdmin}`, "warn");
      return res.status(401).json({ error: "Admin privileges required" });
    }
    
    try {
      const userId = parseInt(req.params.userId);
      log(`Admin fetching chat messages for user ID: ${userId}`, "info");
      const messages = await storage.getChatMessagesByUser(userId);
      log(`Admin found ${messages.length} messages for user ${userId}`, "info");
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

      // Gestisce sia indirizzi che coordinate per l'origine
      const origins = typeof origin === 'string' ? encodeURIComponent(origin) : `${origin.lat},${origin.lng}`;
      const destinationsString = destinations.map((dest: any) => 
        `${dest.lat},${dest.lng}`
      ).join('|');

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinationsString}&units=metric&mode=driving&language=it&key=${apiKey}`;

      console.log('Making request to Google Maps API:', url.replace(apiKey, 'API_KEY_HIDDEN'));

      const response = await fetch(url);
      const data = await response.json();

      console.log('Google Maps API response:', data);

      if (data.status === 'OK') {
        res.json(data);
      } else {
        res.status(400).json({ error: `Google Maps API error: ${data.status}`, details: data });
      }
    } catch (error) {
      console.error("Error calculating distances:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // === BLOG API ROUTES ===
  
  // Ottieni tutti i post del blog (pubblico)
  app.get("/api/blog", async (req: Request, res: Response) => {
    try {
      const { limit, category } = req.query;
      const posts = await storage.getBlogPosts(
        limit ? parseInt(limit as string) : undefined,
        category as string
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Ottieni singolo post del blog per slug (pubblico)
  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // Incrementa contatore visite
      await storage.incrementBlogPostViews(post.id);
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Crea nuovo post del blog (solo admin)
  app.post("/api/blog", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const postData = insertBlogPostSchema.parse({
        ...req.body,
        authorId: req.user.id
      });

      const newPost = await storage.createBlogPost(postData);
      res.status(201).json(newPost);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(400).json({ error: error.message || "Failed to create blog post" });
    }
  });

  // Aggiorna post del blog (solo admin)
  app.put("/api/blog/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const postData = req.body;
      
      const updatedPost = await storage.updateBlogPost(parseInt(id), postData);
      
      if (!updatedPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  // Elimina post del blog (solo admin)
  app.delete("/api/blog/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const success = await storage.deleteBlogPost(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // === INVENTORY API ROUTES ===
  
  // Ottieni tutti gli elementi dell'inventario (solo admin)
  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  });

  // Ottieni elementi con scorte basse (solo admin)
  app.get("/api/inventory/low-stock", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ error: "Failed to fetch low stock items" });
    }
  });

  // Crea nuovo elemento dell'inventario (solo admin)
  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const itemData = insertInventoryItemSchema.parse(req.body);
      const newItem = await storage.createInventoryItem(itemData);
      res.status(201).json(newItem);
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ error: error.message || "Failed to create inventory item" });
    }
  });

  // Aggiorna elemento dell'inventario (solo admin)
  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const itemData = req.body;
      
      const updatedItem = await storage.updateInventoryItem(parseInt(id), itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Inventory item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  // Elimina elemento dell'inventario (solo admin)
  app.delete("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const success = await storage.deleteInventoryItem(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "Inventory item not found" });
      }

      res.json({ message: "Inventory item deleted successfully" });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // Aggiungi movimento inventario (solo admin)
  app.post("/api/inventory/movements", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const movementData = insertInventoryMovementSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      const newMovement = await storage.addInventoryMovement(movementData);
      res.status(201).json(newMovement);
    } catch (error: any) {
      console.error("Error adding inventory movement:", error);
      res.status(400).json({ error: error.message || "Failed to add inventory movement" });
    }
  });

  // Ottieni movimenti inventario (solo admin)
  app.get("/api/inventory/movements", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { itemId } = req.query;
      const movements = await storage.getInventoryMovements(
        itemId ? parseInt(itemId as string) : undefined
      );
      res.json(movements);
    } catch (error) {
      console.error("Error fetching inventory movements:", error);
      res.status(500).json({ error: "Failed to fetch inventory movements" });
    }
  });

  // === FAQ API ROUTES ===
  
  // Ottieni tutte le FAQ (pubblico)
  app.get("/api/faqs", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const faqs = await storage.getFaqs(category as string);
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  // Cerca nelle FAQ (pubblico)
  app.get("/api/faqs/search", async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }

      const faqs = await storage.searchFaqs(q);
      res.json(faqs);
    } catch (error) {
      console.error("Error searching FAQs:", error);
      res.status(500).json({ error: "Failed to search FAQs" });
    }
  });

  // Incrementa visualizzazioni FAQ (pubblico)
  app.post("/api/faqs/:id/view", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.incrementFaqViews(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "FAQ not found" });
      }

      res.json({ message: "FAQ view count updated" });
    } catch (error) {
      console.error("Error updating FAQ views:", error);
      res.status(500).json({ error: "Failed to update FAQ views" });
    }
  });

  // Vota FAQ (richiede autenticazione)
  app.post("/api/faqs/:id/vote", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { id } = req.params;
      const { isHelpful } = req.body;

      if (typeof isHelpful !== 'boolean') {
        return res.status(400).json({ error: "isHelpful must be a boolean" });
      }

      const success = await storage.voteFaq(parseInt(id), req.user.id, isHelpful);
      
      if (!success) {
        return res.status(404).json({ error: "FAQ not found" });
      }

      res.json({ message: "Vote recorded successfully" });
    } catch (error) {
      console.error("Error voting on FAQ:", error);
      res.status(500).json({ error: "Failed to vote on FAQ" });
    }
  });

  // Crea nuova FAQ (solo admin)
  app.post("/api/faqs", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const faqData = insertFaqSchema.parse(req.body);
      const newFaq = await storage.createFaq(faqData);
      res.status(201).json(newFaq);
    } catch (error: any) {
      console.error("Error creating FAQ:", error);
      res.status(400).json({ error: error.message || "Failed to create FAQ" });
    }
  });

  // Aggiorna FAQ (solo admin)
  app.put("/api/faqs/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const faqData = req.body;
      
      const updatedFaq = await storage.updateFaq(parseInt(id), faqData);
      
      if (!updatedFaq) {
        return res.status(404).json({ error: "FAQ not found" });
      }

      res.json(updatedFaq);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      res.status(500).json({ error: "Failed to update FAQ" });
    }
  });

  // Elimina FAQ (solo admin)
  app.delete("/api/faqs/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { id } = req.params;
      const success = await storage.deleteFaq(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: "FAQ not found" });
      }

      res.json({ message: "FAQ deleted successfully" });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ error: "Failed to delete FAQ" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Importa gli schemi e il database per le query dirette nelle API admin
import * as schema from "@shared/schema";
import { db } from "./db";
