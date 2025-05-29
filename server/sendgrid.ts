import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Template per email di conferma prenotazione
export function createBookingConfirmationEmail(
  guestEmail: string,
  guestName: string,
  checkIn: string,
  checkOut: string,
  guests: number
) {
  return {
    to: guestEmail,
    from: 'g.ingrosso@villaingrosso.com',
    subject: 'Conferma Prenotazione - Villa Ingrosso',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">Villa Ingrosso - Conferma Prenotazione</h2>
        
        <p>Gentile ${guestName},</p>
        
        <p>La ringraziamo per aver scelto Villa Ingrosso per la sua vacanza. Siamo lieti di confermare la sua prenotazione:</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0891b2; margin-top: 0;">Dettagli Prenotazione</h3>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Ospiti:</strong> ${guests}</p>
        </div>
        
        <p>Villa Ingrosso si trova a Leporano, a soli 300 metri dal mare cristallino della costa ionica. La aspettiamo per un soggiorno indimenticabile!</p>
        
        <p>Per qualsiasi domanda, non esiti a contattarci:</p>
        <ul>
          <li>📧 Email: g.ingrosso@villaingrosso.com</li>
          <li>📞 Telefono: +39 347 089 6961 / +39 329 274 7374</li>
        </ul>
        
        <p>Cordiali saluti,<br>Il team di Villa Ingrosso</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #64748b; font-size: 12px;">
          Villa Ingrosso - Elegante casa vacanza a Leporano<br>
          A 300m dal mare • Costa Ionica • Puglia
        </p>
      </div>
    `,
    text: `
Villa Ingrosso - Conferma Prenotazione

Gentile ${guestName},

La ringraziamo per aver scelto Villa Ingrosso per la sua vacanza. Siamo lieti di confermare la sua prenotazione:

Dettagli Prenotazione:
- Check-in: ${checkIn}
- Check-out: ${checkOut}
- Ospiti: ${guests}

Villa Ingrosso si trova a Leporano, a soli 300 metri dal mare cristallino della costa ionica.

Per qualsiasi domanda:
Email: g.ingrosso@villaingrosso.com
Telefono: +39 347 089 6961 / +39 329 274 7374

Cordiali saluti,
Il team di Villa Ingrosso
    `
  };
}

// Template per notifica di richiesta di contatto
export function createContactNotificationEmail(
  name: string,
  email: string,
  message: string
) {
  return {
    to: 'g.ingrosso@villaingrosso.com',
    from: 'g.ingrosso@villaingrosso.com',
    subject: `Nuova richiesta di contatto da ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">Nuova Richiesta di Contatto</h2>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Messaggio:</strong></p>
          <p style="background-color: white; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
        
        <p>Puoi rispondere direttamente a questa email per contattare l'ospite.</p>
      </div>
    `,
    text: `
Nuova Richiesta di Contatto

Nome: ${name}
Email: ${email}

Messaggio:
${message}
    `
  };
}