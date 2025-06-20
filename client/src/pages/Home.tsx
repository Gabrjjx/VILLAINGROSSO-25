import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { Bed, Waves, Wifi } from "lucide-react";
import { Link } from "wouter";
import { RegistrationIncentiveCard } from "@/components/RegistrationIncentive";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { LoadingWave } from "@/components/ui/loading-wave";
import VillaAnalytics from "@/lib/gtm-analytics";

export default function Home() {
  const { language, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [sectionsLoaded, setSectionsLoaded] = useState({
    hero: false,
    features: false,
    incentive: false
  });
  
  useEffect(() => {
    // Simulate loading time for demonstration
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Progressive section loading
    const sectionTimers = [
      setTimeout(() => setSectionsLoaded(prev => ({ ...prev, hero: true })), 800),
      setTimeout(() => setSectionsLoaded(prev => ({ ...prev, features: true })), 1200),
      setTimeout(() => setSectionsLoaded(prev => ({ ...prev, incentive: true })), 1400)
    ];

    // Track page view for Home page
    VillaAnalytics.trackPageView('/', document.title);
    VillaAnalytics.trackPugliaEngagement('home_page', 'page_load', 'homepage_visit');

    // Set page title and meta description for SEO based on language
    document.title = language === 'it' 
      ? "Villa Ingrosso - Elegante Casa Vacanza a Leporano" 
      : "Villa Ingrosso - Elegant Vacation Home in Leporano";
    
    // Add meta description in current language
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = language === 'it'
      ? "Villa Ingrosso a Leporano: elegante casa vacanza a 300 metri dal mare con design moderno e consigli personalizzati per un soggiorno indimenticabile sulla costa ionica."
      : "Villa Ingrosso in Leporano: elegant vacation home just 300 meters from the sea with modern design and personalized local tips for an unforgettable stay on the Ionian coast.";
    
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptionContent);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = descriptionContent;
      document.head.appendChild(newMeta);
    }
    
    // Add intersection observer for fade-in animations
    const sections = document.querySelectorAll(".section-fade");
    
    const fadeInOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };
    
    const fadeInObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          fadeInObserver.unobserve(entry.target);
        }
      });
    }, fadeInOptions);
    
    sections.forEach(section => {
      fadeInObserver.observe(section);
    });

    return () => {
      clearTimeout(loadingTimer);
      sectionTimers.forEach(timer => clearTimeout(timer));
      sections.forEach(section => {
        fadeInObserver.unobserve(section);
      });
    };
  }, [language]);

  return (
    <div className="font-body text-neutral-900 bg-white">
      <LoadingOverlay 
        isVisible={isLoading} 
        text={language === 'it' ? "Benvenuto in Villa Ingrosso..." : "Welcome to Villa Ingrosso..."}
        variant="ocean"
      />
      
      <Navbar />
      
      {sectionsLoaded.hero ? (
        <Hero />
      ) : (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
          <LoadingWave size="xl" variant="ocean" text={language === 'it' ? "Caricando la villa..." : "Loading villa..."} />
        </div>
      )}
      
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-800">
              {t("homePage.features.title")}
            </h2>
            <p className="mt-4 text-lg text-neutral-600 max-w-3xl mx-auto">
              {t("homePage.features.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-300">
              <div className="mb-4"><Bed className="w-8 h-8 text-cyan-600" /></div>
              <h3 className="text-xl font-medium text-neutral-800 mb-3">
                {t("homePage.features.rooms.title")}
              </h3>
              <p className="text-neutral-600 flex-grow mb-5">
                {t("homePage.features.rooms.description")}
              </p>
              <div>
                <Link 
                  to="/gallery"
                  className="inline-flex items-center text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors duration-300"
                >
                  {t("homePage.features.rooms.link")}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-300">
              <div className="mb-4"><Waves className="w-8 h-8 text-cyan-600" /></div>
              <h3 className="text-xl font-medium text-neutral-800 mb-3">
                {t("homePage.features.sea.title")}
              </h3>
              <p className="text-neutral-600 flex-grow mb-5">
                {t("homePage.features.sea.description")}
              </p>
              <div>
                <Link 
                  to="/location"
                  className="inline-flex items-center text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors duration-300"
                >
                  {t("homePage.features.sea.link")}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-300">
              <div className="mb-4"><Wifi className="w-8 h-8 text-cyan-600" /></div>
              <h3 className="text-xl font-medium text-neutral-800 mb-3">
                {t("homePage.features.wifi.title")}
              </h3>
              <p className="text-neutral-600 flex-grow mb-5">
                {t("homePage.features.wifi.description")}
              </p>
              <div>
                <Link 
                  to="/about"
                  className="inline-flex items-center text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors duration-300"
                >
                  {t("homePage.features.wifi.link")}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
            <div className="lg:col-span-3 text-center">
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-300"
              >
                {t("homePage.cta")}
              </Link>
            </div>
            <div className="lg:col-span-1">
              <RegistrationIncentiveCard />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
