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
    { name: t("nav.contact"), href: "/contact" }
  ];

  const amenities = [
    { icon: Wifi, name: "WiFi Gratuito" },
    { icon: Car, name: "Parcheggio Privato" },
    { icon: Coffee, name: "Cucina Attrezzata" },
    { icon: Waves, name: "300m dal Mare" }
  ];
  
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        
        {/* Top Section - Villa Info & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Villa Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Waves className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                  Villa Ingrosso
                </h3>
                <p className="text-cyan-300 text-sm font-medium uppercase tracking-widest">
                  Leporano Marina • Puglia
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 text-xl leading-relaxed mb-8 max-w-2xl">
              La tua casa vacanze esclusiva sulla costa ionica pugliese. Un'esperienza autentica a 300 metri 
              dalle spiagge cristalline, dove comfort moderni incontrano la bellezza del mare.
            </p>
            
            {/* Amenities Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <amenity.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-200 font-medium">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Booking CTA Card */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl p-8 backdrop-blur-sm border border-cyan-500/20">
            <h4 className="text-2xl font-bold mb-4 text-white">Inizia la tua vacanza</h4>
            <p className="text-cyan-100 mb-6 leading-relaxed">
              Prenota ora la tua esperienza indimenticabile sulla costa ionica pugliese
            </p>
            
            <Link 
              to="/booking" 
              className="group w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <Calendar className="h-5 w-5" />
              <span>Prenota Ora</span>
            </Link>
            
            <div className="mt-6 flex justify-center items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-cyan-100 text-sm font-medium">4.9/5 • 150+ recensioni</span>
            </div>
          </div>
        </div>
        
        {/* Middle Section - Links & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Esplora</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="group flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300"
                  >
                    <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Contatti</h4>
            <div className="space-y-4">
              <div className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Telefono</p>
                  <a href="tel:+393470896961" className="text-white hover:text-cyan-400 transition-colors block">
                    +39 347 089 6961
                  </a>
                  <a href="tel:+393292747374" className="text-white hover:text-cyan-400 transition-colors block">
                    +39 329 274 7374
                  </a>
                </div>
              </div>
              
              <div className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <a href="mailto:g.ingrosso@villaingrosso.com" className="text-white hover:text-cyan-400 transition-colors">
                    g.ingrosso@villaingrosso.com
                  </a>
                </div>
              </div>
              
              <div className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Dove siamo</p>
                  <p className="text-white">Leporano Marina (TA)</p>
                  <p className="text-gray-300 text-sm">Puglia, Italia</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Social & WhatsApp */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Seguici</h4>
            <div className="space-y-4">
              <a 
                href="https://wa.me/393470896961" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                <MessageCircle className="h-6 w-6 text-white" />
                <div>
                  <p className="text-white font-semibold">WhatsApp</p>
                  <p className="text-green-100 text-sm">Contattaci subito</p>
                </div>
              </a>
              
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6 text-white" />
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Partner Logos Section */}
        <div className="border-t border-white/10 pt-12 mb-12">
          <h4 className="text-center text-gray-300 text-lg font-semibold mb-8">Prenota anche su</h4>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { logo: bookingLogo, alt: "Booking.com", url: "https://www.booking.com", bgWhite: true },
              { logo: airbnbLogo, alt: "Airbnb", url: "https://www.airbnb.com", bgWhite: false },
              { logo: vikeyLogo, alt: "Vikey", url: "https://www.vikey.it", bgWhite: true },
              { logo: vrboLogo, alt: "Vrbo", url: "https://www.vrbo.com", bgWhite: false }
            ].map((partner, index) => (
              <a 
                key={index}
                href={partner.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`group p-4 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                  partner.bgWhite ? 'bg-white shadow-lg' : 'bg-white/10 backdrop-blur-sm'
                }`}
              >
                <img 
                  src={partner.logo} 
                  alt={partner.alt} 
                  className="h-10 group-hover:scale-105 transition-transform duration-300" 
                />
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300 font-medium">
                © {new Date().getFullYear()} Villa Ingrosso. Tutti i diritti riservati.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Creato con passione per la tua vacanza perfetta
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/contact" 
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                Supporto
              </Link>
              <span className="text-gray-600">•</span>
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}