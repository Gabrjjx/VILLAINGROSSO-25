import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import { useLanguage } from "@/context/LanguageContext";

// Definizione statica delle immagini
// Utilizziamo percorsi diretti invece dell'importazione delle immagini

// Immagini WhatsApp da includere nella galleria
const whatsappImages = [
  {
    src: "/attached_assets/WhatsApp%20Image%202025-05-02%20at%2018.28.50.jpeg",
    alt: "Dettaglio panoramico di Villa Ingrosso",
  },
  {
    src: "/attached_assets/WhatsApp%20Image%202025-05-02%20at%2018.28.51.jpeg",
    alt: "Scorcio esterno di Villa Ingrosso",
  },
  {
    src: "/attached_assets/WhatsApp%20Image%202025-05-02%20at%2018.28.51%20(1).jpeg",
    alt: "Dettaglio interno di Villa Ingrosso",
  },
  {
    src: "/attached_assets/WhatsApp%20Image%202025-05-02%20at%2018.31.24.jpeg", 
    alt: "Vista laterale di Villa Ingrosso",
  }
];

// Nuovi screenshot aggiunti
const newScreenshots = [
  {
    src: "/attached_assets/Screenshot 2025-05-15 alle 15.28.20.png",
    alt: "Visualizzazione galleria della villa",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-12 alle 10.31.34.png",
    alt: "Dettaglio della villa vista 1",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-12 alle 10.32.47.png",
    alt: "Dettaglio della villa vista 2",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-12 alle 12.21.02.png",
    alt: "Dettaglio della villa vista 3",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-12 alle 16.06.56.png",
    alt: "Dettaglio della villa vista 4",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-12 alle 16.09.59.png",
    alt: "Dettaglio della villa vista 5",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-12 alle 16.12.43.png",
    alt: "Dettaglio della villa vista 6",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-09 alle 09.50.17.png",
    alt: "Vista supplementare della villa 1",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-09 alle 10.06.46.png",
    alt: "Vista supplementare della villa 2",
  },
  {
    src: "/attached_assets/Screenshot 2025-05-09 alle 10.15.50 (2).png",
    alt: "Vista supplementare della villa 3",
  }
];

// Immagini in evidenza
const featuredImages = [
  {
    src: "/attached_assets/PHOTO-2025-05-02-18-28-51.jpg",
    alt: "Vista panoramica dal terrazzo di Villa Ingrosso",
  },
  {
    src: "/attached_assets/PHOTO-2025-05-02-18-28-51 2.jpg",
    alt: "Area relax sulla veranda di Villa Ingrosso",
  },
  {
    src: "/attached_assets/PHOTO-2025-03-21-14-47-14.jpg",
    alt: "Zona living esterna nel giardino di Villa Ingrosso",
  }
];

// Immagini originali
const originalImages = [
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
  }
];

// Unisci tutte le immagini prioritizzando le nuove
const galleryImages = [...newScreenshots, ...whatsappImages, ...featuredImages, ...originalImages];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string>("");
  const { t } = useLanguage();
  
  // Debug: verifica immagini WhatsApp nella console
  console.log("Immagini WhatsApp:", whatsappImages.map(img => img.src));
  console.log("Numero totale immagini:", galleryImages.length);

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
