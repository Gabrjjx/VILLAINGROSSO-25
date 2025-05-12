import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, User } from "lucide-react";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carica i messaggi all'avvio
  useEffect(() => {
    fetchMessages();
    // Aggiorna i messaggi ogni 10 secondi
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  // Scorre automaticamente fino all'ultimo messaggio
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Recupera i messaggi dal server
  const fetchMessages = async () => {
    try {
      const res = await apiRequest("GET", "/api/chat-messages");
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await res.json();
      setMessages(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  // Invia un nuovo messaggio
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await apiRequest("POST", "/api/chat-messages", {
        message: newMessage,
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const sentMessage = await res.json();
      setMessages([...messages, sentMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: t("chat.error"),
        description: t("chat.sendError"),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Formatta le date in base alla lingua
  const formatMessageDate = (dateString: string) => {
    const localeObj = language === "it" ? it : enUS;
    const dateObj = new Date(dateString);
    return format(dateObj, "PPp", { locale: localeObj });
  };

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
                    {msg.isFromAdmin ? "A" : user?.username?.charAt(0).toUpperCase()}
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
                    {msg.isFromAdmin ? t("chat.admin") : user?.username}{" "}
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
        <form onSubmit={sendMessage} className="w-full flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("chat.messagePlaceholder")}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending || !newMessage.trim()}>
            {isSending ? (
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