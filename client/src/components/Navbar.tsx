import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Waves } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useScrollPosition } from "../hooks/use-scroll-position";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link, useLocation } from "wouter";
import Tooltip from "@/components/ui/tooltip";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const isScrolled = scrollY > 50;
  const { t } = useLanguage();
  
  const [location] = useLocation();
  
  // Navigation links using translations
  const navLinks = [
    { name: t("nav.home"), href: "/", tooltipKey: "home" },
    { name: t("nav.about"), href: "/about", tooltipKey: "about" },
    { name: t("nav.gallery"), href: "/gallery", tooltipKey: "gallery" },
    { name: t("nav.location"), href: "/location", tooltipKey: "location" },
    { name: t("nav.recommendations"), href: "/recommendations", tooltipKey: "recommendations" },
    { name: t("nav.prices"), href: "/prices", tooltipKey: "prices" },
    { name: t("nav.contact"), href: "/contact", tooltipKey: "contact" },
  ];

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const menu = document.getElementById("mobile-menu");
      const menuToggle = document.getElementById("menu-toggle");
      
      if (mobileMenuOpen && menu && menuToggle && 
          !menu.contains(target) && !menuToggle.contains(target)) {
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
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed w-full z-50 transition-all duration-700 ease-out ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-xl border-b border-white/20 py-3" 
          : "bg-white/80 backdrop-blur-md py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className={`bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${
              isScrolled ? "w-10 h-10" : "w-12 h-12"
            }`}>
              <Waves className={`text-white transition-all duration-300 ${
                isScrolled ? "h-5 w-5" : "h-6 w-6"
              }`} />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent transition-all duration-300 ${
                isScrolled ? "text-lg" : "text-xl"
              }`}>
                Villa Ingrosso
              </span>
              <span className={`text-cyan-600 font-medium uppercase tracking-wider transition-all duration-300 ${
                isScrolled ? "text-xs" : "text-sm"
              }`}>
                Leporano Marina
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Tooltip
                key={link.name}
                content={t(`nav.tooltips.${link.tooltipKey}`)}
                position="bottom"
                delay={300}
              >
                <Link
                  to={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 group ${
                    location === link.href 
                      ? "text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg" 
                      : "text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/80"
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {location !== link.href && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </Link>
              </Tooltip>
            ))}
            
            <div className="ml-6 flex items-center space-x-3">
              <Tooltip
                content={t("navbar.loginTooltip")}
                position="bottom"
                delay={300}
              >
                <Link 
                  to="/auth" 
                  className="group relative px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{t("navbar.login")}</span>
                </Link>
              </Tooltip>
              
              <div className="ml-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Tooltip
              content={mobileMenuOpen ? t("navbar.closeMenu") : t("navbar.openMenu")}
              position="bottom"
              delay={200}
            >
              <button 
                id="menu-toggle" 
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? t("navbar.close") : t("navbar.menu")}
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
                      <X className="h-5 w-5 text-gray-700" />
                    ) : (
                      <Menu className="h-5 w-5 text-gray-700" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
            </Tooltip>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="lg:hidden mt-6 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="p-6 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={link.href}
                      className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                        location === link.href 
                          ? "text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg" 
                          : "text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/80"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div 
                  className="pt-4 mt-4 border-t border-gray-200/50 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Link 
                    to="/auth" 
                    className="block text-center text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 font-semibold rounded-xl py-3 px-6 transition-all duration-300 hover:shadow-lg hover:scale-105"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("navbar.login")}
                  </Link>
                  
                  <div className="flex justify-center">
                    <LanguageSwitcher />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}