import { Link } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

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
      </div>
    </footer>
  );
}
