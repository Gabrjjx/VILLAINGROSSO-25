import { useState, useEffect } from "react";
import { Menu, X, Home as HomeIcon } from "lucide-react";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link, useLocation } from "wouter";

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
          <Link 
            to="/" 
            className="text-xl sm:text-2xl font-display font-medium text-neutral-900"
          >
            <span className="relative">
              villa
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500"></span>
            </span>
            <span className="ml-1 font-bold">ingrosso</span>
          </Link>
          
          {/* Minimal Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-neutral-800 text-sm uppercase tracking-wider hover:text-cyan-600 transition-colors duration-300 whitespace-nowrap ${
                    location === link.href ? "text-cyan-600 font-medium" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="ml-4 flex items-center space-x-4">
              <Link 
                to="/auth" 
                className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-4 py-2 text-center transition-all duration-300 hover:shadow-lg"
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
            className="lg:hidden backdrop-blur-md bg-white/70 border-t border-neutral-200/50 mt-3"
          >
            <div className="max-w-screen-xl mx-auto px-6 py-5 flex flex-col items-center space-y-5">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className={`text-neutral-800 hover:text-cyan-600 transition-colors ${
                      location === link.href ? "text-cyan-600 font-medium" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: navLinks.length * 0.1 }}
                className="w-full max-w-[200px] mt-2"
              >
                <Link 
                  to="/auth" 
                  className="flex justify-center text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full"
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
  );
}
