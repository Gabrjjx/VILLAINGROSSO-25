import { motion } from "framer-motion";
import { fadeIn } from "@/lib/framer-animations";

export default function Hero() {
  return (
    <section 
      id="home" 
      className="relative h-[90vh] bg-cover bg-center flex items-center" 
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1000&q=80')" 
      }}
    >
      <div className="absolute inset-0 bg-overlay"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-2xl text-white"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            Villa Ingrosso
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Eleganza mediterranea a soli 300m dal mare di Leporano
          </p>
          <a 
            href="#contact" 
            className="inline-block bg-secondary-sea text-white font-semibold px-8 py-3 rounded hover:bg-opacity-90 transition-all shadow-lg"
          >
            Prenota Ora
          </a>
        </motion.div>
      </div>
    </section>
  );
}
