import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import VillaAnalytics from "@/lib/gtm-analytics";

export default function AboutPage() {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Set page title and meta description for SEO based on language
    document.title = language === 'it' 
      ? "Chi Siamo - Villa Ingrosso" 
      : "About Us - Villa Ingrosso";
    
    // Track About page view with GTM
    VillaAnalytics.trackPageView('/about', document.title);
    VillaAnalytics.trackPugliaEngagement('about_page', 'page_load', 'information');
    
    // Add meta description in current language
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = language === 'it'
      ? "Scopri Villa Ingrosso: elegante casa vacanza a Leporano, a soli 300 metri dal mare, con un design contemporaneo che unisce tradizione e comfort moderni."
      : "Discover Villa Ingrosso: an elegant vacation home in Leporano, just 300 meters from the sea, featuring contemporary design that combines tradition and modern comfort.";
    
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
        <About />
      </div>
      <Footer />
    </div>
  );
}
