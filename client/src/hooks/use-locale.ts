import { useLanguage } from "@/context/LanguageContext";

export function useLocale() {
  const { t } = useLanguage();
  
  // Funzione utility per gestire le stringhe con interpolazione di variabili
  const formatString = (key: string, params?: Record<string, string | number>) => {
    let text = t(key);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{{${key}}}`, String(value));
      });
    }
    
    return text;
  };
  
  return { formatString };
}