import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import { useLanguage } from "@/context/LanguageContext";

const galleryImages = [
  {
    src: "https://pixabay.com/get/g5215a310116dc54caf3439a9f9fe3853302d1b0ea856c4894dd58ae8404b5ef38ac1cffa29c784ee1975bd1f9fe22639593771920254116a8ec49953c283fbe1_1280.jpg",
    alt: "Soggiorno di Villa Ingrosso",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Cucina di Villa Ingrosso",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Camera da letto principale di Villa Ingrosso",
  },
  {
    src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Spiaggia vicino a Villa Ingrosso",
  },
  {
    src: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Terrazza esterna di Villa Ingrosso",
  },
  {
    src: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Paesaggio costiero vicino a Villa Ingrosso",
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
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-primary-sea">
            Galleria
          </h2>
          <p className="text-lg max-w-3xl mx-auto">
            Esplora gli spazi di Villa Ingrosso attraverso la nostra galleria fotografica.
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
