import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* Split layout design */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
        {/* Left side - Text */}
        <motion.div 
          className="z-10 flex flex-col justify-center px-6 md:px-12 lg:px-16 xl:px-24 bg-white"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-medium pb-4"
          >
            <span className="block">{t("hero.title1")}</span>
            <span className="block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">{t("hero.title2")}</span>
            </span>
            <span className="block">{t("hero.title3")}</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-3 md:mt-6 max-w-sm text-neutral-600 font-light text-lg leading-relaxed"
          >
            {t("hero.description")}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-8 md:mt-12"
          >
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium rounded-md transition-all duration-300"
            >
              {t("hero.cta")}
            </a>
          </motion.div>
        </motion.div>
        
        {/* Right side - Image with overlay gradient */}
        <div className="relative h-1/2 md:h-full order-first md:order-last">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('/images/leporano.jpg')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 0.2
        }}
      >
        <a href="#about">
          <ChevronDown className="w-10 h-10 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white" />
        </a>
      </motion.div>
    </section>
  );
}
