import { MapPin, Car, Wifi, Sparkles, Waves, Compass, Anchor } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  
  const features = [
    { icon: <MapPin className="w-5 h-5" />, text: t("about.feature1") },
    { icon: <Car className="w-5 h-5" />, text: t("about.feature2") },
    { icon: <Wifi className="w-5 h-5" />, text: t("about.feature3") },
    { icon: <Sparkles className="w-5 h-5" />, text: t("about.feature4") }
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
              <span className="block font-light text-lg text-cyan-600 mb-2">{t("about.subtitle")}</span>
              <span className="relative inline-block">
                {t("about.title1")} 
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500 transform translate-y-2"></span>
              </span>
              <span className="block mt-1">{t("about.title2")}</span>
            </h2>
            
            <div className="space-y-6 text-neutral-700">
              <p className="text-lg leading-relaxed">
                {t("about.description1")}
              </p>
              <p className="text-lg leading-relaxed">
                {t("about.description2")}
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
          
          {/* Image grid - spanning 7 columns, just 2 images */}
          <div className="lg:col-span-7 lg:pl-6 grid grid-cols-12 gap-4">
            <motion.div 
              className="col-span-7 row-span-1 relative rounded-2xl overflow-hidden shadow-xl h-64"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <img 
                src="/attached_assets/giardino 1.jpeg" 
                alt="Giardino esterno di Villa Ingrosso" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <motion.div 
              className="col-span-5 row-span-1 relative rounded-2xl overflow-hidden shadow-xl h-64"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <img 
                src="/attached_assets/entrata-villa.jpeg" 
                alt="Entrata di Villa Ingrosso" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
        
        {/* Coastal section - Full width */}
        <div className="mt-24 pt-16 border-t border-blue-100">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl md:text-3xl font-display font-medium mb-4">
              <span className="text-cyan-600">
                <Waves className="inline-block w-6 h-6 mr-2 mb-1" />
                {t("about.coastTitle")}
              </span>
            </h3>
            <p className="text-lg max-w-3xl mx-auto text-neutral-700">
              {t("about.coastDescription")}
            </p>
          </motion.div>
          
          {/* Coastal images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-xl h-64"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" 
                alt="Mare cristallino" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <Anchor className="w-5 h-5 mb-2" />
                  <h4 className="font-medium">{t("about.beach1")}</h4>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-xl h-64"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" 
                alt="Spiagge ioniche" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <Compass className="w-5 h-5 mb-2" />
                  <h4 className="font-medium">{t("about.beach2")}</h4>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-xl h-64"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1471922694854-ff1b63b20054?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80" 
                alt="Tramonto sul Mare" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <Waves className="w-5 h-5 mb-2" />
                  <h4 className="font-medium">{t("about.beach3")}</h4>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
