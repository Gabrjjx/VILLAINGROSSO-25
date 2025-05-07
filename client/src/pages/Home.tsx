import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = "Villa Ingrosso - Elegante Casa Vacanza a Leporano";
    
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
  }, []);

  return (
    <div className="font-body text-neutral-900 bg-white">
      <Navbar />
      <Hero />
      <About />
      <Gallery />
      <Location />
      <Contact />
      <Footer />
    </div>
  );
}
