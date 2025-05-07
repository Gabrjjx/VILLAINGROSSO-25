import { MapPin, Car, Wifi, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const features = [
    { icon: <MapPin className="w-5 h-5" />, text: "A 300m dal mare" },
    { icon: <Car className="w-5 h-5" />, text: "Parcheggio privato" },
    { icon: <Wifi className="w-5 h-5" />, text: "Wi-Fi gratuito" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Design moderno" }
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background decorative element */}
      <div className="absolute right-0 top-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 blur-3xl opacity-50 -z-10"></div>
      <div className="absolute left-0 bottom-1/4 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-cyan-50 blur-3xl opacity-40 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Asymmetric layout with text on left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-8 items-center">
          {/* Text content - spanning 5 columns */}
          <motion.div 
            className="lg:col-span-5 lg:pr-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-medium mb-8">
              <span className="block font-light text-lg text-cyan-600 mb-2">LA NOSTRA STORIA</span>
              <span className="relative inline-block">
                Benvenuti a 
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500 transform translate-y-2"></span>
              </span>
              <span className="block mt-1">Villa Ingrosso</span>
            </h2>
            
            <div className="space-y-6 text-neutral-700">
              <p className="text-lg leading-relaxed">
                Villa Ingrosso è un'<strong>elegante casa vacanza</strong> situata nella pittoresca Leporano, a soli 300 metri dalle acque cristalline del Mediterraneo.
              </p>
              <p className="text-lg leading-relaxed">
                La nostra villa unisce il fascino tradizionale pugliese con un design contemporaneo e comfort moderni per un soggiorno indimenticabile.
              </p>
            </div>
            
            {/* Features */}
            <div className="mt-12 grid grid-cols-2 gap-y-6 gap-x-3">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-600">
                    {feature.icon}
                  </div>
                  <span className="text-neutral-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Image grid - spanning 7 columns, asymmetrically placed */}
          <div className="lg:col-span-7 lg:pl-6 grid grid-cols-12 gap-4">
            <motion.div 
              className="col-span-7 row-span-1 relative rounded-2xl overflow-hidden shadow-xl h-60"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Soggiorno elegante della Villa Ingrosso" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <motion.div 
              className="col-span-5 row-span-2 relative rounded-2xl overflow-hidden shadow-xl h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1615529182904-14819c35db37?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=800&q=80" 
                alt="Vista esterna della Villa Ingrosso" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <motion.div 
              className="col-span-7 row-span-1 relative rounded-2xl overflow-hidden shadow-xl h-60"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1564078516393-cf04bd966897?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" 
                alt="Camera da letto di Villa Ingrosso" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
