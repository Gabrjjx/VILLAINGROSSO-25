import { Mail, Phone, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { trackContactConversion } from "@/lib/google-ads";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      trackContactConversion();
      toast({
        title: t("contact.success_title"),
        description: t("contact.success_message"),
      });
      setFormData({ name: '', email: '', message: '' });
    },
    onError: (error: Error) => {
      toast({
        title: t("contact.error_title"),
        description: t("contact.error_message"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Errore",
        description: "Tutti i campi sono obbligatori",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute right-1/4 top-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 blur-3xl opacity-30 -z-10"></div>
      <div className="absolute left-1/3 bottom-20 w-72 h-72 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 blur-3xl opacity-40 -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-medium mb-6">
            <span className="relative inline-block">
              {t("contact.title")}
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500 transform translate-y-2"></span>
            </span>
          </h2>
        </motion.div>
        
        <motion.div 
          className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl p-10 md:p-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-8">
              <p className="text-lg md:text-xl text-neutral-700 mb-10 max-w-2xl mx-auto">
                {t("contact.subtitle")}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 mb-4 text-cyan-600">
                    <Mail className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-display font-medium mb-2">{t("contact.email")}</h3>
                  <a 
                    href="mailto:g.ingrosso@villaingrosso.com" 
                    className="text-cyan-600 hover:text-cyan-700 transition-colors"
                    onClick={() => trackContactConversion()}
                  >
                    g.ingrosso@villaingrosso.com
                  </a>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 mb-4 text-cyan-600">
                    <Phone className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-display font-medium mb-2">{t("contact.phone")}</h3>
                  <div className="flex flex-col space-y-1">
                    <a 
                      href="tel:+393470896961" 
                      className="text-cyan-600 hover:text-cyan-700 transition-colors"
                      onClick={() => trackContactConversion()}
                    >
                      +39 347 089 6961
                    </a>
                    <a 
                      href="tel:+393292747374" 
                      className="text-cyan-600 hover:text-cyan-700 transition-colors"
                      onClick={() => trackContactConversion()}
                    >
                      +39 329 274 7374
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Modulo di contatto */}
            <motion.div 
              className="mt-12 pt-8 border-t border-gray-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-display font-medium mb-6 text-center">{t("contact.form_title")}</h3>
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("contact.form_name")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("contact.form_email")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("contact.form_message")}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {contactMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {contactMutation.isPending ? t("contact.form_sending") : t("contact.form_submit")}
                </button>
              </form>
            </motion.div>

            <motion.div 
              className="mt-8 pt-6 border-t border-gray-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <p className="text-neutral-500 text-sm text-center">
                {t("contact.footer")}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
