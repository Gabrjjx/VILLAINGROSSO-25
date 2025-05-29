import { useState } from "react";
import { MessageCircle, X, Send, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { t } = useLanguage();

  // Numero WhatsApp Business di Villa Ingrosso
  const whatsappNumber = "+393470896961";

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Messaggio preformattato per WhatsApp
    const fullMessage = `Ciao! Sono interessato a Villa Ingrosso. ${message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(fullMessage)}`;
    
    // Apri WhatsApp in una nuova finestra
    window.open(whatsappUrl, '_blank');
    
    // Chiudi il widget e resetta il messaggio
    setMessage("");
    setIsOpen(false);
  };

  const handleQuickMessage = (quickMessage: string) => {
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(quickMessage)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const quickMessages = [
    t("whatsapp.quick_msg_1"),
    t("whatsapp.quick_msg_2"),
    t("whatsapp.quick_msg_3"),
    t("whatsapp.quick_msg_4")
  ];

  return (
    <>
      {/* Pulsante principale WhatsApp */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </motion.button>

      {/* Widget Chat WhatsApp */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 bg-white rounded-lg shadow-2xl w-80 max-w-[calc(100vw-3rem)] z-30 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-green-500 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t("whatsapp.title")}</h3>
                  <p className="text-xs text-green-100">{t("whatsapp.subtitle")}</p>
                </div>
              </div>
            </div>

            {/* Contenuto */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {/* Messaggio di benvenuto */}
              <div className="mb-4">
                <div className="bg-gray-100 rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-800 mb-1">{t("whatsapp.welcome_title")}</p>
                  <p className="text-gray-600">
                    {t("whatsapp.welcome_message")}
                  </p>
                </div>
              </div>

              {/* Messaggi rapidi */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500 font-medium">{t("whatsapp.quick_messages")}</p>
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMessage(msg)}
                    className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 transition-colors"
                  >
                    {msg}
                  </button>
                ))}
              </div>

              {/* Campo messaggio personalizzato */}
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-medium">{t("whatsapp.custom_message")}</p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("whatsapp.placeholder")}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(`tel:${whatsappNumber}`, '_self')}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {t("whatsapp.call_button")}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {t("whatsapp.send_button")}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {t("whatsapp.redirect_note")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}