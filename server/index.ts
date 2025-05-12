import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Aggiungi middleware per parsing del corpo delle richieste
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sito completamente statico senza API
// Completely static site without API functionality

(async () => {
  const server = await registerRoutes(app);

  // Setup Vite for development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on port 5000
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
