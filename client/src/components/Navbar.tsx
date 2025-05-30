import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link, useLocation } from "wouter";
import Tooltip from "@/components/ui/tooltip";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 100;
  const { t } = useLanguage();
  
  const [location] = useLocation();
  
  // Navigation links using translations
  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.gallery"), href: "/gallery" },
    { name: t("nav.location"), href: "/location" },
    { name: t("nav.recommendations"), href: "/recommendations" },
    { name: t("nav.prices"), href: "/prices" },
    { name: t("nav.contact"), href: "/contact" },
  ];

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
    <>
      {/* Top Contact Bar */}
      <div className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled ? "translate-y-[-100%]" : "translate-y-0"
      }`}>
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 text-xs">
          <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>+39 347 089 6961</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>g.ingrosso@villaingrosso.com</span>
              </div>
              <div className="hidden sm:flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Leporano (TA) - 300m dal mare</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/booking" 
                className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
              >
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">Prenota Ora</span>
                <span className="sm:hidden">Prenota</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <motion.nav 
        id="navbar" 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full z-40 transition-all duration-500 ${
          isScrolled 
            ? "py-3 backdrop-blur-md bg-white/95 shadow-lg top-0" 
            : "py-4 bg-white/80 backdrop-blur-sm top-8"
        }`}
      >
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏖️</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold text-neutral-900">
                  Villa Ingrosso
                </span>
                <span className="text-xs text-cyan-600 uppercase tracking-wider">
                  Leporano • Costa Ionica
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative text-neutral-800 text-sm font-medium hover:text-cyan-600 transition-colors duration-300 whitespace-nowrap group ${
                      location === link.href ? "text-cyan-600" : ""
                    }`}
                  >
                    {link.name}
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transform transition-transform duration-300 ${
                      location === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}></span>
                  </Link>
                ))}
              </div>
              
              <div className="ml-4 flex items-center space-x-4">
                <Link 
                  to="/auth" 
                  className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  {t("navbar.login")}
                </Link>
                <LanguageSwitcher />
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button 
                id="menu-toggle" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-white/20"
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
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden backdrop-blur-md bg-white/95 border-t border-neutral-200/50 mt-3 shadow-lg"
            >
              <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col items-center space-y-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className={`text-lg font-medium text-neutral-800 hover:text-cyan-600 transition-colors relative ${
                        location === link.href ? "text-cyan-600" : ""
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                      {location === link.href && (
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></span>
                      )}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: navLinks.length * 0.1 }}
                  className="w-full max-w-[200px] mt-4"
                >
                  <Link 
                    to="/auth" 
                    className="flex justify-center text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.login")}
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: (navLinks.length + 1) * 0.1 }}
                  className="pt-2"
                >
                  <LanguageSwitcher />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}