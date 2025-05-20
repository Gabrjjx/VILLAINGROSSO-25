import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, EuroIcon, Sun, Waves } from "lucide-react";
import { motion } from "framer-motion";

export default function PricesPage() {
  const { t } = useLanguage();

  const seasonalPrices = [
    {
      id: "june",
      month: t("prices.june"),
      price: "1.500",
      icon: <Sun className="h-12 w-12 text-amber-400" />,
      description: t("prices.early_summer"),
      color: "bg-amber-50",
      borderColor: "border-amber-200",
      shadowColor: "shadow-amber-100",
      textColor: "text-amber-700"
    },
    {
      id: "july",
      month: t("prices.july"),
      price: "2.000",
      icon: <Waves className="h-12 w-12 text-blue-400" />,
      description: t("prices.mid_summer"),
      color: "bg-blue-50",
      borderColor: "border-blue-200",
      shadowColor: "shadow-blue-100",
      textColor: "text-blue-700"
    },
    {
      id: "august",
      month: t("prices.august"),
      price: "2.500",
      icon: <Calendar className="h-12 w-12 text-indigo-400" />,
      description: t("prices.peak_summer"),
      color: "bg-indigo-50",
      borderColor: "border-indigo-200",
      shadowColor: "shadow-indigo-100",
      textColor: "text-indigo-700"
    }
  ];

  return (
    <div className="font-body text-neutral-900 bg-white min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-5xl font-display font-bold text-primary mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("prices.title")}
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {t("prices.subtitle")}
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {seasonalPrices.map((season, index) => (
              <motion.div
                key={season.id}
                className={`rounded-xl ${season.color} border ${season.borderColor} p-6 shadow-lg ${season.shadowColor} transition-transform duration-300 hover:scale-105`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-2xl font-bold ${season.textColor}`}>{season.month}</h3>
                    <p className="text-gray-600">{season.description}</p>
                  </div>
                  <div>{season.icon}</div>
                </div>
                <div className="mt-6 flex items-center">
                  <EuroIcon className={`h-6 w-6 mr-2 ${season.textColor}`} />
                  <span className="text-3xl font-bold">{season.price}</span>
                  <span className="text-gray-500 ml-2">/ {t("prices.week")}</span>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    {t("prices.feature1")}
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    {t("prices.feature2")}
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    {t("prices.feature3")}
                  </li>
                </ul>
                <div className="mt-6">
                  <a 
                    href="https://app.business.booking.com/xapp/it/stay/details/13998845?adultCount=1&aid=356980&aid_label=gog235jc-1DCAsocUIOdmlsbGEtaW5ncm9zc29IFFgDaHGIAQGYARS4ARjIAQ3YAQPoAQH4AQKIAgGoAgS4Aq3wsMEGwAIB0gIkZWZmMmQ1Y2QtNzRiZS00OTk0LWFjMGMtY2ZiYTNkZGYwOWE22AIE4AIB&checkinDate=2025-05-20&checkoutDate=2025-05-21&destinationId=900061340&destinationType=city&guestAccountCountryCode=IT&guestCurrency=EUR&label=zenodeeplinkpp&roomCount=1&searchLocation=Leporano+Marina" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block w-full py-3 px-4 rounded-lg bg-white ${season.textColor} border ${season.borderColor} text-center font-medium transition-colors hover:bg-opacity-90`}
                  >
                    {t("prices.book_now")}
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-16 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-primary mb-4">{t("prices.note_title")}</h2>
            <p className="text-gray-600 mb-4">{t("prices.note_text")}</p>
            <p className="text-sm text-gray-500">{t("prices.disclaimer")}</p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Componente icona di spunta
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
}