// Configurazione email per diversi tipi di comunicazione
export interface EmailConfig {
  from: string;
  name: string;
  type: 'noreply' | 'support' | 'booking' | 'admin' | 'newsletter';
}

export const EMAIL_CONFIGS: Record<string, EmailConfig> = {
  // Email per reset password e comunicazioni automatiche
  NOREPLY: {
    from: 'noreply@villaingrosso.com',
    name: 'Villa Ingrosso',
    type: 'noreply'
  },
  
  // Email per supporto clienti e chat
  SUPPORT: {
    from: 'support@villaingrosso.com', 
    name: 'Villa Ingrosso Support',
    type: 'support'
  },
  
  // Email per conferme prenotazioni
  BOOKING: {
    from: 'booking@villaingrosso.com',
    name: 'Villa Ingrosso Prenotazioni',
    type: 'booking'
  },
  
  // Email per notifiche admin
  ADMIN: {
    from: 'admin@villaingrosso.com',
    name: 'Villa Ingrosso Admin',
    type: 'admin'
  },
  
  // Email per newsletter
  NEWSLETTER: {
    from: 'newsletter@villaingrosso.com',
    name: 'Villa Ingrosso News',
    type: 'newsletter'
  }
};

export function getEmailConfig(type: keyof typeof EMAIL_CONFIGS): EmailConfig {
  return EMAIL_CONFIGS[type];
}

// Funzione per ottenere la configurazione email appropriata per ogni caso d'uso
export function getEmailForType(emailType: 'reset' | 'welcome' | 'booking' | 'contact' | 'newsletter' | 'admin'): EmailConfig {
  switch (emailType) {
    case 'reset':
      return EMAIL_CONFIGS.NOREPLY;
    case 'welcome':
      return EMAIL_CONFIGS.NOREPLY;
    case 'booking':
      return EMAIL_CONFIGS.BOOKING;
    case 'contact':
      return EMAIL_CONFIGS.ADMIN;
    case 'newsletter':
      return EMAIL_CONFIGS.NEWSLETTER;
    case 'admin':
      return EMAIL_CONFIGS.ADMIN;
    default:
      return EMAIL_CONFIGS.NOREPLY;
  }
}