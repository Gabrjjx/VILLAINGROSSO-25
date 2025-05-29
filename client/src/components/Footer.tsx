import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";
import NewsletterSignup from "./NewsletterSignup";

// Importazioni dei loghi dei partner
import airbnbLogo from "../assets/partners/airbmb.png";
import bookingLogo from "../assets/partners/booking.png";
import vikeyLogo from "../assets/partners/vikey.png";
import vrboLogo from "../assets/partners/vrbo.png";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gradient-to-r from-cyan-700 to-blue-700 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-display font-medium">
              <span className="font-light">villa</span> <span className="font-bold">ingrosso</span>
            </h2>
            <p className="mt-2 text-blue-100">{t("footer.tagline")}</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="mb-2 text-blue-100">© {new Date().getFullYear()} Villa Ingrosso. {t("footer.rights")}</p>
            <div className="flex space-x-6 mt-2">
              <Link href="/privacy" className="text-white hover:text-blue-200 transition-colors text-sm uppercase tracking-wide">
                {t("footer.privacy")}
              </Link>
              <a href="#contact" className="text-white hover:text-blue-200 transition-colors text-sm uppercase tracking-wide">
                {t("footer.contact")}
              </a>
            </div>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="mt-8 pt-6 border-t border-blue-300/30">
          <div className="max-w-2xl mx-auto">
            <NewsletterSignup />
          </div>
        </div>

        {/* Partner Logos */}
        <div className="mt-8 pt-6 border-t border-blue-300/30">
          <p className="text-center text-blue-100 text-sm mb-4">{t("footer.partners")}</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <a href="https://www.booking.com" target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-lg opacity-90 hover:opacity-100 transition-opacity">
              <img src={bookingLogo} alt="Booking.com" className="h-8" />
            </a>
            <a href="https://www.airbnb.com" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 transition-opacity">
              <img src={airbnbLogo} alt="Airbnb" className="h-8" />
            </a>
            <a href="https://www.vikey.it" target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-lg opacity-90 hover:opacity-100 transition-opacity">
              <img src={vikeyLogo} alt="Vikey" className="h-7" />
            </a>
            <a href="https://www.vrbo.com" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 transition-opacity">
              <img src={vrboLogo} alt="Vrbo" className="h-8" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
