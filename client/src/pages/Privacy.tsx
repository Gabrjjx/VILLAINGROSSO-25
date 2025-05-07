import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function Privacy() {
  const { t } = useLanguage();
  
  return (
    <div className="font-body text-neutral-900 bg-white min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-16">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center text-cyan-600 hover:text-cyan-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>{t("privacy.backHome")}</span>
          </Link>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-medium mb-8 relative inline-block">
            {t("privacy.title")}
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500 transform translate-y-2"></span>
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p>{t("privacy.intro")}</p>
            
            <h2>{t("privacy.collect.title")}</h2>
            <p>{t("privacy.collect.description")}</p>
            
            <h2>{t("privacy.use.title")}</h2>
            <p>{t("privacy.use.description")}</p>
            <ul>
              <li>{t("privacy.use.item1")}</li>
              <li>{t("privacy.use.item2")}</li>
              <li>{t("privacy.use.item3")}</li>
              <li>{t("privacy.use.item4")}</li>
            </ul>
            
            <h2>{t("privacy.share.title")}</h2>
            <p>{t("privacy.share.description")}</p>
            
            <h2>{t("privacy.rights.title")}</h2>
            <p>{t("privacy.rights.description")}</p>
            
            <h2>{t("privacy.changes.title")}</h2>
            <p>{t("privacy.changes.description")}</p>
            
            <h2>{t("privacy.contact.title")}</h2>
            <p>{t("privacy.contact.description")}</p>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}