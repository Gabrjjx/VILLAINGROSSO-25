import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertContactSchema.parse(req.body);
      
      // Add timestamp
      const contactData = {
        ...validatedData,
        createdAt: new Date().toISOString(),
      };
      
      // Store contact request
      const contact = await storage.createContact(contactData);
      
      res.status(201).json({
        message: "Richiesta di contatto inviata con successo",
        contact
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          message: "Errore di validazione", 
          errors: validationError.details 
        });
      } else {
        console.error("Error saving contact:", error);
        res.status(500).json({ 
          message: "Si è verificato un errore durante l'invio della richiesta" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
