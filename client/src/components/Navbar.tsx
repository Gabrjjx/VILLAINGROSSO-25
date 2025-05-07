import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { motion, AnimatePresence } from "framer-motion";

// Reduced nav links for a more minimalist approach
const navLinks = [
  { name: "Chi Siamo", href: "#about" },
  { name: "Galleria", href: "#gallery" },
  { name: "Posizione", href: "#location" },
  { name: "Contatti", href: "#contact" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 100;

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
    <motion.nav 
      id="navbar" 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? "py-3 backdrop-blur-md bg-white/40" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center">
          <a 
            href="#home" 
            className="text-xl sm:text-2xl font-display font-medium text-neutral-900"
          >
            <span className="relative">
              villa
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500"></span>
            </span>
            <span className="ml-1 font-bold">ingrosso</span>
          </a>
          
          {/* Minimal Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-neutral-800 text-sm uppercase tracking-wider hover:text-cyan-600 transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              id="menu-toggle" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileMenuOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5 text-neutral-800" />
                  ) : (
                    <Menu className="h-5 w-5 text-neutral-800" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu - Animated */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden backdrop-blur-md bg-white/70 border-t border-neutral-200/50 mt-3"
          >
            <div className="max-w-screen-xl mx-auto px-6 py-5 flex flex-col items-center space-y-5">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="text-neutral-800 hover:text-cyan-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
