import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Lightbox from "@/components/Lightbox";

// Definizione delle immagini divise per categoria
// INTERNI DELLA CASA
const interiorImages = [
  {
    src: "/attached_assets/PHOTO-2025-03-21-10-45-10.jpg",
    alt: "Soggiorno con divani e area pranzo",
    category: "interior"
  },
  {
    src: "/attached_assets/PHOTO-2025-03-21-10-45-12 2.jpg",
    alt: "Bagno moderno con doccia a vetro",
    category: "interior"
  },
  {
    src: "/attached_assets/PHOTO-2025-03-21-10-45-12.jpg",
    alt: "Altro angolo del bagno moderno",
    category: "interior"
  },
  {
    src: "/attached_assets/PHOTO-2025-03-21-11-55-28.jpg",
    alt: "Camera da letto matrimoniale",
    category: "interior"
  },
  {
    src: "/attached_assets/camera1.jpg",
    alt: "Camera da letto principale",
    category: "interior"
  },
  {
    src: "/attached_assets/cucina-1.JPG",
    alt: "Cucina completamente attrezzata",
    category: "interior"
  },
  {
    src: "/attached_assets/corridoio.JPG",
    alt: "Corridoio e spazi interni",
    category: "interior"
  },
  
];

// ESTERNI DELLA CASA
const exteriorImages = [
  {
    src: "/attached_assets/entrata-villa.jpeg",
    alt: "Entrata principale della villa",
    category: "exterior"
  },
  {
    src: "/attached_assets/giardino 1.jpeg",
    alt: "Giardino curato con spazi verdi",
    category: "exterior"
  },
  {
    src: "/attached_assets/patio-1.JPG",
    alt: "Patio con zone relax all'aperto",
    category: "exterior"
  },
  {
    src: "/attached_assets/PHOTO-2025-05-02-18-28-51.jpg",
    alt: "Vista panoramica dalla terrazza",
    category: "exterior"
  },
  {
    src: "/attached_assets/PHOTO-2025-05-02-18-28-51 2.jpg",
    alt: "Area relax in veranda",
    category: "exterior"
  },
  {
    src: "/attached_assets/PHOTO-2025-03-21-14-47-14.jpg",
    alt: "Zona living nel giardino",
    category: "exterior"
  },
  {
    src: "/attached_assets/WhatsApp%20Image%202025-05-02%20at%2018.28.50.jpeg",
    alt: "Dettaglio panoramico",
    category: "exterior"
  },
  {
    src: "/attached_assets/WhatsApp%20Image%202025-05-02%20at%2018.28.51.jpeg",
    alt: "Scorcio esterno",
    category: "exterior"
  },
  {
    src: "/attached_assets/WhatsApp%20Image%202025-05-02%20at%2018.31.24.jpeg", 
    alt: "Vista laterale della villa",
    category: "exterior"
  }
];

export default function GalleryTabs() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"interior" | "exterior">("interior");
  const { t } = useLanguage();

  const openLightbox = (src: string, alt: string) => {
    setSelectedImage(src);
    setImageAlt(alt);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-cyan-600">
            {t("gallery.title")}
          </h2>
          <p className="text-lg max-w-3xl mx-auto mb-8">
            {t("gallery.description")}
          </p>
          
          {/* Nav tabs per la navigazione */}
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex border-b border-gray-200">
              <button 
                className={`flex-1 py-3 px-4 text-lg font-medium transition-colors duration-300 ${activeTab === "interior" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-gray-600 hover:text-cyan-500"}`}
                onClick={() => setActiveTab("interior")}
              >
                {t("gallery.interior")}
              </button>
              <button 
                className={`flex-1 py-3 px-4 text-lg font-medium transition-colors duration-300 ${activeTab === "exterior" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-gray-600 hover:text-cyan-500"}`}
                onClick={() => setActiveTab("exterior")}
              >
                {t("gallery.exterior")}
              </button>
            </div>
          </div>
            
          {/* Contenuto tab interni */}
          <div className={`transition-opacity duration-300 ${activeTab === "interior" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {interiorImages.map((image, index) => (
                <div 
                  key={`interior-${index}`} 
                  className="gallery-image overflow-hidden rounded-lg shadow-md h-64 cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
                  onClick={() => openLightbox(image.src, image.alt)}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-sm font-medium">{image.alt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            
          {/* Contenuto tab esterni */}
          <div className={`transition-opacity duration-300 ${activeTab === "exterior" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {exteriorImages.map((image, index) => (
                <div 
                  key={`exterior-${index}`} 
                  className="gallery-image overflow-hidden rounded-lg shadow-md h-64 cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
                  onClick={() => openLightbox(image.src, image.alt)}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-sm font-medium">{image.alt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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