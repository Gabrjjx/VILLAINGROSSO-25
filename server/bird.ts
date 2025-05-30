// Bird API integration for WhatsApp and SMS communications
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

// Configurazione Bird
const BIRD_API_URL = 'https://api.bird.com';
const BIRD_API_KEY = process.env.BIRD_API_KEY;
const BIRD_WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID;

if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID) {
  console.warn('Bird credentials not configured. WhatsApp/SMS features will be disabled.');
}

// Funzione per inviare messaggi WhatsApp tramite Bird
export async function sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
  if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID) {
    console.error('Bird API not configured properly');
    return false;
  }

  try {
    // Formatta il numero di telefono (rimuovi spazi e caratteri speciali)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('39') ? `+${cleanNumber}` : `+39${cleanNumber}`;

    const payload: BirdMessagePayload = {
      receiver: {
        contact: {
          identifierValue: formattedNumber
        }
      },
      body: {
        text: {
          text: message
        }
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
    // Formatta il numero di telefono
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('39') ? `+${cleanNumber}` : `+39${cleanNumber}`;

    const payload: BirdMessagePayload = {
      receiver: {
        contact: {
          identifierValue: formattedNumber
        }
      },
      body: {
        text: {
          text: message
        }
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