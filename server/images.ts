import express, { Express } from "express";
import path from "path";

/**
 * Configura Express per servire immagini statiche
 */
export function serveImageStatic(app: Express) {
  // Servi le immagini dalla cartella "images"
  app.use("/images", express.static(path.join(process.cwd(), "images")));
  
  // Servi anche le immagini da attached_assets
  app.use("/assets", express.static(path.join(process.cwd(), "attached_assets")));
  
  // Servi i file audio
  app.use("/audio", express.static(path.join(process.cwd(), "audio")));
}