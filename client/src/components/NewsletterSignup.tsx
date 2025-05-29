import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
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
    },
    onError: (error: Error) => {
      toast({
        title: t("newsletter.error_title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeMutation.mutate({ email, firstName });
  };

  if (isSubscribed) {
    return (
      <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("newsletter.success_title")}
        </h3>
        <p className="text-gray-600">
          {t("newsletter.success_message")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
      <div className="text-center mb-4">
        <Mail className="mx-auto h-6 w-6 text-blue-600 mb-2" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {t("newsletter.title")}
        </h3>
        <p className="text-sm text-gray-600">
          {t("newsletter.description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder={t("newsletter.first_name")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 h-10 text-sm"
          />
          <Input
            type="email"
            placeholder={t("newsletter.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 h-10 text-sm"
          />
        </div>
        
        <Button
          type="submit"
          disabled={subscribeMutation.isPending || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm"
        >
          {subscribeMutation.isPending
            ? t("newsletter.subscribing")
            : t("newsletter.subscribe_button")
          }
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-3 text-center">
        {t("newsletter.privacy_note")}
      </p>
    </div>
  );
}