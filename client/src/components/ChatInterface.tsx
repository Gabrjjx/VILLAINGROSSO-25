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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Tipo per i messaggi di chat
interface ChatMessage {
  id: number;
  userId: number;
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
  const queryClient = useQueryClient();

  // Funzione per ottenere messaggi dal server
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch
  } = useQuery<ChatMessage[]>({
    queryKey: ['chat-messages'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/chat-messages', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Errore nel caricamento dei messaggi');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Errore nel caricamento dei messaggi:', error);
        // Se ci sono errori, inizializza con un messaggio predefinito
        return [{
          id: 1,
          userId: 0,
          isFromAdmin: true,
          message: "Benvenuto nella chat di Villa Ingrosso! Come possiamo aiutarti?",
          createdAt: new Date().toISOString(),
        }];
      }
    },
    refetchInterval: 10000, // Ricontrolla ogni 10 secondi
  });

  // Mutation per inviare un nuovo messaggio
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });
      
      if (!response.ok) {
        throw new Error('Errore nell\'invio del messaggio');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Dopo aver inviato con successo, aggiorna la lista dei messaggi
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      setNewMessage('');
    },
    onError: (error) => {
      console.error('Errore nell\'invio del messaggio:', error);
      toast({
        title: t("chat.error"),
        description: t("chat.sendError"),
        variant: "destructive",
      });
      
      // In caso di errore, aggiungi comunque il messaggio localmente
      if (user) {
        const tempMessage: ChatMessage = {
          id: Date.now(),
          userId: user.id,
          isFromAdmin: false,
          message: newMessage,
          createdAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData(['chat-messages'], (oldData: ChatMessage[] = []) => {
          return [...oldData, tempMessage];
        });
        
        setNewMessage('');
      }
    },
  });

  // Invia un nuovo messaggio
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate(newMessage);
  };

  // Scorre automaticamente fino all'ultimo messaggio
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Formatta le date in base alla lingua
  const formatMessageDate = (dateString: string) => {
    const localeObj = language === "it" ? it : enUS;
    const dateObj = new Date(dateString);
    return format(dateObj, "PPp", { locale: localeObj });
  };

  // Se si verifica un errore nel caricamento, mostra un messaggio di errore con la possibilità di riprovare
  if (isError) {
    return (
      <Card className="w-full h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>{t("chat.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{t("chat.loadError")}</p>
            <Button onClick={() => refetch()}>
              {t("chat.retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>{t("chat.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground h-full flex flex-col justify-center">
            <p>{t("chat.noMessages")}</p>
            <p className="mt-2">{t("chat.startConversation")}</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 h-[420px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.isFromAdmin ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <Avatar className={`${msg.isFromAdmin ? "bg-primary" : "bg-muted"}`}>
                  <AvatarFallback>
                    {msg.isFromAdmin ? "A" : user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.isFromAdmin
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="mb-1 text-xs opacity-70">
                    {msg.isFromAdmin ? t("chat.admin") : user?.username || "Ospite"}{" "}
                    • {formatMessageDate(msg.createdAt)}
                  </div>
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="w-full flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("chat.messagePlaceholder")}
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button type="submit" disabled={sendMessageMutation.isPending || !newMessage.trim()}>
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">{t("chat.send")}</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}