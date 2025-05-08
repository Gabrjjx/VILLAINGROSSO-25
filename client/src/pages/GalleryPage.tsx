import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Lightbox from "@/components/Lightbox";

export default function GalleryPage2() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string>("");
  
  // Definizione statica delle immagini
  const galleryImages = [
    {
      src: "/attached_assets/camera1.jpg",
      alt: "Camera da letto di Villa Ingrosso",
    },
    {
      src: "/attached_assets/cucina-1.JPG",
      alt: "Cucina di Villa Ingrosso",
    },
    {
      src: "/attached_assets/corridoio.JPG",
      alt: "Corridoio e interni di Villa Ingrosso",
    },
    {
      src: "/attached_assets/patio-1.JPG",
      alt: "Patio esterno di Villa Ingrosso",
    },
    {
      src: "/attached_assets/corridoio-entrata.jpeg",
      alt: "Corridoio d'entrata di Villa Ingrosso",
    },
    {
      src: "/attached_assets/entrata-villa.jpeg",
      alt: "Entrata di Villa Ingrosso",
    },
    {
      src: "/attached_assets/giardino 1.jpeg",
      alt: "Giardino di Villa Ingrosso",
    },
  ];
  
  const openLightbox = (src: string, alt: string) => {
    setSelectedImage(src);
    setImageAlt(alt);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };
  
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
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-cyan-600">
                Galleria fotografica
              </h2>
              <p className="text-lg max-w-3xl mx-auto">
                Esplora gli spazi interni ed esterni di Villa Ingrosso attraverso la nostra galleria fotografica
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryImages.map((image, index) => (
                <div 
                  key={index} 
                  className="gallery-image overflow-hidden rounded-lg shadow-md h-64"
                  onClick={() => openLightbox(image.src, image.alt)}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {selectedImage && (
            <Lightbox
              src={selectedImage}
              alt={imageAlt}
              onClose={closeLightbox}
            />
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
