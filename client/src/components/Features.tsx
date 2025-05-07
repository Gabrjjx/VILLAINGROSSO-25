import { Home, UtensilsCrossed, Waves, Bed, MapPin, Shield } from "lucide-react";

const features = [
  {
    icon: <Home className="text-secondary-sea text-2xl" />,
    title: "Spazi Lussuosi",
    description: "Ambienti spaziosi e arredati con gusto, pensati per il massimo comfort durante il vostro soggiorno."
  },
  {
    icon: <UtensilsCrossed className="text-secondary-sea text-2xl" />,
    title: "Cucina Moderna",
    description: "Cucina completamente attrezzata con elettrodomestici di alta qualità e tutto il necessario per preparare deliziosi pasti."
  },
  {
    icon: <Waves className="text-secondary-sea text-2xl" />,
    title: "Area Esterna",
    description: "Godetevi la splendida terrazza con zona relax e pranzo all'aperto, perfetta per le serate estive."
  },
  {
    icon: <Bed className="text-secondary-sea text-2xl" />,
    title: "Camere Confortevoli",
    description: "Camere da letto eleganti con letti di qualità e biancheria di pregio per un riposo rigenerante."
  },
  {
    icon: <MapPin className="text-secondary-sea text-2xl" />,
    title: "Posizione Strategica",
    description: "A soli 300 metri dalla spiaggia e a breve distanza dai principali punti di interesse della zona."
  },
  {
    icon: <Shield className="text-secondary-sea text-2xl" />,
    title: "Sicurezza e Privacy",
    description: "Proprietà recintata con sistema di sicurezza per garantirvi un soggiorno sereno e tranquillo."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-primary-sea bg-opacity-5 section-fade">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-primary-sea">
            Caratteristiche della Villa
          </h2>
          <p className="text-lg max-w-3xl mx-auto">
            Scopri tutti i comfort e le caratteristiche che rendono Villa Ingrosso un luogo speciale per le tue vacanze.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-14 h-14 bg-secondary-sea bg-opacity-20 rounded-full flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-primary-sea">
                {feature.title}
              </h3>
              <p className="text-neutral-dark-sea">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
