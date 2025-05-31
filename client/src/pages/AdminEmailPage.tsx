import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, Eye, User, FileText, Clock, Check, Calendar, Users, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isAdmin: boolean;
}

interface EmailHistoryItem {
  id: number;
  to: string;
  subject: string;
  sentAt: string;
  status: string;
  priority: string;
}

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
  const [activeTab, setActiveTab] = useState("compose");
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [priority, setPriority] = useState("normal");
  const { toast } = useToast();

  // Carica utenti registrati
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      return await res.json();
    },
  });

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
        content: processed.content,
        priority: priority
      });

      if (response.ok) {
        toast({
          title: "Email inviata",
          description: "L'email è stata inviata con successo",
        });
        
        // Aggiungi alla cronologia
        const newEmail = {
          id: Date.now(),
          to: recipientEmail,
          subject: processed.subject,
          sentAt: new Date().toISOString(),
          status: "sent",
          priority: priority
        };
        setEmailHistory(prev => [newEmail, ...prev]);
        
        // Reset form
        setRecipientEmail("");
        setRecipientName("");
        setEmailSubject("");
        setEmailContent("");
        setSelectedTemplate("");
        setPriority("normal");
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

  const handleBulkSend = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Nessun destinatario",
        description: "Seleziona almeno un utente",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of selectedUsers) {
      const user = users.find((u: User) => u.id.toString() === userId);
      if (!user) continue;

      try {
        const processed = processTemplate(emailContent, emailSubject);
        const processedForUser = {
          subject: processed.subject.replace(/\[NOME\]/g, user.fullName || user.username),
          content: processed.content.replace(/\[NOME\]/g, user.fullName || user.username)
        };

        const response = await apiRequest("POST", "/api/admin/send-custom-email", {
          email: user.email,
          name: user.fullName || user.username,
          subject: processedForUser.subject,
          content: processedForUser.content,
          priority: priority
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setIsSending(false);
    toast({
      title: "Invio completato",
      description: `${successCount} email inviate con successo, ${errorCount} errori`,
      variant: successCount > 0 ? "default" : "destructive",
    });

    setSelectedUsers([]);
  };

  const previewContent = processTemplate(emailContent, emailSubject);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Email Marketing Professionale</h1>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Sistema Avanzato
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Componi
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Invio Multiplo
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Cronologia
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Template
          </TabsTrigger>
        </TabsList>

        {/* Tab Composizione Singola */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form principale */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Componi Email
                    </span>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🔵 Bassa</SelectItem>
                        <SelectItem value="normal">⚪ Normale</SelectItem>
                        <SelectItem value="high">🔴 Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template selector */}
                  <div>
                    <Label>Template Professionale</Label>
                    <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona template predefinito" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(emailTemplates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {key === 'welcome' ? 'Benvenuto' : 
                                 key === 'booking_confirmation' ? 'Conferma' :
                                 key === 'special_offer' ? 'Offerta' : 'Grazie'}
                              </Badge>
                              {template.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Destinatario */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipientEmail">Email Destinatario *</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="cliente@email.com"
                        className="font-mono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipientName">Nome Completo</Label>
                      <Input
                        id="recipientName"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Nome e Cognome"
                      />
                    </div>
                  </div>

                  {/* Oggetto */}
                  <div>
                    <Label htmlFor="subject">Oggetto Email *</Label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Oggetto professionale e accattivante"
                      className="font-semibold"
                    />
                  </div>

                  {/* Contenuto */}
                  <div>
                    <Label htmlFor="content">Contenuto Email *</Label>
                    <Textarea
                      id="content"
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Scrivi il contenuto dell'email usando le variabili disponibili..."
                      rows={16}
                      className="resize-none font-mono text-sm"
                    />
                  </div>

                  {/* Azioni */}
                  <div className="flex gap-2 pt-4">
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
            </div>

            {/* Anteprima */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Anteprima Live
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recipientEmail || emailSubject || emailContent ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="text-xs text-blue-600 font-medium mb-1">DESTINATARIO</div>
                        <div className="font-medium">{recipientEmail || "destinatario@email.com"}</div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <div className="text-xs text-green-600 font-medium mb-1">OGGETTO</div>
                        <div className="font-medium">{previewContent.subject || "Nessun oggetto"}</div>
                      </div>

                      <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                        <div className="text-xs text-gray-500 font-medium mb-3">CONTENUTO EMAIL</div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {previewContent.content || "Nessun contenuto"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Priorità: {priority === 'high' ? '🔴 Alta' : priority === 'low' ? '🔵 Bassa' : '⚪ Normale'}</span>
                        <span>Caratteri: {emailContent.length}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">L'anteprima apparirà qui</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Variabili disponibili */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Variabili Dinamiche</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { var: '[NOME]', desc: 'Nome destinatario' },
                    { var: '[CHECK_IN]', desc: 'Data arrivo' },
                    { var: '[CHECK_OUT]', desc: 'Data partenza' },
                    { var: '[OSPITI]', desc: 'Numero ospiti' },
                    { var: '[DETTAGLI_OFFERTA]', desc: 'Dettagli offerta' },
                    { var: '[SCADENZA]', desc: 'Data scadenza' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <code className="bg-gray-100 px-2 py-1 rounded text-blue-600 font-mono">
                        {item.var}
                      </code>
                      <span className="text-gray-500">{item.desc}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab Invio Multiplo */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Invio Email Multiplo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Seleziona Destinatari</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                  {users.map((user: User) => (
                    <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id.toString()]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id.toString()));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{user.fullName || user.username}</span>
                      <span className="text-xs text-gray-500">({user.email})</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {selectedUsers.length} utenti selezionati
                  </span>
                  <div className="space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedUsers(users.map(u => u.id.toString()))}
                    >
                      Seleziona Tutti
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedUsers([])}
                    >
                      Deseleziona Tutti
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleBulkSend}
                disabled={isSending || selectedUsers.length === 0 || !emailSubject || !emailContent}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Invio in corso..." : `Invia a ${selectedUsers.length} destinatari`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cronologia */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Cronologia Email Inviate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {emailHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessuna email inviata ancora</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailHistory.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{email.subject}</div>
                        <div className="text-sm text-gray-500">A: {email.to}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={email.status === 'sent' ? 'default' : 'destructive'}>
                          {email.status === 'sent' ? 'Inviata' : 'Errore'}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(email.sentAt), "dd/MM/yyyy HH:mm", { locale: it })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Template */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Gestione Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(emailTemplates).map(([key, template]) => (
                  <div key={key} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="outline">{key}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.subject}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        handleTemplateSelect(key);
                        setActiveTab("compose");
                      }}
                      className="w-full"
                    >
                      Usa Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}