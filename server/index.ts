import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import cookieParser from "cookie-parser";
import cors from "cors";
import { serveImageStatic } from "./images";
import { jwtMiddleware } from "./jwt";

const app = express();

// Aggiungi middleware per parsing del corpo delle richieste
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione CORS per lo sviluppo
if (process.env.NODE_ENV === "development") {
  app.use(cors({ 
    origin: true, 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
}

// Middleware JWT per autenticazione tramite token
app.use(jwtMiddleware);

// Debugging middleware per i problemi di sessione
app.use((req, res, next) => {
  const isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : false;
  const sessionID = req.sessionID;
  const path = req.path;
  
  console.log(`[Session Debug] Path: ${path}, isAuthenticated: ${isAuthenticated}, SessionID: ${sessionID}`);
  
  if (path.startsWith('/api')) {
    console.log(`${req.method} ${path} - isAuthenticated: ${isAuthenticated}${req.method === 'POST' ? ` - body: ${JSON.stringify(req.body)}` : ''}`);
  }
  
  next();
});

// Setup autenticazione tradizionale con sessioni
setupAuth(app);

// Serve static images
serveImageStatic(app);

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
