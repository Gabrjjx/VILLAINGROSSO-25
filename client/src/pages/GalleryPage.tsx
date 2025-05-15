import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryNew from "@/components/GalleryNew";
import { useLanguage } from "@/context/LanguageContext";

export default function GalleryPage() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = "Galleria - Villa Ingrosso";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = "Esplora la galleria fotografica di Villa Ingrosso, elegante casa vacanza a Leporano. Scopri gli interni e gli esterni della villa attraverso le nostre foto.";
    
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
  }, []);

  return (
    <div className="font-body text-neutral-900 bg-white">
      <Navbar />
      <div className="pt-24">
        {/* Utilizziamo il nuovo componente GalleryNew con la struttura a tab */}
        <GalleryNew />
      </div>
      <Footer />
    </div>
  );
}
