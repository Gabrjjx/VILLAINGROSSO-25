// Bird API integration for WhatsApp, SMS and Email communications
import { Request, Response } from 'express';

interface BirdMessagePayload {
  receiver: {
    contact: {
      identifierValue: string;
    };
  };
  body: {
    text: {
      text: string;
    };
  };
  channelId: string;
}

interface BirdEmailPayload {
  receiver: {
    contact: {
      identifierValue: string;
    };
  };
  body: {
    email: {
      subject: string;
      html: string;
    };
  };
  channelId: string;
}

// Configurazione Bird
const BIRD_API_URL = 'https://api.bird.com';
const BIRD_API_KEY = process.env.BIRD_API_KEY;
const BIRD_WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID;

if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID) {
  console.warn('Bird credentials not configured. WhatsApp/SMS features will be disabled.');
}

// Funzione per inviare messaggi WhatsApp tramite Bird usando template approvato
export async function sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
  if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID) {
    console.error('Bird API not configured properly');
    return false;
  }

  try {
    // Formatta il numero di telefono per WhatsApp
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    // Usa il formato corretto per il numero di destinazione
    let formattedNumber;
    if (cleanNumber.startsWith('39')) {
      formattedNumber = `+${cleanNumber}`;
    } else if (cleanNumber.startsWith('3')) {
      formattedNumber = `+39${cleanNumber}`;
    } else {
      formattedNumber = `+${cleanNumber}`;
    }

    const payload = {
      receiver: {
        contact: {
          identifierValue: formattedNumber
        }
      },
      template: {
        projectId: '632db922-85ed-48db-9b61-01848c5c7111',
        version: 'latest',
        locale: 'en'
      },
      channelId: '00e334fd-7b63-5dbc-b011-b0d512f0895e'
    };

    const response = await fetch(`${BIRD_API_URL}/workspaces/${BIRD_WORKSPACE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${BIRD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`WhatsApp inviato con successo a ${formattedNumber} tramite Bird. ID: ${result.id}`);
      return true;
    } else {
      const error = await response.text();
      console.error('Errore invio WhatsApp Bird:', error);
      return false;
    }
  } catch (error) {
    console.error('Errore invio WhatsApp Bird:', error);
    return false;
  }
}

// Funzione per inviare SMS tramite Bird
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID) {
    console.error('Bird API not configured properly');
    return false;
  }

  try {
    // Formatta il numero di telefono per SMS
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    // Usa il formato corretto per il numero di destinazione
    let formattedNumber;
    if (cleanNumber.startsWith('39')) {
      formattedNumber = `+${cleanNumber}`;
    } else if (cleanNumber.startsWith('3')) {
      formattedNumber = `+39${cleanNumber}`;
    } else {
      formattedNumber = `+${cleanNumber}`;
    }

    const payload = {
      receiver: {
        contacts: [
          {
            identifierKey: "phonenumber",
            identifierValue: formattedNumber
          }
        ]
      },
      body: {
        type: "text",
        text: {
          text: message
        }
      }
    };

    const response = await fetch(`${BIRD_API_URL}/workspaces/${BIRD_WORKSPACE_ID}/channels/c2d69d8b-b7ac-5810-936a-bf65c306ace5/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${BIRD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`SMS inviato con successo a ${formattedNumber} tramite Bird. ID: ${result.id}`);
      return true;
    } else {
      const error = await response.text();
      console.error('Errore invio SMS Bird:', error);
      return false;
    }
  } catch (error) {
    console.error('Errore invio SMS Bird:', error);
    return false;
  }
}

// Template per WhatsApp di conferma prenotazione
export function createBookingConfirmationWhatsApp(guestName: string, checkIn: string, checkOut: string): string {
  return `🏖️ *Villa Ingrosso - Conferma Prenotazione*

Ciao ${guestName}! 👋

Grazie per aver scelto Villa Ingrosso per la tua vacanza! 

📅 *Check-in:* ${checkIn}
📅 *Check-out:* ${checkOut}
🏡 *Location:* Leporano Marina, a 300m dal mare

Ti invieremo tutte le informazioni dettagliate via email. 

Per qualsiasi domanda, rispondi a questo messaggio!

🌊 Non vediamo l'ora di accoglierti! 🌊`;
}

