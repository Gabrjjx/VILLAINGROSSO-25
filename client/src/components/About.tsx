import { MapPin, Car, Wifi } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-20 section-fade">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Interni eleganti di Villa Ingrosso" 
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-primary-sea">
              Benvenuti a Villa Ingrosso
            </h2>
            <p className="text-lg mb-6 leading-relaxed">
              Villa Ingrosso è un'elegante casa vacanza situata nella pittoresca Leporano, a soli 300 metri dal cristallino mare del Mediterraneo. La nostra villa combina il fascino tradizionale pugliese con comfort moderni per offrirvi un soggiorno indimenticabile.
            </p>
            <p className="text-lg mb-8 leading-relaxed">
              Progettata per chi cerca relax e raffinatezza, Villa Ingrosso è il rifugio perfetto per le vostre vacanze, lontano dal caos ma vicino a tutte le attrazioni che la costa ionica ha da offrire.
            </p>
            <div className="flex flex-wrap items-center gap-4 md:gap-8">
              <div className="flex items-center text-secondary-sea">
                <MapPin className="w-5 h-5 mr-2" />
                <span>A 300m dal mare</span>
              </div>
              <div className="flex items-center text-secondary-sea">
                <Car className="w-5 h-5 mr-2" />
                <span>Parcheggio privato</span>
              </div>
              <div className="flex items-center text-secondary-sea">
                <Wifi className="w-5 h-5 mr-2" />
                <span>Wi-Fi gratuito</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
