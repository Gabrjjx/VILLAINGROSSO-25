import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'villa-ingrosso-jwt-secret';
const JWT_EXPIRY = '7d';  // 7 giorni

export function generateToken(user: User): string {
  // Creiamo un oggetto user senza la password per il token
  const { password, ...userWithoutPassword } = user;
  
  // Genera il token JWT
  return jwt.sign(userWithoutPassword, JWT_SECRET, {
    expiresIn: JWT_EXPIRY
  });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Token non valido o scaduto
    return null;
  }
}

// Middleware per estrarre e verificare il token
export function jwtMiddleware(req: any, res: any, next: any) {
  // Estrai il token dall'header Authorization
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Estrai il token senza il prefisso "Bearer "
    const token = authHeader.substring(7);
    
    // Verifica il token
    const decodedUser = verifyToken(token);
    
    if (decodedUser) {
      // Se il token è valido, salva l'utente decodificato nella richiesta
      req.user = decodedUser;
      // Imposta la proprietà isAuthenticated per compatibilità con il resto dell'app
      req.isAuthenticated = () => true;
    }
  }
  
  next();
}