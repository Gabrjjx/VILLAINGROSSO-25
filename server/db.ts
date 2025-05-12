import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configurazione per le WebSocket (necessario per Neon)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Creazione del pool di connessioni
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Inizializzazione di Drizzle ORM
export const db = drizzle({ client: pool, schema });