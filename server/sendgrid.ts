import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

// Template IDs per le email automatiche
const EMAIL_TEMPLATES = {
  WELCOME: 'd-welcome-template-id', // Da sostituire con l'ID del template SendGrid
  BOOKING_CONFIRMATION: 'd-booking-confirmation-id',
  CHECKOUT_REMINDER: 'd-checkout-reminder-id',
  REVIEW_REQUEST: 'd-review-request-id',
  NEWSLETTER: 'd-newsletter-template-id'
};

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
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true
        },
        openTracking: {
          enable: true
        }
      }
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Email di benvenuto per nuovi ospiti
export async function sendWelcomeEmail(guestEmail: string, guestName: string): Promise<boolean> {
  try {
    await mailService.send({
      to: guestEmail,
      from: 'g.ingrosso@villaingrosso.com',
      templateId: EMAIL_TEMPLATES.WELCOME,
      dynamicTemplateData: {
        guest_name: guestName,
        villa_name: 'Villa Ingrosso',
        location: 'Leporano, Puglia',
        wifi_password: 'VillaIngrosso2025',
        checkin_time: '16:00',
        checkout_time: '10:00',
        contact_phone: '+39 347 089 6961',
        emergency_phone: '+39 329 274 7374'
      },
      trackingSettings: {
        clickTracking: { enable: true, enableText: true },
        openTracking: { enable: true }
      }
    });
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Newsletter subscription
export async function addToNewsletter(email: string, firstName: string = ''): Promise<boolean> {
  try {
    // Aggiunge contatto alla lista newsletter di SendGrid
    const contactData = {
      contacts: [{
        email: email,
        first_name: firstName,
        custom_fields: {
          signup_date: new Date().toISOString(),
          source: 'villa_website'
        }
      }]
    };

    const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    return response.ok;
  } catch (error) {
    console.error('Error adding to newsletter:', error);
    return false;
  }
}

// Invio newsletter
export async function sendNewsletter(subject: string, content: string, listId?: string): Promise<boolean> {
  try {
    await mailService.send({
      to: listId ? { listId } : 'newsletter@villaingrosso.com',
      from: 'g.ingrosso@villaingrosso.com',
      subject: subject,
      html: content,
      trackingSettings: {
        clickTracking: { enable: true, enableText: true },
        openTracking: { enable: true },
        subscriptionTracking: { enable: true }
      }
    });
    return true;
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return false;
  }
}

// SMS tramite SendGrid (richiede integrazione con provider SMS)
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Nota: SendGrid non gestisce SMS direttamente, ma può integrarsi con Twilio
    // Per ora implementiamo un placeholder che può essere esteso
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    // In futuro, integrare con Twilio o altro provider SMS
    // const twilioResponse = await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
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