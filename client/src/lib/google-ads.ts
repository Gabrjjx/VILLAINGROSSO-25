// Google Ads Conversion Tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

/**
 * Traccia una conversione di contatto per Google Ads
 * Utilizzato quando un utente invia un modulo di contatto o richiede informazioni
 * 
 * @param url - URL opzionale per il redirect dopo la conversione
 */
export function trackContactConversion(url?: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('Google Ads tracking not available');
    return;
  }

  const callback = function () {
    if (typeof url !== 'undefined') {
      window.location.href = url;
    }
  };

  window.gtag('event', 'conversion', {
    'send_to': 'AW-17038146595/T1_zCLvx5r4aEKP4tbw_',
    'event_callback': callback
  });
}

/**
 * Versione alternativa che supporta il pattern gtag_report_conversion
 * per compatibilità con il codice fornito da Google Ads
 */
export function gtag_report_conversion(url?: string): boolean {
  trackContactConversion(url);
  return false;
}