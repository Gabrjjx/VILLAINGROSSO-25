import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import LocalRecommendations from "@/components/LocalRecommendations";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function RecommendationsPage() {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Set page title and meta description for SEO based on language
    document.title = language === 'it' 
      ? "Consigli Locali - Villa Ingrosso" 
      : "Local Recommendations - Villa Ingrosso";
    
    // Add meta description in current language
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = language === 'it'
      ? "Scopri i nostri consigli locali per la tua vacanza a Leporano. Le migliori spiagge, ristoranti, attrazioni e luoghi da visitare nei dintorni di Villa Ingrosso."
      : "Discover our local recommendations for your vacation in Leporano. The best beaches, restaurants, attractions, and places to visit around Villa Ingrosso.";
    
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
        <LocalRecommendations />
      </div>
      <Footer />
    </div>
  );
}
