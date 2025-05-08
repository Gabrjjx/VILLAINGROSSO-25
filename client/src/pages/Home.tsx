import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import LocalRecommendations from "@/components/LocalRecommendations";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { language } = useLanguage();
  
  useEffect(() => {
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
      sections.forEach(section => {
        fadeInObserver.unobserve(section);
      });
    };
  }, [language]);

  return (
    <div className="font-body text-neutral-900 bg-white">
      <Navbar />
      <Hero />
      <About />
      <Gallery />
      <Location />
      <LocalRecommendations />
      <Contact />
      <Footer />
    </div>
  );
}
