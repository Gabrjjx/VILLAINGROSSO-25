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

// Funzione per inviare email tramite Bird API
export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID) {
    console.error('Bird API not configured properly');
    return false;
  }

  try {
    const payload: BirdEmailPayload = {
      receiver: {
        contact: {
          identifierValue: to
        }
      },
      body: {
        email: {
          subject: subject,
          html: htmlContent
        }
      },
      channelId: "email" // Channel ID per email tramite Bird
    };

    const response = await fetch(`${BIRD_API_URL}/workspaces/${BIRD_WORKSPACE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${BIRD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('Email inviata con successo tramite Bird:', to);
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

// Template per email di reset password
export function createPasswordResetEmail(userName: string, resetToken: string, baseUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Villa Ingrosso</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .token-box { background: #e2e8f0; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
        .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏖️ Villa Ingrosso</h1>
            <h2>Reset Password</h2>
        </div>
        <div class="content">
            <p>Ciao ${userName},</p>
            
            <p>Hai richiesto di reimpostare la password per il tuo account Villa Ingrosso.</p>
            
            <p>Usa il seguente token per reimpostare la tua password:</p>
            
            <div class="token-box">
                <strong>${resetToken}</strong>
            </div>
            
            <p>Oppure clicca sul pulsante qui sotto per andare direttamente alla pagina di reset:</p>
            
            <p style="text-align: center;">
                <a href="${baseUrl}/reset-password?token=${resetToken}" class="button">
                    Reimposta Password
                </a>
            </p>
            
            <p><strong>Importante:</strong></p>
            <ul>
                <li>Questo token è valido per 1 ora</li>
                <li>Se non hai richiesto questo reset, ignora questa email</li>
                <li>Per sicurezza, non condividere questo token con nessuno</li>
            </ul>
            
            <p>Grazie per aver scelto Villa Ingrosso!</p>
            
            <p>Il Team di Villa Ingrosso<br>
            📍 Leporano Marina, Puglia<br>
            🌊 A 300m dal mare cristallino</p>
        </div>
        <div class="footer">
            <p>Questa email è stata inviata automaticamente. Non rispondere a questa email.</p>
        </div>
    </div>
</body>
</html>
  `;
}