// Template per WhatsApp di benvenuto
export function createWelcomeWhatsApp(guestName: string): string {
  return `🏖️ *Benvenuto/a alla Villa Ingrosso!*

Ciao ${guestName}! 👋

Siamo felici di averti come nostro ospite! 

Ecco alcune informazioni utili:
📍 La villa si trova a 300m dalle splendide spiagge ioniche
🌊 Spiagge più vicine: Torre Lapillo e Punta Prosciutto
🅿️ Parcheggio privato incluso
📶 WiFi gratuito

Per qualsiasi necessità, non esitare a contattarci!

Buona vacanza! 🌴☀️`;
}

// Template per WhatsApp di promemoria check-out
export function createCheckoutReminderWhatsApp(guestName: string, checkOut: string): string {
  return `🏖️ *Villa Ingrosso - Promemoria Check-out*

Ciao ${guestName}! 👋

Ti ricordiamo che il check-out è previsto per domani: ${checkOut}

⏰ Orario check-out: entro le 10:00
🧳 Lascia le chiavi sul tavolo della cucina
🧹 La villa è già stata preparata per te

Speriamo che tu abbia trascorso una vacanza indimenticabile! 

Ci farebbe piacere ricevere una recensione della tua esperienza. 

Grazie e a presto! 🌊✨`;
}

// Template per notifica admin di nuova prenotazione
export function createAdminNotificationWhatsApp(guestName: string, checkIn: string): string {
  return `🔔 *Nuova Prenotazione - Villa Ingrosso*

📝 Nuovo ospite: ${guestName}
📅 Check-in: ${checkIn}

Controlla i dettagli completi nel pannello admin.`;
}

// Template per SMS di conferma prenotazione
export function createBookingConfirmationSMS(guestName: string, checkIn: string, checkOut: string): string {
  return `Villa Ingrosso - Conferma Prenotazione

Ciao ${guestName}!
Check-in: ${checkIn}
Check-out: ${checkOut}

Dettagli via email. Per info rispondi a questo SMS.

Ti aspettiamo!`;
}

// Template per SMS di benvenuto
export function createWelcomeSMS(guestName: string): string {
  return `Villa Ingrosso - Benvenuto!

Ciao ${guestName}!
Villa a 300m dal mare.
WiFi e parcheggio inclusi.

Per assistenza rispondi a questo SMS.
Buona vacanza!`;
}

// Template per SMS di promemoria check-out
export function createCheckoutReminderSMS(guestName: string, checkOut: string): string {
  return `Villa Ingrosso - Check-out

Ciao ${guestName}!
Check-out domani: ${checkOut} entro le 10:00.
Lascia le chiavi sul tavolo.

Grazie per aver soggiornato con noi!`;
}

// Template per SMS notifica admin
export function createAdminNotificationSMS(guestName: string, checkIn: string): string {
  return `Villa Ingrosso - Nuova Prenotazione

Ospite: ${guestName}
Check-in: ${checkIn}

Controlla il pannello admin.`;
}

// Funzione per inviare email tramite Bird API Transmissions
export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID) {
    console.error('Bird API not configured properly');
    return false;
  }

  try {
    // Usa l'API Transmissions secondo la documentazione Bird
    const payload = {
      options: {
        open_tracking: true,
        click_tracking: true,
        transactional: true,
        perform_substitutions: true
      },
      recipients: [
        {
          address: {
            email: to,
            name: to.split('@')[0] // Usa la parte prima dell'@ come nome
          },
          rcpt_type: "to"
        }
      ],
      content: {
        from: "info@villaingrosso.com",
        subject: subject,
        html: htmlContent,
        text: htmlContent.replace(/<[^>]*>/g, '') // Converte HTML in testo
      }
    };

    const response = await fetch(`https://email.eu-west-1.api.bird.com/api/workspaces/${BIRD_WORKSPACE_ID}/reach/transmissions`, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${BIRD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Email inviata con successo tramite Bird:', result);
      return true;
    } else {
      const error = await response.text();
      console.error('Errore invio email Bird:', error);
      return false;
    }
  } catch (error) {
    console.error('Errore invio email Bird:', error);
    return false;
  }
}

