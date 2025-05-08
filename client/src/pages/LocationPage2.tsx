import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Umbrella, Utensils, Store, Landmark } from "lucide-react";

interface LocationFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function LocationPage2() {
  // Definizione statica delle caratteristiche locali
  const localFeatures: LocationFeature[] = [
    {
      icon: <Umbrella />,
      title: "Spiagge",
      description: "Diverse spiagge a pochi minuti di distanza, tra cui la famosa spiaggia di Saturo"
    },
    {
      icon: <Utensils />,
      title: "Ristoranti",
      description: "Ottimi ristoranti di pesce e cucina locale a meno di 1 km dalla villa"
    },
    {
      icon: <Store />,
      title: "Negozi e supermercati",
      description: "Supermercati e negozi di alimentari a pochi minuti di auto"
    },
    {
      icon: <Landmark />,
      title: "Siti storici",
      description: "Vicino a numerosi siti archeologici e storici, incluso il Castello di Leporano"
    }
  ];
  
  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = "Posizione - Villa Ingrosso";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = "Scopri la posizione privilegiata di Villa Ingrosso a Leporano, a soli 300 metri dal mare. Informazioni sulla località e sui servizi nelle vicinanze.";
    
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
        <section className="py-20 bg-cyan-50 bg-opacity-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-cyan-600">
                Posizione
              </h2>
              <p className="text-lg max-w-3xl mx-auto">
                Villa Ingrosso si trova in una posizione privilegiata a Leporano, a soli 300 metri dal mare
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/2">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-display font-semibold mb-4 text-cyan-600">
                    Nelle vicinanze
                  </h3>
                  
                  <div className="space-y-4">
                    {localFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-1 mr-4 text-cyan-500">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{feature.title}</h4>
                          <p className="text-neutral-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="h-96 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12249.417118366299!2d17.307386676599!3d40.3766118234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1347894b3c4204a3%3A0x596ce4dee97afe53!2s74020%20Leporano%20TA!5e0!3m2!1sit!2sit!4v1653495421234!5m2!1sit!2sit" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mappa di Villa Ingrosso a Leporano"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
