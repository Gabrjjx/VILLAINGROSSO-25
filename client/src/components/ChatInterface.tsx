import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";

interface ChatMessage {
  id: number;
  userId?: number;
  isFromAdmin: boolean;
  message: string;
  createdAt: string;
}

export default function ChatInterface() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Carica i messaggi dall'API
  const loadMessages = async () => {
    if (!user) return;
    
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) return;
      
      const response = await fetch('/api/chat-messages', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const apiMessages = await response.json();
        setMessages(apiMessages);
      }
    } catch (error) {
      console.error("Errore caricamento messaggi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Ricarica messaggi ogni 3 secondi per sincronizzazione in tempo reale
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Scroll automatico ai nuovi messaggi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Invia un nuovo messaggio
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    
    setIsSending(true);
    
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        toast({
          title: "Errore",
          description: "Token di autenticazione mancante",
          variant: "destructive",
        });
        return;
      }
      
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ message: newMessage }),
      });
      
      if (response.ok) {
        setNewMessage("");
        // Ricarica i messaggi immediatamente per mostrare il nuovo messaggio
        loadMessages();
        toast({
          title: "Successo",
          description: "Messaggio inviato",
        });
      } else {
        throw new Error('Errore invio messaggio');
      }
    } catch (error) {
      console.error("Errore invio messaggio:", error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const locale = language === "it" ? it : enUS;
    return format(date, "dd/MM/yyyy HH:mm", { locale });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              VI
            </AvatarFallback>
          </Avatar>
          <span>{t("chat.title") || "Chat Villa Ingrosso"}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                {t("chat.noMessages") || "Nessun messaggio ancora. Inizia la conversazione!"}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.isFromAdmin
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="mb-1 text-xs opacity-70">
                      {msg.isFromAdmin ? t("chat.admin") || "Admin" : user?.username || "Ospite"}{" "}
                      • {formatMessageDate(msg.createdAt)}
                    </div>
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <form onSubmit={handleSendMessage} className="w-full flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("chat.messagePlaceholder") || "Scrivi un messaggio..."}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending || !newMessage.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">{t("chat.send") || "Invia"}</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}