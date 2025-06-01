// Versione semplificata di sendgrid.ts per usare solo Bird API
import { 
  sendWhatsApp as birdSendWhatsApp, 
  sendSMS as birdSendSMS,
  createBookingConfirmationWhatsApp,
  createWelcomeWhatsApp,
  createCheckoutReminderWhatsApp,
  createAdminNotificationWhatsApp,
  createBookingConfirmationSMS,
  createWelcomeSMS,
  createCheckoutReminderSMS,
  createAdminNotificationSMS
} from './bird';

interface EmailParams {
  to: string;
  from: string;
  subject?: string;
  text?: string;
  html?: string;
}

// Funzioni placeholder che usano Bird API
export async function sendEmail(params: EmailParams): Promise<boolean> {
  console.log('SendGrid disabled, use Bird API instead');
  return false;
}

export async function sendWelcomeEmail(guestEmail: string, guestName: string): Promise<boolean> {
  console.log('SendGrid disabled, use Bird API instead');
  return false;
}

export async function addToNewsletter(email: string, firstName: string = ''): Promise<boolean> {
  console.log('SendGrid disabled, use Bird API instead');
  return false;
}

export async function sendNewsletter(subject: string, content: string, listId?: string): Promise<boolean> {
  console.log('SendGrid disabled, use Bird API instead');
  return false;
}

export async function sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
  return await birdSendWhatsApp(phoneNumber, message);
}

export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  return await birdSendSMS(phoneNumber, message);
}

export function createBookingConfirmationEmail(
  guestName: string,
  checkIn: string,
  checkOut: string,
  villaDetails: string
): string {
  return `<h1>Booking Confirmation</h1><p>Dear ${guestName}, your booking is confirmed.</p>`;
}

export function createContactNotificationEmail(
  name: string,
  email: string,
  phone: string,
  message: string,
  subject: string
): string {
  return `<h1>New Contact</h1><p>From: ${name} (${email})</p><p>Message: ${message}</p>`;
}

// Esporta anche le funzioni Bird
export {
  createBookingConfirmationWhatsApp,
  createWelcomeWhatsApp,
  createCheckoutReminderWhatsApp,
  createAdminNotificationWhatsApp,
  createBookingConfirmationSMS,
  createWelcomeSMS,
  createCheckoutReminderSMS,
  createAdminNotificationSMS
};