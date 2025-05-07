import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useScrollPosition } from "@/hooks/use-scroll-position";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Chi Siamo", href: "#about" },
  { name: "Caratteristiche", href: "#features" },
  { name: "Galleria", href: "#gallery" },
  { name: "Posizione", href: "#location" },
  { name: "Contatti", href: "#contact" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 50;

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const isNavbarToggle = target.closest("#menu-toggle");
      const isNavbarContent = target.closest("#mobile-menu");
      
      if (!isNavbarToggle && !isNavbarContent && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [mobileMenuOpen]);

  return (
    <nav 
      id="navbar" 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white bg-opacity-90 shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a 
            href="#home" 
            className="text-2xl font-display font-bold text-primary-sea"
          >
            Villa Ingrosso
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-primary-sea hover:text-primary-sea-light font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button 
              id="menu-toggle" 
              className="text-primary-sea focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div 
        id="mobile-menu" 
        className={`md:hidden bg-white shadow-md transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-screen py-3" : "max-h-0"
        }`}
      >
        <div className="container mx-auto px-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block text-primary-sea hover:text-primary-sea-light font-medium py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
