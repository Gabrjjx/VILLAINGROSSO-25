import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, users } from "@shared/schema";

declare global {
  namespace Express {
    // Estende User con le proprietà del nostro schema
    interface User {
      id: number;
      username: string;
      email: string;
      fullName?: string;
      isAdmin: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Funzione per hashare la password
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Funzione per confrontare le password
export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    console.warn("No SESSION_SECRET set, using a default one. This is not secure for production!");
  }
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "villa-ingrosso-default-secret",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    store: storage.sessionStore,
    cookie: {
      secure: false, // Set to true only in production with HTTPS
      httpOnly: false,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 giorni
      sameSite: 'lax',
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configurazione strategia di autenticazione locale
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Auth attempt for username:", username);
        const user = await storage.getUserByUsername(username);
        console.log("User found:", user ? "YES" : "NO");
        
        if (!user) {
          console.log("Authentication failed: User not found");
          return done(null, false);
        }
        
        const passwordMatches = await comparePasswords(password, user.password);
        console.log("Password matches:", passwordMatches ? "YES" : "NO");
        
        if (!passwordMatches) {
          console.log("Authentication failed: Password does not match");
          return done(null, false);
        } else {
          console.log("Authentication successful for user:", username);
          return done(null, user);
        }
      } catch (err) {
        console.error("Authentication error:", err);
        return done(err);
      }
    }),
  );

  // Serializzazione e deserializzazione
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Rotte di autenticazione
  app.post("/api/register", async (req, res, next) => {
    try {
      // Controlla se l'utente esiste già
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Controlla se l'email esiste già
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Prepara i dati utente, convertendo la data se presente
      const userData = {
        ...req.body,
        password: await hashPassword(req.body.password),
      };
      
      // Converti dateOfBirth da stringa a Date se presente
      if (userData.dateOfBirth && typeof userData.dateOfBirth === 'string') {
        userData.dateOfBirth = new Date(userData.dateOfBirth);
      }

      // Crea il nuovo utente
      const user = await storage.createUser(userData);

      // Elimina la password dalla risposta
      const { password, ...userWithoutPassword } = user;

      // Invia email di benvenuto
      try {
        const { sendEmail, createWelcomeEmail } = await import('./bird');
        const welcomeEmailContent = createWelcomeEmail(
          user.fullName || user.username, 
          user.email, 
          'https://villaingrosso.com'
        );
        await sendEmail(user.email, '🏖️ Benvenuto in Villa Ingrosso - La tua casa vacanze in Puglia', welcomeEmailContent);
        console.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Non blocchiamo la registrazione se l'email fallisce
      }

      // Invia notifica di nuova registrazione all'admin
      try {
        const { sendNewUserNotificationEmail } = await import('./bird');
        await sendNewUserNotificationEmail(
          user.fullName || user.username,
          user.email
        );
        console.log(`Admin notification email sent for new user: ${user.email}`);
      } catch (adminEmailError) {
        console.error('Failed to send admin notification email:', adminEmailError);
        // Non blocchiamo la registrazione se l'email di notifica fallisce
      }

      // Autenticazione automatica dopo la registrazione
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      console.log("Tentativo di login per utente:", username);

      // Verifica se l'utente esiste
      const user = await storage.getUserByUsername(username);
      console.log("Utente trovato?", user ? "SÌ" : "NO");
      
      if (!user) {
        console.log("Utente non trovato:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Verifica la password
      const isPasswordValid = await comparePasswords(password, user.password);
      console.log("Password valida?", isPasswordValid ? "SÌ" : "NO");
      console.log("Password inserita:", password);
      console.log("Password hash nel DB:", user.password);
      
      if (!isPasswordValid) {
        console.log("Password non valida per utente:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Autenticazione manuale
      req.login(user, async (err) => {
        if (err) {
          console.error("Errore durante login:", err);
          return next(err);
        }
        
        console.log("Login completato con successo per utente:", username);
        
        // Importa la funzione per generare token JWT
        const { generateToken } = await import('./jwt');
        
        // Genera un token JWT per l'utente
        const token = generateToken(user);
        
        // Elimina la password dalla risposta
        const { password, ...userWithoutPassword } = user;
        
        // Invia il token e i dati utente
        res.status(200).json({ 
          user: userWithoutPassword,
          token 
        });
      });
    } catch (err) {
      console.error("Errore durante il login:", err);
      next(err);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    
    // Elimina la password dalla risposta
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });
  
  // Middleware per verificare se l'utente è un amministratore
  app.use("/api/admin", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = req.user as User;
    if (!user.isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    next();
  });
}