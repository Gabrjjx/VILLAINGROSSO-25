import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Location from "@/components/Location";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function LocationPage() {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Set page title and meta description for SEO based on language
    document.title = language === 'it' 
      ? "Posizione - Villa Ingrosso" 
      : "Location - Villa Ingrosso";
    
    // Add meta description in current language
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = language === 'it'
      ? "Scopri la posizione privilegiata di Villa Ingrosso a Leporano, a soli 300 metri dal mare. Informazioni sulla località e sui servizi nelle vicinanze."
      : "Discover the privileged location of Villa Ingrosso in Leporano, just 300 meters from the sea. Information about the area and nearby services.";
    
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptionContent);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = descriptionContent;
      document.head.appendChild(newMeta);
    }
    
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [language]);

  return (
    <div className="font-body text-neutral-900 bg-white">
      <Navbar />
      <div className="pt-24">
        <Location />
      </div>
      <Footer />
    </div>
  );
}
