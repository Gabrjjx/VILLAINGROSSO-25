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
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-1/3 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-purple-500/15 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-16 w-48 h-48 bg-gradient-to-r from-teal-400/10 to-cyan-500/10 rounded-full filter blur-2xl animate-pulse delay-500"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-4 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Waves className="h-10 w-10 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                Villa Ingrosso
              </h3>
              <p className="text-cyan-300 text-sm font-semibold uppercase tracking-[0.2em]">
                Leporano Marina • Costa Ionica
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 text-2xl leading-relaxed mb-12 max-w-4xl mx-auto font-light">
            La tua casa vacanze esclusiva sulla costa ionica pugliese. Un'esperienza autentica a 300 metri 
            dalle spiagge cristalline, dove comfort moderni incontrano la bellezza del mare.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          
          {/* Amenities Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {amenities.map((amenity, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-400/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <amenity.icon className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-2">{amenity.name}</h4>
                  <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Booking CTA Card */}
          <div className="lg:col-span-2 relative">
            <div className="sticky top-8 bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 rounded-3xl"></div>
              <div className="relative">
                <div className="text-center mb-6">
                  <h4 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                    Inizia la tua vacanza
                  </h4>
                  <p className="text-cyan-100 text-lg leading-relaxed">
                    Prenota ora la tua esperienza indimenticabile sulla costa ionica pugliese
                  </p>
                </div>
                
                <Link 
                  to="/booking" 
                  className="group relative w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-bold px-8 py-5 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/40 transform hover:scale-105 flex items-center justify-center space-x-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Calendar className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-xl">Prenota Ora</span>
                </Link>
                
                <div className="mt-8 text-center">
                  <div className="flex justify-center items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-3 text-white text-lg font-semibold">4.9/5</span>
                  </div>
                  <p className="text-cyan-100 text-sm">Oltre 150 recensioni verificate</p>
                </div>
              </div>
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
                  href="https://www.instagram.com/villa.ingrosso/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6 text-white" />
                </a>
                <a 
                  href="https://www.instagram.com/villa.ingrosso/" 
                  target="_blank"
                  rel="noopener noreferrer"
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