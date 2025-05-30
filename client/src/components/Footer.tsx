import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import { Phone, Mail, MapPin, Calendar, Star, Wifi, Car, Coffee, Waves, Instagram, Facebook, MessageCircle } from "lucide-react";

// Importazioni dei loghi dei partner
import airbnbLogo from "../assets/partners/airbmb.png";
import bookingLogo from "../assets/partners/booking.png";
import vikeyLogo from "../assets/partners/vikey.png";
import vrboLogo from "../assets/partners/vrbo.png";

export default function Footer() {
  const { t } = useLanguage();
  
  const quickLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.gallery"), href: "/gallery" },
    { name: t("nav.recommendations"), href: "/recommendations" },
    { name: t("nav.prices"), href: "/prices" },
    { name: t("nav.contact"), href: "/contact" }
  ];

  const amenities = [
    { icon: Wifi, name: "WiFi Gratuito" },
    { icon: Car, name: "Parcheggio Privato" },
    { icon: Coffee, name: "Cucina Attrezzata" },
    { icon: Waves, name: "300m dal Mare" }
  ];
  
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Villa Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🏖️</span>
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold">Villa Ingrosso</h3>
                <p className="text-cyan-400 text-sm uppercase tracking-wider">Leporano • Costa Ionica</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              La tua casa vacanze esclusiva a soli 300 metri dalle spiagge cristalline della costa ionica pugliese. 
              Comfort moderni in un ambiente autentico per una vacanza indimenticabile.
            </p>
            
            {/* Amenities */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-300">
                  <amenity.icon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm">{amenity.name}</span>
                </div>
              ))}
            </div>

            {/* Booking CTA */}
            <Link 
              to="/booking" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <Calendar className="h-4 w-4" />
              <span>Prenota Ora</span>
            </Link>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Link Rapidi</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contatti</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">Chiamaci</p>
                  <a href="tel:+393470896961" className="text-white hover:text-cyan-400 transition-colors">
                    +39 347 089 6961
                  </a>
                  <br />
                  <a href="tel:+393292747374" className="text-white hover:text-cyan-400 transition-colors">
                    +39 329 274 7374
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">Email</p>
                  <a href="mailto:g.ingrosso@villaingrosso.com" className="text-white hover:text-cyan-400 transition-colors">
                    g.ingrosso@villaingrosso.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">Ubicazione</p>
                  <p className="text-white">Leporano (TA)</p>
                  <p className="text-gray-300 text-sm">Puglia, Italia</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-cyan-400 mt-0.5" />
                <div>
                  <p className="text-gray-300 text-sm">WhatsApp</p>
                  <a href="https://wa.me/393470896961" target="_blank" rel="noopener noreferrer" className="text-white hover:text-cyan-400 transition-colors">
                    Contattaci ora
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Partner Logos */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <h4 className="text-center text-gray-300 text-sm mb-6 uppercase tracking-wider">Prenota su</h4>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <a 
              href="https://www.booking.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white p-3 rounded-lg opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <img src={bookingLogo} alt="Booking.com" className="h-8" />
            </a>
            <a 
              href="https://www.airbnb.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105"
            >
              <img src={airbnbLogo} alt="Airbnb" className="h-8" />
            </a>
            <a 
              href="https://www.vikey.it" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white p-3 rounded-lg opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <img src={vikeyLogo} alt="Vikey" className="h-7" />
            </a>
            <a 
              href="https://www.vrbo.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-105"
            >
              <img src={vrboLogo} alt="Vrbo" className="h-8" />
            </a>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-white font-semibold">4.9/5</span>
            </div>
            <p className="text-gray-300 text-sm">Basato su oltre 150 recensioni verificate</p>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Villa Ingrosso. Tutti i diritti riservati.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Realizzato con ❤️ per offrire la migliore esperienza di vacanza
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex space-x-4">
                <Link 
                  to="/privacy" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
                <span className="text-gray-600">•</span>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Supporto
                </Link>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-700 hover:bg-cyan-600 rounded-full flex items-center justify-center transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href="https://wa.me/393470896961" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-300"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}