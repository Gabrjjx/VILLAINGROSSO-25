import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import { useLanguage } from "@/context/LanguageContext";

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
  // Nuove immagini aggiunte
  {
    src: "/img/villa/vista-terrazzo.jpg",
    alt: "Vista panoramica dal terrazzo di Villa Ingrosso",
  },
  {
    src: "/img/villa/veranda-relax.jpg",
    alt: "Area relax sulla veranda di Villa Ingrosso",
  },
  {
    src: "/img/villa/giardino-esterno.jpg",
    alt: "Zona living esterna nel giardino di Villa Ingrosso",
  },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string>("");
  const { t } = useLanguage();

  const openLightbox = (src: string, alt: string) => {
    setSelectedImage(src);
    setImageAlt(alt);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <section id="gallery" className="py-20 section-fade">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-cyan-600">
            {t("gallery.title")}
          </h2>
          <p className="text-lg max-w-3xl mx-auto">
            {t("gallery.description")}
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
  );
}
