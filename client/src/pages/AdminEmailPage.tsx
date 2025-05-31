import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Eye, User, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const emailTemplates = {
  welcome: {
    name: "Email di Benvenuto",
    subject: "🏖️ Benvenuto in Villa Ingrosso - La tua casa vacanze in Puglia",
    content: `Caro [NOME],

Benvenuto nella famiglia Villa Ingrosso!

Siamo entusiasti di averti con noi. La tua registrazione è stata completata con successo e ora puoi accedere a tutti i servizi esclusivi della nostra villa.

🏖️ Villa Ingrosso - Leporano Marina
📍 A soli 300m dal mare cristallino della Costa Ionica
🏠 2 camere da letto, fino a 5 ospiti
🌊 Tramonti mozzafiato e spiagge sabbiose

Cosa puoi fare ora:
• Prenota il tuo soggiorno direttamente online
• Contattaci per assistenza personalizzata
• Ricevere offerte esclusive riservate ai nostri ospiti

Per qualsiasi domanda, non esitare a contattarci.

Grazie per aver scelto Villa Ingrosso!

Il Team di Villa Ingrosso
📧 info@villaingrosso.com
🌐 villaingrosso.com`
  },
  booking_confirmation: {
    name: "Conferma Prenotazione",
    subject: "✅ Conferma prenotazione Villa Ingrosso - [NOME]",
    content: `Caro [NOME],

La tua prenotazione è stata confermata!

📅 Dettagli prenotazione:
• Check-in: [CHECK_IN]
• Check-out: [CHECK_OUT] 
• Ospiti: [OSPITI]

📍 Villa Ingrosso
Leporano Marina, Puglia
A 300m dal mare cristallino

🏠 La villa dispone di:
• 2 camere da letto
• Cucina completamente attrezzata
• Terrazza con vista mare
• Parcheggio privato

📋 Informazioni importanti:
• Check-in dalle 15:00
• Check-out entro le 11:00
• Troverai le chiavi nella cassetta di sicurezza

Ti invieremo le istruzioni dettagliate per l'accesso qualche giorno prima del tuo arrivo.

Non vediamo l'ora di accoglierti!

Il Team di Villa Ingrosso
📧 info@villaingrosso.com
🌐 villaingrosso.com`
  },
  special_offer: {
    name: "Offerta Speciale",
    subject: "🌟 Offerta esclusiva per te - Villa Ingrosso",
    content: `Caro [NOME],

Abbiamo un'offerta speciale pensata apposta per te!

🎯 OFFERTA LIMITATA:
[DETTAGLI_OFFERTA]

🏖️ Villa Ingrosso ti aspetta:
• Posizione privilegiata a 300m dal mare
• Villa moderna e confortevole
• Esperienza autentica pugliese
• Tramonti indimenticabili

⏰ Questa offerta è valida fino al [SCADENZA]

Non perdere l'occasione di vivere una vacanza da sogno in Puglia!

Prenota ora o contattaci per maggiori informazioni.

Il Team di Villa Ingrosso
📧 info@villaingrosso.com
🌐 villaingrosso.com`
  },
  thank_you: {
    name: "Ringraziamento Post-Soggiorno",
    subject: "Grazie per aver scelto Villa Ingrosso! 🙏",
    content: `Caro [NOME],

Speriamo che tu abbia trascorso momenti indimenticabili a Villa Ingrosso!

🌊 È stato un piacere ospitarti nella nostra villa e speriamo che tu abbia potuto goderti:
• Le bellissime spiagge della Costa Ionica
• I tramonti mozzafiato dal nostro terrazzo
• L'autentica ospitalità pugliese
• I sapori della cucina locale

💭 La tua opinione conta:
Ci piacerebbe molto ricevere il tuo feedback sulla tua esperienza. Le tue recensioni ci aiutano a migliorare costantemente.

🎁 Per il tuo prossimo soggiorno:
Come ringraziamento, ti offriamo uno sconto del 10% sulla tua prossima prenotazione. Contattaci per maggiori dettagli!

Speriamo di rivederti presto a Villa Ingrosso!

Con affetto,
Il Team di Villa Ingrosso
📧 info@villaingrosso.com
🌐 villaingrosso.com`
  }
};

