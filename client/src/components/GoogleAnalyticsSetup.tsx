import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * GoogleAnalyticsSetup - Inizializza e configura Google Analytics
 * senza dipendere dal tag nell`HTML
 */
const GoogleAnalyticsSetup = () => {
  const [location] = useLocation();
  const TRACKING_ID = "G-4XTWR8TM7C";

  // Inizializzazione di Google Analytics
  useEffect(() => {
    // Crea gli elementi script per GA
    const createGaScripts = () => {
      // Crea l`oggetto dataLayer globale
      if (!window.dataLayer) {
        window.dataLayer = [];
      }
      
      // Definisci la funzione gtag
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      
      // Inizializza con la data corrente
      window.gtag("js", new Date());
      
      // Configura l`ID di tracciamento
      window.gtag("config", TRACKING_ID);
      
      // Crea e aggiungi lo script GA
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
      document.head.appendChild(script);
      
      console.log("Google Analytics Setup completato. ID:", TRACKING_ID);
    };
    
    // Esegui una sola volta all`avvio
    if (!window.gtag) {
      createGaScripts();
    }
  }, []);
  
  // Traccia i cambi di pagina
  useEffect(() => {
    if (window.gtag && location) {
      window.gtag("config", TRACKING_ID, {
        page_path: location,
      });
      console.log("GA: Pageview inviato per", location);
    }
  }, [location, TRACKING_ID]);
  
  // Questo componente non renderizza nulla visibile
  return null;
};

// Definizione delle proprietà per TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default GoogleAnalyticsSetup;
