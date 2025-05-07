import { useLanguage, Language } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleLanguageChange("it")}
        className={`text-xs font-medium px-2 py-1 rounded-full transition-all ${
          language === "it"
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            : "text-neutral-500 hover:text-neutral-700"
        }`}
        aria-label="Cambia lingua in Italiano"
      >
        IT
      </button>
      
      <span className="text-neutral-300">|</span>
      
      <button
        onClick={() => handleLanguageChange("en")}
        className={`text-xs font-medium px-2 py-1 rounded-full transition-all ${
          language === "en"
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
            : "text-neutral-500 hover:text-neutral-700"
        }`}
        aria-label="Change language to English"
      >
        EN
      </button>
    </div>
  );
}