export default function AdminEmailPage() {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleTemplateSelect = (templateKey: string) => {
    const template = emailTemplates[templateKey as keyof typeof emailTemplates];
    setSelectedTemplate(templateKey);
    setEmailSubject(template.subject);
    setEmailContent(template.content);
  };

  const processTemplate = (content: string, subject: string) => {
    return {
      subject: subject
        .replace(/\[NOME\]/g, recipientName || "[NOME]"),
      content: content
        .replace(/\[NOME\]/g, recipientName || "[NOME]")
        .replace(/\[CHECK_IN\]/g, "[CHECK_IN]")
        .replace(/\[CHECK_OUT\]/g, "[CHECK_OUT]")
        .replace(/\[OSPITI\]/g, "[OSPITI]")
        .replace(/\[DETTAGLI_OFFERTA\]/g, "[DETTAGLI_OFFERTA]")
        .replace(/\[SCADENZA\]/g, "[SCADENZA]")
    };
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !emailSubject || !emailContent) {
      toast({
        title: "Campi mancanti",
        description: "Compila tutti i campi richiesti",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const processed = processTemplate(emailContent, emailSubject);
      
      const response = await apiRequest("POST", "/api/admin/send-custom-email", {
        email: recipientEmail,
        name: recipientName,
        subject: processed.subject,
        content: processed.content
      });

      if (response.ok) {
        toast({
          title: "Email inviata",
          description: "L'email è stata inviata con successo",
        });
        
        // Reset form
        setRecipientEmail("");
        setRecipientName("");
        setEmailSubject("");
        setEmailContent("");
        setSelectedTemplate("");
      } else {
        throw new Error("Errore nell'invio");
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio dell'email",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const previewContent = processTemplate(emailContent, emailSubject);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Mail className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Invio Email Personalizzate</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form di composizione */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Componi Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selezione template */}
            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(emailTemplates).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destinatario */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientEmail">Email destinatario *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                />
              </div>
              <div>
                <Label htmlFor="recipientName">Nome destinatario</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nome Cliente"
                />
              </div>
            </div>

            {/* Oggetto email */}
            <div>
              <Label htmlFor="subject">Oggetto email *</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Oggetto dell'email"
              />
            </div>

            {/* Contenuto email */}
            <div>
              <Label htmlFor="content">Contenuto email *</Label>
              <Textarea
                id="content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Scrivi il contenuto dell'email..."
                rows={12}
                className="resize-none"
              />
            </div>

            {/* Azioni */}
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsPreview(!isPreview)}
                variant="outline"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreview ? "Modifica" : "Anteprima"}
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={isSending || !recipientEmail || !emailSubject || !emailContent}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Invio..." : "Invia Email"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Anteprima */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Anteprima Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPreview && (recipientEmail || emailSubject || emailContent) ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">A:</div>
                  <div className="font-medium">{recipientEmail || "destinatario@email.com"}</div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Oggetto:</div>
                  <div className="font-medium">{previewContent.subject}</div>
                </div>

                <div className="p-4 bg-white border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-3">Contenuto:</div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {previewContent.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Seleziona un template o compila i campi per vedere l'anteprima</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guida template */}
      <Card>
        <CardHeader>
          <CardTitle>Variabili Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <code className="bg-muted px-2 py-1 rounded">[NOME]</code>
              <p className="text-muted-foreground mt-1">Nome del destinatario</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">[CHECK_IN]</code>
              <p className="text-muted-foreground mt-1">Data check-in</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">[CHECK_OUT]</code>
              <p className="text-muted-foreground mt-1">Data check-out</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">[OSPITI]</code>
              <p className="text-muted-foreground mt-1">Numero ospiti</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">[DETTAGLI_OFFERTA]</code>
              <p className="text-muted-foreground mt-1">Dettagli offerta speciale</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">[SCADENZA]</code>
              <p className="text-muted-foreground mt-1">Data scadenza offerta</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}