import { createContext, useState, useContext, useEffect, ReactNode } from "react";

// Import delle traduzioni
import it from "@/translations/it";
import en from "@/translations/en";

// Tipi di lingue supportate
export type Language = "it" | "en";

// Mappa delle traduzioni
const translations = {
  it,
  en
};

// Tipo del contesto
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Valore predefinito del contesto
const defaultValue: LanguageContextType = {
  language: "it",
  setLanguage: () => {},
  t: () => "",
};

// Creazione del contesto
const LanguageContext = createContext<LanguageContextType>(defaultValue);

// Hook personalizzato per usare il contesto
export const useLanguage = () => useContext(LanguageContext);

// Provider del contesto
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Stato per la lingua corrente
  const [language, setLanguage] = useState<Language>("it");

  // Salva la preferenza di lingua nell'localStorage
  useEffect(() => {
    // Verifica se è disponibile una preferenza di lingua
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "it" || savedLanguage === "en")) {
      setLanguage(savedLanguage);
    } else {
      // Imposta la lingua in base al browser dell'utente
      const browserLanguage = navigator.language.split("-")[0];
      if (browserLanguage === "en") {
        setLanguage("en");
      }
    }
  }, []);

  // Aggiorna la preferenza di lingua quando viene cambiata
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Funzione per ottenere le traduzioni basate su chiavi nidificate
  // esempio: t("nav.home") restituisce "Home" o "Home" a seconda della lingua
  const translate = (key: string): string => {
    // Scompone la chiave per accedere a oggetti nidificati
    const keys = key.split(".");
    
    // Inizia dal dizionario della lingua corrente
    let value: any = translations[language];
    
    // Naviga attraverso le chiavi nidificate
    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }
    
    // Se non è stato trovato un valore, restituisce la chiave stessa
    return value !== undefined ? value : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t: translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};