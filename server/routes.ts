import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This site doesn't use any API routes as it's a static site
  // All contact information is displayed directly on the page

  const httpServer = createServer(app);
  return httpServer;
}
