import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

// Definizione del tipo per l`oggetto window con dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Componente di debug per Google Analytics
 * Mostra nella pagina quando vengono inviati eventi a Google Analytics
 * Utile solo in ambiente di sviluppo
 */
const GoogleAnalyticsDebug: React.FC = () => {
  const [location] = useLocation();
  const [events, setEvents] = useState<string[]>([]);
  const [showDebugger, setShowDebugger] = useState(false);
  
  // Monitora i cambiamenti di URL per simulare il tracciamento di pagina
  useEffect(() => {
    // Registra l`evento di pageview
    if (location) {
      setEvents(prev => [`Pageview: ${location}`, ...prev.slice(0, 9)]);
    }
  }, [location]);
  
  // Intercetta i dataLayer.push se possibile
  useEffect(() => {
    if (typeof window === "undefined" || !window.dataLayer) return;
    
    const originalPush = Array.prototype.push;
    
    window.dataLayer.push = function() {
      // Converti l`evento in stringa leggibile
      let eventName = "Unknown Event";
      try {
        if (arguments[0]?.event) {
          eventName = `Event: ${arguments[0].event}`;
        } else if (arguments[0]?.[0] === "config") {
          eventName = `Config: ${arguments[0][1]}`;
        } else {
          eventName = `Data: ${JSON.stringify(arguments[0]).substring(0, 50)}...`;
        }
      } catch (e) {
        console.error("Error parsing GA event", e);
      }
      
      // Aggiorna gli eventi
      setEvents(prev => [eventName, ...prev.slice(0, 9)]);
      
      // Chiamata originale
      // @ts-ignore - Ignora errori di tipo per questo caso specifico
      return originalPush.apply(this, arguments);
    };
    
    // Pulizia
    return () => {
      if (window.dataLayer) {
        window.dataLayer.push = originalPush;
      }
    };
  }, []);
  
  // Controlla se siamo in ambiente di sviluppo
  const isDev = typeof window !== "undefined" && 
                (window.location.hostname === "localhost" || 
                window.location.hostname.includes("replit"));
  
  // Non mostrare nulla in produzione
  if (!isDev) return null;
  
  return (
    <div 
      className="fixed bottom-24 right-6 z-40 flex flex-col items-end"
      style={{ pointerEvents: "none" }}
    >
      {/* Toggle button */}
      <button 
        className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-lg mb-2"
        style={{ pointerEvents: "auto" }}
        onClick={() => setShowDebugger(prev => !prev)}
      >
        {showDebugger ? "Nascondi GA Debug" : "Mostra GA Debug"}
      </button>
      
      {/* Debug info */}
      {showDebugger && (
        <div 
          className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-lg shadow-lg p-3 w-72 max-h-60 overflow-y-auto text-xs"
          style={{ pointerEvents: "auto" }}
        >
          <div className="font-bold text-blue-800 mb-2">Google Analytics Debug</div>
          <div className="text-xs text-gray-500 mb-2">
            Ultimi eventi GA (ID: G-4XTWR8TM7C)
          </div>
          {events.length === 0 ? (
            <div className="text-gray-500 italic">Nessun evento registrato...</div>
          ) : (
            <ul className="text-xs">
              {events.map((event, i) => (
                <li key={i} className="py-1 border-b border-gray-100 last:border-0">
                  {event}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleAnalyticsDebug;
