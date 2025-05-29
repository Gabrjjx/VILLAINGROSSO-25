import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, CheckCircle, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsletterModal() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string }) => {
      const res = await apiRequest("POST", "/api/newsletter/subscribe", data);
      return await res.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      setEmail("");
      setFirstName("");
      toast({
        title: t("newsletter.success_title"),
        description: t("newsletter.success_message"),
      });
      // Chiudi il modal dopo 3 secondi
      setTimeout(() => {
        setIsOpen(false);
        setIsSubscribed(false);
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: t("newsletter.error_title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mostra il modal dopo 3 secondi dal caricamento della pagina
  useEffect(() => {
    const hasSeenNewsletter = localStorage.getItem('newsletter-seen');
    if (!hasSeenNewsletter) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('newsletter-seen', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeMutation.mutate({ email, firstName });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {isSubscribed ? (
                <div className="p-8 text-center">
                  <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("newsletter.success_title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("newsletter.success_message")}
                  </p>
                </div>
              ) : (
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t("newsletter.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("newsletter.description")}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder={t("newsletter.first_name")}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full text-gray-900 placeholder-gray-500"
                    />
                    <Input
                      type="email"
                      placeholder={t("newsletter.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full text-gray-900 placeholder-gray-500"
                    />
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        {t("newsletter.no_thanks")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={subscribeMutation.isPending || !email}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      >
                        {subscribeMutation.isPending
                          ? t("newsletter.subscribing")
                          : t("newsletter.subscribe_button")
                        }
                      </Button>
                    </div>
                  </form>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    {t("newsletter.privacy_note")}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}