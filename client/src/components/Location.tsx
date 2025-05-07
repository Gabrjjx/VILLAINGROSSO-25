import { Umbrella, Utensils, Store, Landmark } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import React from "react";

interface LocationFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function getLocalFeatures(t: (key: string) => string): LocationFeature[] {
  return [
    {
      icon: <Umbrella className="text-secondary-sea" />,
      title: t("location.feature1.title"),
      description: t("location.feature1.description")
    },
    {
      icon: <Utensils className="text-secondary-sea" />,
      title: t("location.feature2.title"),
      description: t("location.feature2.description")
    },
    {
      icon: <Store className="text-secondary-sea" />,
      title: t("location.feature3.title"),
      description: t("location.feature3.description")
    },
    {
      icon: <Landmark className="text-secondary-sea" />,
      title: t("location.feature4.title"),
      description: t("location.feature4.description")
    }
  ];
};

export default function Location() {
  const { t } = useLanguage();
  const localFeatures = getLocalFeatures(t);
  return (
    <section id="location" className="py-20 bg-primary-sea bg-opacity-5 section-fade">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-primary-sea">
            {t("location.title")}
          </h2>
          <p className="text-lg max-w-3xl mx-auto">
            {t("location.description")}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-display font-semibold mb-4 text-primary-sea">
                {t("location.nearby")}
              </h3>
              
              <div className="space-y-4">
                {localFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 mr-4 text-secondary-sea">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-neutral-dark-sea">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <div className="h-96 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12249.417118366299!2d17.307386676599!3d40.3766118234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1347894b3c4204a3%3A0x596ce4dee97afe53!2s74020%20Leporano%20TA!5e0!3m2!1sit!2sit!4v1653495421234!5m2!1sit!2sit" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }}
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Mappa di Villa Ingrosso a Leporano"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
