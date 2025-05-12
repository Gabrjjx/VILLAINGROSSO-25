import { db } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// Funzione per hashare la password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  console.log("Creazione dell'utente amministratore...");
  
  try {
    // Verifica se esiste già un amministratore
    const existingAdmin = await db.select().from(users).where(eq(users.isAdmin, true));
    
    if (existingAdmin.length > 0) {
      console.log("Un utente amministratore esiste già nel database:");
      console.log(`- Username: ${existingAdmin[0].username}`);
      console.log(`- Email: ${existingAdmin[0].email}`);
      return;
    }
    
    // Crea l'utente amministratore
    const [admin] = await db.insert(users).values({
      username: "admin",
      email: "admin@villaingrosso.com",
      password: await hashPassword("admin123"),
      fullName: "Amministratore",
      isAdmin: true
    }).returning();
    
    console.log("Utente amministratore creato con successo!");
    console.log("Dettagli di accesso:");
    console.log("- Username: admin");
    console.log("- Password: admin123");
    console.log("- URL: http://localhost:5000/auth");
    console.log("\nAssicurati di cambiare la password dopo il primo accesso.");
  } catch (error) {
    console.error("Si è verificato un errore durante la creazione dell'utente amministratore:", error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();