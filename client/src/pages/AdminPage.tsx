import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Booking, ContactMessage, User, ChatMessage } from "@shared/schema";
import { format } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminRoute } from "@/components/ProtectedRoute";
import { 
  Loader2, LogOut, User as UserIcon, Calendar, Mail, Check, 
  MoreHorizontal, Home, Users, MessageCircle, Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function AdminPageWrapper() {
  return (
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
  );
}

function AdminPage() {
  const { t, language } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newAdminMessage, setNewAdminMessage] = useState("");
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);

  // Carica gli utenti
  const { data: users, isLoading: usersLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/users");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: t("admin.users.error"),
          description: t("admin.users.errorFetching"),
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Carica tutte le prenotazioni
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/bookings");
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: t("admin.bookings.error"),
          description: t("admin.bookings.errorFetching"),
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Carica i messaggi di contatto
  const { data: messages, isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/messages"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/messages");
        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: t("admin.messages.error"),
          description: t("admin.messages.errorFetching"),
          variant: "destructive",
        });
        return [];
      }
    },
  });
  
  // Carica i messaggi di chat per un utente specifico (quando selezionato)
  const { data: chatMessages, isLoading: chatMessagesLoading, refetch: refetchChatMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      try {
        // Qui dovremmo implementare l'endpoint per i messaggi di chat di un utente specifico
        // Per ora fingiamo che ci sia un endpoint che restituisce i messaggi di chat di un utente
        const response = await fetch(`/api/admin/chat-messages/${selectedUser}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return []; // Nessun messaggio per questo utente
          }
          throw new Error('Failed to fetch chat messages');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }
    },
    enabled: !!selectedUser, // Esegui la query solo quando è selezionato un utente
  });

  // Mutation per inviare un messaggio come admin
  const sendAdminMessage = useMutation({
    mutationFn: async (messageData: { userId: number, message: string }) => {
      // Usa il token JWT nell'header Authorization
      const authToken = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`/api/admin/chat-messages/${messageData.userId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: messageData.message })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Resetta il campo di input del messaggio
      setNewAdminMessage('');
      
      // Aggiorna la lista dei messaggi
      refetchChatMessages();
      
      toast({
        title: t("admin.chat.messageSent") || "Messaggio inviato",
        description: t("admin.chat.messageSentDescription") || "Il messaggio è stato inviato con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("admin.chat.error") || "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Funzione per inviare un messaggio come admin
  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !newAdminMessage.trim()) return;
    
    sendAdminMessage.mutate({
      userId: selectedUser,
      message: newAdminMessage
    });
  };

  // Funzione per segnare un messaggio come letto
  const markMessageAsRead = async (id: number) => {
    try {
      const res = await apiRequest("PATCH", `/api/admin/messages/${id}/read`);
      if (!res.ok) {
        throw new Error("Failed to mark message as read");
      }
      
      // Aggiorna la cache con il messaggio letto
      queryClient.setQueryData<ContactMessage[]>(["/api/admin/messages"], (oldData) => {
        if (!oldData) return [];
        return oldData.map(msg => {
          if (msg.id === id) {
            return { ...msg, read: true };
          }
          return msg;
        });
      });
      
      toast({
        title: t("admin.messages.success"),
        description: t("admin.messages.markedAsRead"),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast({
        title: t("admin.messages.error"),
        description: t("admin.messages.errorMarking"),
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Helper per formattare le date in base alla lingua
  const formatDate = (date: string | Date) => {
    const localeObj = language === "it" ? it : enUS;
    return format(new Date(date), "PPP", { locale: localeObj });
  };

  // Statistiche per la dashboard
  const stats = {
    totalUsers: users?.length || 0,
    totalBookings: bookings?.length || 0,
    pendingBookings: bookings?.filter(b => b.status === "pending").length || 0,
    unreadMessages: messages?.filter(m => !m.read).length || 0,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header dell'area amministrativa */}
      <div className="bg-gradient-to-r from-primary/80 to-primary text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
            <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {t("admin.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[600px] grid-cols-5">
            <TabsTrigger value="dashboard">
              <Home className="h-4 w-4 mr-2" />
              {t("admin.tabs.dashboard")}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              {t("admin.tabs.users")}
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              {t("admin.tabs.bookings")}
            </TabsTrigger>
            <TabsTrigger value="messages">
              <Mail className="h-4 w-4 mr-2" />
              {t("admin.tabs.messages")}
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t("admin.tabs.chat") || "Chat"}
            </TabsTrigger>
          </TabsList>

          {/* Tab Dashboard */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("admin.dashboard.users")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  <p className="text-muted-foreground text-sm">{t("admin.dashboard.registeredUsers")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("admin.dashboard.bookings")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalBookings}</div>
                  <p className="text-muted-foreground text-sm">{t("admin.dashboard.totalBookings")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("admin.dashboard.pending")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.pendingBookings}</div>
                  <p className="text-muted-foreground text-sm">{t("admin.dashboard.pendingBookings")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("admin.dashboard.messages")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.unreadMessages}</div>
                  <p className="text-muted-foreground text-sm">{t("admin.dashboard.unreadMessages")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">{t("admin.dashboard.recentBookings")}</h2>
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.bookings.table.guest")}</TableHead>
                        <TableHead>{t("admin.bookings.table.dates")}</TableHead>
                        <TableHead>{t("admin.bookings.table.guests")}</TableHead>
                        <TableHead>{t("admin.bookings.table.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.slice(0, 5).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.guestName}</TableCell>
                          <TableCell>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </TableCell>
                          <TableCell>{booking.guestCount}</TableCell>
                          <TableCell>
                            {booking.status === "confirmed" ? (
                              <Badge className="bg-green-500">{t("admin.bookings.status.confirmed")}</Badge>
                            ) : booking.status === "pending" ? (
                              <Badge className="bg-amber-500">{t("admin.bookings.status.pending")}</Badge>
                            ) : (
                              <Badge className="bg-red-500">{t("admin.bookings.status.cancelled")}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">{t("admin.bookings.noBookings")}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab Utenti */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.users.title")}</CardTitle>
                <CardDescription>{t("admin.users.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : users && users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.users.table.id")}</TableHead>
                        <TableHead>{t("admin.users.table.name")}</TableHead>
                        <TableHead>{t("admin.users.table.email")}</TableHead>
                        <TableHead>{t("admin.users.table.username")}</TableHead>
                        <TableHead>{t("admin.users.table.role")}</TableHead>
                        <TableHead>{t("admin.users.table.created")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge>{t("admin.users.roles.admin")}</Badge>
                            ) : (
                              <Badge variant="outline">{t("admin.users.roles.user")}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt || new Date())}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">{t("admin.users.noUsers")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Prenotazioni */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.bookings.title")}</CardTitle>
                <CardDescription>{t("admin.bookings.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.bookings.table.id")}</TableHead>
                        <TableHead>{t("admin.bookings.table.guest")}</TableHead>
                        <TableHead>{t("admin.bookings.table.dates")}</TableHead>
                        <TableHead>{t("admin.bookings.table.guests")}</TableHead>
                        <TableHead>{t("admin.bookings.table.status")}</TableHead>
                        <TableHead>{t("admin.bookings.table.amount")}</TableHead>
                        <TableHead className="text-right">{t("admin.bookings.table.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.id}</TableCell>
                          <TableCell className="font-medium">{booking.guestName}</TableCell>
                          <TableCell>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </TableCell>
                          <TableCell>{booking.guestCount}</TableCell>
                          <TableCell>
                            {booking.status === "confirmed" ? (
                              <Badge className="bg-green-500">{t("admin.bookings.status.confirmed")}</Badge>
                            ) : booking.status === "pending" ? (
                              <Badge className="bg-amber-500">{t("admin.bookings.status.pending")}</Badge>
                            ) : (
                              <Badge className="bg-red-500">{t("admin.bookings.status.cancelled")}</Badge>
                            )}
                          </TableCell>
                          <TableCell>€{booking.totalAmount.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t("admin.bookings.openMenu")}</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("admin.bookings.actions")}</DropdownMenuLabel>
                                <DropdownMenuItem>{t("admin.bookings.viewDetails")}</DropdownMenuItem>
                                {booking.status === "pending" && (
                                  <DropdownMenuItem>{t("admin.bookings.confirm")}</DropdownMenuItem>
                                )}
                                {booking.status !== "cancelled" && (
                                  <DropdownMenuItem>{t("admin.bookings.cancel")}</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">{t("admin.bookings.noBookings")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Messaggi */}
          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.messages.title")}</CardTitle>
                <CardDescription>{t("admin.messages.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className={`overflow-hidden ${!message.read ? "border-primary" : ""}`}>
                        <div className="bg-muted p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-lg">{message.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {message.email} - {formatDate(message.createdAt || new Date())}
                              </p>
                            </div>
                            <div>
                              {!message.read ? (
                                <Badge variant="outline" className="border-primary text-primary">
                                  {t("admin.messages.unread")}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                                  {t("admin.messages.read")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="mb-4">{message.message}</p>
                          {!message.read && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markMessageAsRead(message.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {t("admin.messages.markAsRead")}
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">{t("admin.messages.noMessages")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab Chat */}
          <TabsContent value="chat" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.chat.title") || "Chat con gli utenti"}</CardTitle>
                <CardDescription>{t("admin.chat.description") || "Gestisci le conversazioni con gli utenti della piattaforma"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Lista degli utenti con chat */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-3 border-b">
                      <h3 className="text-sm font-medium">{t("admin.chat.users") || "Utenti"}</h3>
                    </div>
                    <div className="h-[400px] overflow-y-auto">
                      {usersLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : users && users.length > 0 ? (
                        <div className="divide-y">
                          {users.filter(u => !u.isAdmin).map((u) => (
                            <div
                              key={u.id}
                              className={`p-3 flex items-center hover:bg-accent/50 cursor-pointer ${
                                selectedUser === u.id ? "bg-accent" : ""
                              }`}
                              onClick={() => setSelectedUser(u.id)}
                            >
                              <Avatar className="h-9 w-9 mr-3">
                                <AvatarFallback>
                                  {u.username?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{u.fullName || u.username}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-full text-muted-foreground">
                          <p>{t("admin.chat.noUsers") || "Nessun utente trovato"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Area dei messaggi */}
                  <div className="md:col-span-2 border rounded-lg flex flex-col h-[500px]">
                    {!selectedUser ? (
                      <div className="flex-grow flex justify-center items-center text-muted-foreground">
                        <p>{t("admin.chat.selectUser") || "Seleziona un utente per visualizzare la chat"}</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-muted p-3 border-b">
                          <h3 className="text-sm font-medium">
                            {users?.find(u => u.id === selectedUser)?.username || `Utente #${selectedUser}`}
                          </h3>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                          {chatMessagesLoading ? (
                            <div className="flex justify-center items-center h-full">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : chatMessages && chatMessages.length > 0 ? (
                            chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex gap-3 ${
                                  msg.isFromAdmin ? "flex-row-reverse" : "flex-row"
                                }`}
                              >
                                <Avatar className={`${msg.isFromAdmin ? "bg-primary" : "bg-muted"}`}>
                                  <AvatarFallback>
                                    {msg.isFromAdmin ? "A" : users?.find(u => u.id === selectedUser)?.username?.charAt(0).toUpperCase() || "U"}
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
                                    {msg.isFromAdmin ? "Admin" : users?.find(u => u.id === selectedUser)?.username || "Utente"}{" "}
                                    • {formatDate(msg.createdAt)}
                                  </div>
                                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex justify-center items-center h-full text-muted-foreground">
                              <p>{t("admin.chat.noMessages") || "Nessun messaggio trovato"}</p>
                            </div>
                          )}
                          <div ref={adminMessagesEndRef} />
                        </div>
                        
                        <div className="p-3 border-t">
                          <form onSubmit={handleSendAdminMessage} className="flex space-x-2">
                            <Input
                              value={newAdminMessage}
                              onChange={(e) => setNewAdminMessage(e.target.value)}
                              placeholder={t("admin.chat.messagePlaceholder") || "Scrivi un messaggio..."}
                              disabled={sendAdminMessage.isPending}
                              className="flex-1"
                            />
                            <Button type="submit" disabled={sendAdminMessage.isPending || !newAdminMessage.trim()}>
                              {sendAdminMessage.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              <span className="ml-2 hidden sm:inline">{t("admin.chat.send") || "Invia"}</span>
                            </Button>
                          </form>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}