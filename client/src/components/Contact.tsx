import { Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute right-1/4 top-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 blur-3xl opacity-30 -z-10"></div>
      <div className="absolute left-1/3 bottom-20 w-72 h-72 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 blur-3xl opacity-40 -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-6">
            <span className="relative inline-block">
              Contattaci
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500 transform translate-y-2"></span>
            </span>
          </h2>
        </motion.div>
        
        <motion.div 
          className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl p-10 md:p-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-8">
              <p className="text-lg md:text-xl text-neutral-700 mb-10 max-w-2xl mx-auto">
                Per informazioni o prenotazioni, non esitare a contattarci:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 mb-4 text-cyan-600">
                    <Mail className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-display font-medium mb-2">Email</h3>
                  <a href="mailto:g.ingrosso@villaingrosso.com" className="text-cyan-600 hover:text-cyan-700 transition-colors">
                    g.ingrosso@villaingrosso.com
                  </a>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 mb-4 text-cyan-600">
                    <Phone className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-display font-medium mb-2">Telefono</h3>
                  <div className="flex flex-col space-y-1">
                    <a href="tel:+393470896961" className="text-cyan-600 hover:text-cyan-700 transition-colors">
                      +39 347 089 6961
                    </a>
                    <a href="tel:+393292747374" className="text-cyan-600 hover:text-cyan-700 transition-colors">
                      +39 329 274 7374
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              className="mt-12 pt-8 border-t border-gray-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-neutral-500 text-sm">
                Saremo lieti di rispondere a qualsiasi domanda riguardo la Villa e aiutarti a organizzare il tuo soggiorno perfetto.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
