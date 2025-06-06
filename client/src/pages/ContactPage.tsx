import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import VillaAnalytics from "@/lib/gtm-analytics";

export default function ContactPage() {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Set page title and meta description for SEO based on language
    document.title = language === 'it' 
      ? "Contatti - Villa Ingrosso" 
      : "Contact - Villa Ingrosso";
    
    // Track Contact page view with GTM
    VillaAnalytics.trackPageView('/contact', document.title);
    VillaAnalytics.trackPugliaEngagement('contact_page', 'page_load', 'lead_generation');
    
    // Add meta description in current language
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = language === 'it'
      ? "Contatta Villa Ingrosso per prenotare la tua vacanza a Leporano. Email: g.ingrosso@villaingrosso.com, Telefono: 3470896961 / 3292747374"
      : "Contact Villa Ingrosso to book your vacation in Leporano. Email: g.ingrosso@villaingrosso.com, Phone: 3470896961 / 3292747374";
    
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
        <Contact />
      </div>
      <Footer />
    </div>
  );
}