// Template per email di reset password migliorato
export function createPasswordResetEmail(userName: string, baseUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Villa Ingrosso</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50;
            background: linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%);
            padding: 20px;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #1976d2 0%, #0288d1 50%, #00acc1 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="%23ffffff"></path></svg>') no-repeat center bottom;
            background-size: cover;
        }
        .logo { 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle { 
            font-size: 16px; 
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .content { 
            padding: 40px 30px; 
            background: white;
        }
        .welcome { 
            font-size: 18px; 
            color: #1976d2; 
            font-weight: 600; 
            margin-bottom: 20px;
        }
        .message { 
            font-size: 16px; 
            margin-bottom: 20px; 
            color: #555;
        }
        .cta-section {
            text-align: center;
            margin: 35px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f8fbff 0%, #f0f9ff 100%);
            border-radius: 12px;
            border: 2px dashed #0288d1;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-size: 16px; 
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
            transition: all 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
        }
        .security-info {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .security-info h4 {
            color: #f57c00;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .security-info ul {
            list-style: none;
            padding-left: 0;
        }
        .security-info li {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
        }
        .security-info li::before {
            content: '🔒';
            position: absolute;
            left: 0;
        }
        .villa-info {
            background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            text-align: center;
        }
        .villa-info h3 {
            color: #2e7d32;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .location-info {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        .location-item {
            text-align: center;
            margin: 5px;
        }
        .location-icon {
            font-size: 20px;
            margin-bottom: 5px;
        }
        .footer { 
            background: #37474f;
            color: #b0bec5;
            text-align: center; 
            padding: 25px 30px;
            font-size: 14px;
        }
        .footer-links {
            margin-bottom: 15px;
        }
        .footer-links a {
            color: #81c784;
            text-decoration: none;
            margin: 0 10px;
        }
        @media (max-width: 600px) {
            .email-container { margin: 10px; }
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
            .location-info { flex-direction: column; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🏖️ Villa Ingrosso</div>
            <div class="subtitle">La tua casa vacanze in Puglia</div>
            <h2 style="margin-top: 20px; font-size: 22px;">Reset Password</h2>
        </div>
        
        <div class="content">
            <div class="welcome">Ciao ${userName}!</div>
            
            <div class="message">
                Hai richiesto di reimpostare la password per il tuo account Villa Ingrosso. 
                Siamo qui per aiutarti a riacquistare l'accesso al tuo account in modo sicuro.
            </div>
            
            <div class="cta-section">
                <div class="message" style="margin-bottom: 20px; font-weight: 600; color: #1976d2;">
                    Clicca sul pulsante qui sotto per impostare una nuova password:
                </div>
                <a href="${baseUrl}/change-password" class="button">
                    🔑 Reimposta Password
                </a>
            </div>
            
            <div class="security-info">
                <h4>🛡️ Informazioni di Sicurezza</h4>
                <ul>
                    <li>Se non hai richiesto questo reset, puoi ignorare questa email</li>
                    <li>Assicurati di essere su villaingrosso.com</li>
                    <li>Scegli una password sicura e unica</li>
                    <li>Non condividere mai le tue credenziali</li>
                </ul>
            </div>
            
            <div class="villa-info">
                <h3>🌊 Villa Ingrosso</h3>
                <div class="message" style="margin-bottom: 15px; color: #2e7d32;">
                    La tua casa vacanze nel cuore della Puglia
                </div>
                <div class="location-info">
                    <div class="location-item">
                        <div class="location-icon">📍</div>
                        <div>Leporano Marina</div>
                    </div>
                    <div class="location-item">
                        <div class="location-icon">🏖️</div>
                        <div>300m dal mare</div>
                    </div>
                    <div class="location-item">
                        <div class="location-icon">🌅</div>
                        <div>Costa Ionica</div>
                    </div>
                </div>
            </div>
            
            <div class="message" style="text-align: center; margin-top: 30px; color: #2e7d32; font-weight: 600;">
                Grazie per aver scelto Villa Ingrosso!<br>
                <span style="font-weight: normal; font-style: italic;">Il Team di Villa Ingrosso</span>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="${baseUrl}">Sito Web</a> |
                <a href="${baseUrl}/contact">Contatti</a> |
                <a href="${baseUrl}/booking">Prenota</a>
            </div>
            <div>
                Questa email è stata inviata automaticamente.<br>
                Villa Ingrosso - Leporano Marina, Puglia | villaingrosso.com
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Template per email di benvenuto con password per nuovi utenti
export function createWelcomeEmailWithPassword(userName: string, userEmail: string, password: string, baseUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benvenuto in Villa Ingrosso - Credenziali di Accesso</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50;
            background: linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%);
            padding: 20px;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #0277bd 0%, #81c784 100%);
            color: white; 
            text-align: center; 
            padding: 40px 30px;
        }
        .logo { 
            font-size: 28px; 
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle { 
            font-size: 16px; 
            opacity: 0.9;
            margin-bottom: 20px;
        }
        .content { 
            padding: 40px 30px; 
            background: white;
        }
        .welcome { 
            font-size: 18px; 
            color: #1976d2; 
            font-weight: 600; 
            margin-bottom: 20px;
        }
        .message { 
            font-size: 16px; 
            margin-bottom: 20px; 
            color: #555;
        }
        .credentials-box {
            background: linear-gradient(135deg, #fff3e0 0%, #f3e5f5 100%);
            border: 2px solid #ff9800;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .credentials-box h3 {
            color: #e65100;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .credential-item {
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid #ff9800;
        }
        .credential-label {
            font-weight: bold;
            color: #424242;
            display: block;
            margin-bottom: 5px;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            background: #f5f5f5;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 16px;
            color: #1976d2;
            font-weight: bold;
        }
        .security-warning {
            background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
            border: 2px solid #f44336;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .security-warning h4 {
            color: #c62828;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .security-warning p {
            color: #d32f2f;
            font-size: 14px;
        }
        .cta-section {
            text-align: center;
            margin: 35px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f8fbff 0%, #f0f9ff 100%);
            border-radius: 12px;
            border: 2px dashed #0288d1;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-size: 16px; 
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
            transition: all 0.3s ease;
        }
        .footer { 
            background: #37474f;
            color: #b0bec5;
            text-align: center; 
            padding: 25px 30px;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .email-container { margin: 10px; }
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🏖️ Villa Ingrosso</div>
            <div class="subtitle">La tua vacanza da sogno in Puglia</div>
        </div>
        
        <div class="content">
            <div class="welcome">Benvenuto/a ${userName}! 🎉</div>
            
            <div class="message">
                Il tuo account è stato creato dall'amministratore del sito. Ora puoi accedere e gestire le tue prenotazioni utilizzando le credenziali qui sotto:
            </div>
            
            <div class="credentials-box">
                <h3>🔑 Le tue credenziali di accesso</h3>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <div class="credential-value">${userEmail}</div>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Password temporanea:</span>
                    <div class="credential-value">${password}</div>
                </div>
            </div>
            
            <div class="security-warning">
                <h4>⚠️ Importante per la tua sicurezza</h4>
                <p>Ti consigliamo di cambiare la password al primo accesso. Vai su Profilo > Cambia Password dopo aver effettuato l'accesso.</p>
            </div>
            
            <div class="cta-section">
                <div class="message" style="margin-bottom: 20px; color: #1976d2; font-weight: 600;">
                    Accedi ora al tuo account
                </div>
                <a href="${baseUrl}/auth" class="button">Accedi al Sito</a>
            </div>
            
            <div class="message" style="text-align: center; margin-top: 30px; color: #2e7d32; font-weight: 600;">
                Grazie per essere con noi!<br>
                <span style="font-weight: normal; font-style: italic;">Il Team di Villa Ingrosso</span>
            </div>
        </div>
        
        <div class="footer">
            <div>
                Questa email è stata inviata automaticamente.<br>
                Villa Ingrosso - Leporano Marina, Puglia | villaingrosso.com
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Funzione per inviare email di benvenuto con password
export async function sendWelcomeEmail(userEmail: string, userName: string, password: string): Promise<boolean> {
  const baseUrl = process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.app` : 'http://localhost:5000';
  const htmlContent = createWelcomeEmailWithPassword(userName, userEmail, password, baseUrl);
  
  return await sendEmail(
    userEmail,
    "Benvenuto su Villa Ingrosso - Le tue credenziali di accesso",
    htmlContent
  );
}

// Template per email di benvenuto per nuovi utenti
export function createWelcomeEmail(userName: string, userEmail: string, baseUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benvenuto in Villa Ingrosso</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50;
            background: linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%);
            padding: 20px;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #4caf50 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="%23ffffff"></path></svg>') no-repeat center bottom;
            background-size: cover;
        }
        .logo { 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle { 
            font-size: 18px; 
            opacity: 0.95;
            margin-bottom: 20px;
        }
        .welcome-title {
            font-size: 24px;
            margin-top: 20px;
            font-weight: 600;
        }
        .content { 
            padding: 40px 30px; 
            background: white;
        }
        .welcome-message { 
            font-size: 18px; 
            color: #2e7d32; 
            font-weight: 600; 
            margin-bottom: 25px;
            text-align: center;
        }
        .message { 
            font-size: 16px; 
            margin-bottom: 20px; 
            color: #555;
        }
        .features-section {
            background: linear-gradient(135deg, #f8fbff 0%, #f0f9ff 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            border: 2px solid #e3f2fd;
        }
        .features-title {
            color: #1976d2;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .feature-item {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .feature-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .feature-title {
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 8px;
        }
        .villa-showcase {
            background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            text-align: center;
        }
        .villa-showcase h3 {
            color: #2e7d32;
            margin-bottom: 20px;
            font-size: 22px;
        }
        .villa-highlights {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin: 25px 0;
        }
        .highlight-item {
            text-align: center;
            margin: 10px;
            flex: 1;
            min-width: 150px;
        }
        .highlight-icon {
            font-size: 28px;
            margin-bottom: 8px;
        }
        .highlight-text {
            font-size: 14px;
            color: #2e7d32;
            font-weight: 600;
        }
        .cta-section {
            text-align: center;
            margin: 35px 0;
            padding: 25px;
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
            border-radius: 12px;
            border: 2px dashed #ff9800;
        }
        .cta-title {
            color: #f57c00;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #2e7d32 0%, #388e3c 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 50px; 
            font-size: 16px; 
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
            margin: 0 10px 10px 0;
            transition: all 0.3s ease;
        }
        .button-secondary {
            background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%);
            box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
        }
        .contact-info {
            background: #f5f5f5;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            text-align: center;
        }
        .contact-info h4 {
            color: #37474f;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .contact-details {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        .contact-item {
            margin: 5px 10px;
            color: #555;
        }
        .footer { 
            background: #37474f;
            color: #b0bec5;
            text-align: center; 
            padding: 25px 30px;
            font-size: 14px;
        }
        .footer-links {
            margin-bottom: 15px;
        }
        .footer-links a {
            color: #81c784;
            text-decoration: none;
            margin: 0 10px;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links span {
            margin: 0 5px;
            font-size: 18px;
        }
        @media (max-width: 600px) {
            .email-container { margin: 10px; }
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
            .features-grid { grid-template-columns: 1fr; }
            .villa-highlights { flex-direction: column; }
            .contact-details { flex-direction: column; }
            .button { margin: 5px 0; display: block; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🏖️ Villa Ingrosso</div>
            <div class="subtitle">La tua casa vacanze in Puglia</div>
            <div class="welcome-title">🎉 Benvenuto nella famiglia!</div>
        </div>
        
        <div class="content">
            <div class="welcome-message">Ciao ${userName}, benvenuto in Villa Ingrosso!</div>
            
            <div class="message">
                Siamo entusiasti di averti con noi! La tua registrazione è stata completata con successo 
                e ora puoi accedere a tutti i servizi esclusivi di Villa Ingrosso.
            </div>
            
            <div class="features-section">
                <div class="features-title">🌟 Cosa puoi fare ora</div>
                <div class="features-grid">
                    <div class="feature-item">
                        <div class="feature-icon">📅</div>
                        <div class="feature-title">Prenota il tuo soggiorno</div>
                        <div>Verifica le disponibilità e prenota direttamente online</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">💬</div>
                        <div class="feature-title">Assistenza dedicata</div>
                        <div>Chat diretta con il nostro team per qualsiasi esigenza</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">📧</div>
                        <div class="feature-title">Offerte esclusive</div>
                        <div>Ricevi sconti e promozioni riservate ai nostri ospiti</div>
                    </div>
                </div>
            </div>
            
            <div class="villa-showcase">
                <h3>🌊 Scopri Villa Ingrosso</h3>
                <div class="message" style="margin-bottom: 20px; color: #2e7d32;">
                    Una villa moderna a soli 300 metri dal mare cristallino della Costa Ionica
                </div>
                <div class="villa-highlights">
                    <div class="highlight-item">
                        <div class="highlight-icon">🏠</div>
                        <div class="highlight-text">Casa moderna<br>completamente attrezzata</div>
                    </div>
                    <div class="highlight-item">
                        <div class="highlight-icon">🏖️</div>
                        <div class="highlight-text">300m dal mare<br>spiagge sabbiose</div>
                    </div>
                    <div class="highlight-item">
                        <div class="highlight-icon">🍕</div>
                        <div class="highlight-text">Cucina tradizionale<br>pugliese vicina</div>
                    </div>
                    <div class="highlight-item">
                        <div class="highlight-icon">🌅</div>
                        <div class="highlight-text">Tramonti mozzafiato<br>sulla Costa Ionica</div>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <div class="cta-title">🚀 Inizia la tua avventura pugliese</div>
                <div class="message" style="margin-bottom: 20px; color: #f57c00;">
                    Esplora le nostre offerte e prenota il tuo soggiorno da sogno
                </div>
                <a href="${baseUrl}/booking" class="button">📅 Prenota ora</a>
                <a href="${baseUrl}/gallery" class="button button-secondary">📸 Guarda la gallery</a>
            </div>
            
            <div class="contact-info">
                <h4>📞 Hai bisogno di aiuto?</h4>
                <div class="message" style="margin-bottom: 15px; color: #555;">
                    Il nostro team è sempre disponibile per assisterti
                </div>
                <div class="contact-details">
                    <div class="contact-item">
                        <strong>📧 Email:</strong> info@villaingrosso.com
                    </div>
                    <div class="contact-item">
                        <strong>💬 Chat:</strong> Accedi al sito per chattare
                    </div>
                    <div class="contact-item">
                        <strong>📍 Posizione:</strong> Leporano Marina, Puglia
                    </div>
                </div>
            </div>
            
            <div class="message" style="text-align: center; margin-top: 30px; color: #2e7d32; font-weight: 600;">
                Grazie per aver scelto Villa Ingrosso!<br>
                <span style="font-weight: normal; font-style: italic;">Non vediamo l'ora di ospitarti</span>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="${baseUrl}">🏠 Sito Web</a> |
                <a href="${baseUrl}/contact">📧 Contatti</a> |
                <a href="${baseUrl}/booking">📅 Prenota</a> |
                <a href="${baseUrl}/gallery">📸 Gallery</a>
            </div>
            <div class="social-links">
                <span>📱 Seguici:</span>
                <span>📘 Facebook</span>
                <span>📷 Instagram</span>
                <span>🐦 Twitter</span>
            </div>
            <div>
                Villa Ingrosso - Leporano Marina, Puglia<br>
                📧 info@villaingrosso.com | 🌐 villaingrosso.com
            </div>
        </div>
    </div>
</body>
</html>
  `;
}