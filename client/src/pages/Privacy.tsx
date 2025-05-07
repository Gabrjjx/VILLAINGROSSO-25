import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="font-body text-neutral-900 bg-white min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-16">
        <div className="mb-10">
          <Link href="/">
            <a className="inline-flex items-center text-cyan-600 hover:text-cyan-700 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Torna alla home</span>
            </a>
          </Link>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-medium mb-8 relative inline-block">
            Privacy Policy
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500 transform translate-y-2"></span>
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p>Questa Informativa sulla Privacy descrive come vengono raccolti, utilizzati e condivisi i tuoi dati personali quando visiti o interagisci con il sito web di Villa Ingrosso.</p>
            
            <h2>Informazioni che raccogliamo</h2>
            <p>Quando visiti il nostro sito web, raccogliamo automaticamente alcune informazioni sul tuo dispositivo, inclusi dati sul browser web, indirizzo IP, fuso orario e alcuni dei cookie installati sul tuo dispositivo.</p>
            
            <h2>Come utilizziamo le tue informazioni personali</h2>
            <p>Utilizziamo le informazioni raccolte per:</p>
            <ul>
              <li>Gestire le prenotazioni e le richieste</li>
              <li>Comunicare con te riguardo ai nostri servizi</li>
              <li>Migliorare e ottimizzare il nostro sito web</li>
              <li>Prevenire attività fraudolente</li>
            </ul>
            
            <h2>Condivisione delle tue informazioni personali</h2>
            <p>Condividiamo le tue informazioni personali solo con terze parti che ci aiutano a utilizzare i tuoi dati personali come descritto sopra.</p>
            
            <h2>I tuoi diritti</h2>
            <p>Se sei residente nell'Unione Europea, hai il diritto di accedere alle informazioni personali che deteniamo su di te e di chiedere che le tue informazioni personali siano corrette, aggiornate o cancellate.</p>
            
            <h2>Modifiche</h2>
            <p>Potremmo aggiornare questa informativa sulla privacy di tanto in tanto per riflettere, ad esempio, cambiamenti nelle nostre pratiche o per altri motivi operativi, legali o normativi.</p>
            
            <h2>Contattaci</h2>
            <p>Per ulteriori informazioni sulle nostre pratiche in materia di privacy, se hai domande o se desideri presentare un reclamo, contattaci via e-mail all'indirizzo g.ingrosso@villaingrosso.com.</p>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}