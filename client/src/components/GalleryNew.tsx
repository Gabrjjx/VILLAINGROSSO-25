import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Definizione delle immagini divise per categoria
// INTERNI DELLA CASA
const interiorImages = [
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
  {
    src: "/attached_assets/corridoio-entrata.jpeg",
    alt: "Ingresso e corridoio",
    category: "interior"
  },
  {
    src: "/attached_assets/WhatsApp%20Image%202025-05-02%20at%2018.28.51%20(1).jpeg",
    alt: "Dettaglio degli interni",
    category: "interior"
  }
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

export default function GalleryNew() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("interior");
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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-cyan-600">
            {t("gallery.title")}
          </h2>
          <p className="text-lg max-w-3xl mx-auto mb-8">
            {t("gallery.description")}
          </p>
          
          {/* Tabs per navigare tra interni ed esterni */}
          <Tabs 
            defaultValue="interior" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full max-w-2xl mx-auto"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="interior" className="text-lg py-3">
                {t("gallery.interior")}
              </TabsTrigger>
              <TabsTrigger value="exterior" className="text-lg py-3">
                {t("gallery.exterior")}
              </TabsTrigger>
            </TabsList>
            
            {/* Contenuto tab interni */}
            <TabsContent value="interior" className="mt-0">
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
            </TabsContent>
            
            {/* Contenuto tab esterni */}
            <TabsContent value="exterior" className="mt-0">
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
            </TabsContent>
          </Tabs>
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