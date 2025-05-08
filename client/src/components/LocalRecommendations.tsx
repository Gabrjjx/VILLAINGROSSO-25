import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { TbBeach, TbBuildingMonument, TbChefHat, TbGlass, TbSun } from "react-icons/tb";
import { useIsMobile } from "@/hooks/use-mobile";

interface Recommendation {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  distance?: string;
  category: 'beaches' | 'history' | 'cuisine' | 'entertainment' | 'local';
}

export default function LocalRecommendations() {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  
  // Raccomandazioni per categoria
  const getRecommendations = (): Recommendation[] => {
    return [
      {
        id: "spiaggia-gandoli",
        icon: <TbBeach className="w-8 h-8 text-cyan-500" />,
        title: t("recommendations.beaches.gandoli.title"),
        description: t("recommendations.beaches.gandoli.description"),
        distance: t("recommendations.beaches.gandoli.distance"),
        category: 'beaches'
      },
      {
        id: "spiaggia-saturo",
        icon: <TbBeach className="w-8 h-8 text-cyan-500" />,
        title: t("recommendations.beaches.saturo.title"),
        description: t("recommendations.beaches.saturo.description"),
        distance: t("recommendations.beaches.saturo.distance"),
        category: 'beaches'
      },
      {
        id: "museo-archeologico",
        icon: <TbBuildingMonument className="w-8 h-8 text-amber-500" />,
        title: t("recommendations.history.museum.title"),
        description: t("recommendations.history.museum.description"),
        distance: t("recommendations.history.museum.distance"),
        category: 'history'
      },
      {
        id: "parco-archeologico-saturo",
        icon: <TbBuildingMonument className="w-8 h-8 text-amber-500" />,
        title: t("recommendations.history.park.title"),
        description: t("recommendations.history.park.description"),
        distance: t("recommendations.history.park.distance"),
        category: 'history'
      },
      {
        id: "ristorante-canneto",
        icon: <TbChefHat className="w-8 h-8 text-red-500" />,
        title: t("recommendations.cuisine.canneto.title"),
        description: t("recommendations.cuisine.canneto.description"),
        distance: t("recommendations.cuisine.canneto.distance"),
        category: 'cuisine'
      },
      {
        id: "osteria-del-porto",
        icon: <TbChefHat className="w-8 h-8 text-red-500" />,
        title: t("recommendations.cuisine.osteria.title"),
        description: t("recommendations.cuisine.osteria.description"),
        distance: t("recommendations.cuisine.osteria.distance"),
        category: 'cuisine'
      },
      {
        id: "bar-tramonto",
        icon: <TbGlass className="w-8 h-8 text-purple-500" />,
        title: t("recommendations.entertainment.sunset.title"),
        description: t("recommendations.entertainment.sunset.description"),
        distance: t("recommendations.entertainment.sunset.distance"),
        category: 'entertainment'
      },
      {
        id: "lido-gandoli",
        icon: <TbSun className="w-8 h-8 text-yellow-500" />,
        title: t("recommendations.entertainment.lido.title"),
        description: t("recommendations.entertainment.lido.description"),
        distance: t("recommendations.entertainment.lido.distance"),
        category: 'entertainment'
      },
    ];
  };

  // Lista completa delle raccomandazioni
  const recommendations = getRecommendations();
  
  // Raccomandazioni raggruppate per categoria
  const categories = {
    beaches: recommendations.filter(r => r.category === 'beaches'),
    history: recommendations.filter(r => r.category === 'history'),
    cuisine: recommendations.filter(r => r.category === 'cuisine'),
    entertainment: recommendations.filter(r => r.category === 'entertainment'),
  };

  return (
    <section id="recommendations" className="py-16 bg-gradient-to-r from-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            {t("recommendations.title")}
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-600">
            {t("recommendations.subtitle")}
          </p>
        </motion.div>

        {/* Categorie di raccomandazioni */}
        <div className="space-y-12">
          {/* Spiagge */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              <h3 className="text-2xl font-display font-bold">{t("recommendations.beaches.category")}</h3>
              <p className="text-blue-50 mt-1">{t("recommendations.beaches.description")}</p>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              {categories.beaches.map((item) => (
                <RecommendationCard key={item.id} recommendation={item} />
              ))}
            </div>
          </motion.div>
          
          {/* Storia e Cultura */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              <h3 className="text-2xl font-display font-bold">{t("recommendations.history.category")}</h3>
              <p className="text-amber-50 mt-1">{t("recommendations.history.description")}</p>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              {categories.history.map((item) => (
                <RecommendationCard key={item.id} recommendation={item} />
              ))}
            </div>
          </motion.div>
          
          {/* Gastronomia */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <h3 className="text-2xl font-display font-bold">{t("recommendations.cuisine.category")}</h3>
              <p className="text-red-50 mt-1">{t("recommendations.cuisine.description")}</p>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              {categories.cuisine.map((item) => (
                <RecommendationCard key={item.id} recommendation={item} />
              ))}
            </div>
          </motion.div>
          
          {/* Divertimento */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <h3 className="text-2xl font-display font-bold">{t("recommendations.entertainment.category")}</h3>
              <p className="text-purple-50 mt-1">{t("recommendations.entertainment.description")}</p>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              {categories.entertainment.map((item) => (
                <RecommendationCard key={item.id} recommendation={item} />
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Suggerimento personalizzato */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 p-6 bg-gradient-to-r from-blue-700 to-cyan-600 rounded-xl text-white text-center shadow-lg"
        >
          <h3 className="text-2xl font-display font-bold mb-4">{t("recommendations.personal.title")}</h3>
          <p className="max-w-3xl mx-auto text-blue-50 mb-6">
            {t("recommendations.personal.description")}
          </p>
          <a 
            href="#contact" 
            className="inline-block py-3 px-8 bg-white text-blue-700 font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {t("recommendations.personal.cta")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// Componente Card per ogni raccomandazione
function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="flex space-x-4 p-4 bg-blue-50/50 rounded-lg">
      <div className="flex-shrink-0 mt-1">
        {recommendation.icon}
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900">{recommendation.title}</h4>
        {recommendation.distance && (
          <p className="text-sm text-blue-600 mb-1">{recommendation.distance}</p>
        )}
        <p className="text-gray-600">{recommendation.description}</p>
      </div>
    </div>
  );
}