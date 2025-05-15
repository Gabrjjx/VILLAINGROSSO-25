import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryTabs from "@/components/GalleryTabs";
import { useLanguage } from "@/context/LanguageContext";

export default function GalleryPage() {
  const { t, language } = useLanguage();
  
  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = language === 'it' ? "Galleria - Villa Ingrosso" : "Gallery - Villa Ingrosso";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = language === 'it'
      ? "Esplora la galleria fotografica di Villa Ingrosso, elegante casa vacanza a Leporano. Scopri gli interni e gli esterni della villa attraverso le nostre foto."
      : "Explore the photo gallery of Villa Ingrosso, an elegant vacation home in Leporano. Discover the interior and exterior of the villa through our photos.";
    
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
        {/* Utilizziamo il componente GalleryTabs con la nuova implementazione */}
        <GalleryTabs />
      </div>
      <Footer />
    </div>
  );
}
