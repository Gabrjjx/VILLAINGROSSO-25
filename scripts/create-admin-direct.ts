import { db } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// Funzione per hashare la password (identica a quella in auth.ts)
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Funzione per verificare la password (per test)
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function createAndVerifyAdmin() {
  console.log("Creazione dell'utente amministratore (metodo diretto)...");
  
  try {
    // Generiamo la password hashata
    const plainPassword = "admin123";
    const hashedPassword = await hashPassword(plainPassword);
    
    // Inseriamo l'utente admin nel database
    const [admin] = await db.insert(users).values({
      username: "admin",
      email: "admin@villaingrosso.com",
      password: hashedPassword,
      fullName: "Amministratore",
      isAdmin: true
    }).returning();
    
    console.log("Utente amministratore creato con successo!");
    console.log("Dettagli di accesso:");
    console.log("- Username: admin");
    console.log("- Password: admin123");
    
    // Verifichiamo che la password funzioni con la funzione di confronto
    const passwordMatches = await comparePasswords(plainPassword, hashedPassword);
    console.log(`Verifica password: ${passwordMatches ? "OK" : "FALLITA"}`);
    
    // Verifichiamo con una query al database per confermare
    const [storedAdmin] = await db.select().from(users).where(eq(users.username, "admin"));
    console.log("Password hashata nel database:", storedAdmin.password);
  } catch (error) {
    console.error("Si è verificato un errore durante la creazione dell'utente amministratore:", error);
  } finally {
    process.exit(0);
  }
}

createAndVerifyAdmin();