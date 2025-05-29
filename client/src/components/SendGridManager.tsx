import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, MessageSquare, Send, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function SendGridManager() {
  const [welcomeEmail, setWelcomeEmail] = useState({ email: "", name: "" });
  const [newsletter, setNewsletter] = useState({ subject: "", content: "" });
  const [sms, setSms] = useState({ phoneNumber: "", message: "" });
  const { toast } = useToast();
  const { t } = useLanguage();

  // Mutation per email di benvenuto
  const welcomeEmailMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      const res = await apiRequest("POST", "/api/send-welcome-email", data);
      return await res.json();
    },
    onSuccess: () => {
      setWelcomeEmail({ email: "", name: "" });
      toast({
        title: "Email di benvenuto inviata",
        description: "L'email di benvenuto è stata inviata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation per newsletter
  const newsletterMutation = useMutation({
    mutationFn: async (data: { subject: string; content: string }) => {
      const res = await apiRequest("POST", "/api/newsletter/send", data);
      return await res.json();
    },
    onSuccess: () => {
      setNewsletter({ subject: "", content: "" });
      toast({
        title: "Newsletter inviata",
        description: "La newsletter è stata inviata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation per SMS
  const smsMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; message: string }) => {
      const res = await apiRequest("POST", "/api/send-sms", data);
      return await res.json();
    },
    onSuccess: () => {
      setSms({ phoneNumber: "", message: "" });
      toast({
        title: "SMS inviato",
        description: "L'SMS è stato inviato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Gestione Email e SMS</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email di Benvenuto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Email di Benvenuto
            </CardTitle>
            <CardDescription>
              Invia email di benvenuto personalizzate ai nuovi ospiti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Email ospite"
              value={welcomeEmail.email}
              onChange={(e) => setWelcomeEmail(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              placeholder="Nome ospite"
              value={welcomeEmail.name}
              onChange={(e) => setWelcomeEmail(prev => ({ ...prev, name: e.target.value }))}
            />
            <Button
              onClick={() => welcomeEmailMutation.mutate(welcomeEmail)}
              disabled={!welcomeEmail.email || !welcomeEmail.name || welcomeEmailMutation.isPending}
              className="w-full"
            >
              {welcomeEmailMutation.isPending ? "Invio..." : "Invia Email di Benvenuto"}
            </Button>
          </CardContent>
        </Card>

        {/* Gestione Newsletter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Invia Newsletter
            </CardTitle>
            <CardDescription>
              Crea e invia newsletter ai contatti iscritti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Oggetto newsletter"
              value={newsletter.subject}
              onChange={(e) => setNewsletter(prev => ({ ...prev, subject: e.target.value }))}
            />
            <Textarea
              placeholder="Contenuto newsletter (HTML supportato)"
              value={newsletter.content}
              onChange={(e) => setNewsletter(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <Button
              onClick={() => newsletterMutation.mutate(newsletter)}
              disabled={!newsletter.subject || !newsletter.content || newsletterMutation.isPending}
              className="w-full"
            >
              {newsletterMutation.isPending ? "Invio..." : "Invia Newsletter"}
            </Button>
          </CardContent>
        </Card>

        {/* Invio WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Invio WhatsApp
            </CardTitle>
            <CardDescription>
              Invia messaggi WhatsApp istantanei agli ospiti via Twilio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Numero WhatsApp (+39...)"
              value={sms.phoneNumber}
              onChange={(e) => setSms(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
            <Textarea
              placeholder="Messaggio WhatsApp (supporta *grassetto* e formattazione)"
              value={sms.message}
              onChange={(e) => setSms(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
            />
            <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
              💡 <strong>Suggerimento:</strong> Usa *testo* per grassetto e formatta il messaggio per WhatsApp
            </div>
            <Button
              onClick={() => smsMutation.mutate(sms)}
              disabled={!sms.phoneNumber || !sms.message || smsMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {smsMutation.isPending ? "Invio..." : "📱 Invia WhatsApp"}
            </Button>
          </CardContent>
        </Card>

        {/* Statistiche Email */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiche Email</CardTitle>
            <CardDescription>
              Monitoraggio performance email e click tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Email inviate oggi</span>
                <span className="text-2xl font-bold text-blue-600">--</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Tasso di apertura</span>
                <span className="text-2xl font-bold text-green-600">--%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Click su link</span>
                <span className="text-2xl font-bold text-purple-600">--</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Le statistiche dettagliate sono disponibili nel dashboard SendGrid
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}