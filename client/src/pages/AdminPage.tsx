import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
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
import SendGridManager from "@/components/SendGridManager";
import { 
  Loader2, LogOut, User as UserIcon, Calendar, Mail, Check, 
  MoreHorizontal, Home, Users, MessageCircle, Send, 
  CircleUser, Settings, Bell, ChevronRight,
  CalendarDays, Smartphone, Map, ArrowUp, ArrowDown,
  ArrowUpRight, Eye, CheckCircle, XCircle, Clock, Plus,
  FileText, HelpCircle, Edit, Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

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
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newAdminMessage, setNewAdminMessage] = useState("");
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);

  // Carica gli utenti
  const { data: users = [], isLoading: usersLoading } = useQuery<Omit<User, "password">[]>({
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
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
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
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ContactMessage[]>({
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
  
  // Carica i messaggi di chat
  const { data: chatMessages = [], isLoading: chatMessagesLoading, refetch: refetchChatMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", selectedUser],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      try {
        // Usa il token JWT nell'header Authorization
        const authToken = localStorage.getItem('auth_token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`/api/admin/chat-messages/${selectedUser}`, {
          headers
        });
        
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
    refetchInterval: 3000, // Aggiorna automaticamente ogni 3 secondi
  });
  
  // Scroll al fondo della chat quando arrivano nuovi messaggi
  useEffect(() => {
    if (adminMessagesEndRef.current && chatMessages?.length > 0) {
      adminMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

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

  // Stati per la gestione dei dettagli delle prenotazioni
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Mutation per cancellare una prenotazione
  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/bookings/${bookingId}`);
      if (!res.ok) {
        throw new Error("Failed to delete booking");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: t("admin.bookings.deleteSuccess") || "Prenotazione cancellata",
        description: t("admin.bookings.deleteSuccessDesc") || "La prenotazione è stata cancellata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("admin.bookings.deleteError") || "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation per cambiare lo status di una prenotazione
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/status`, { status });
      if (!res.ok) {
        throw new Error("Failed to update booking status");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: t("admin.bookings.statusUpdateSuccess") || "Status aggiornato",
        description: t("admin.bookings.statusUpdateSuccessDesc") || "Lo status della prenotazione è stato aggiornato",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("admin.bookings.statusUpdateError") || "Errore",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Funzioni per gestire le azioni delle prenotazioni
  const handleViewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleConfirmBooking = (bookingId: number) => {
    updateBookingStatusMutation.mutate({ bookingId, status: "confirmed" });
  };

  const handleCancelBooking = (bookingId: number) => {
    if (window.confirm(t("admin.bookings.confirmCancel") || "Sei sicuro di voler cancellare questa prenotazione?")) {
      updateBookingStatusMutation.mutate({ bookingId, status: "cancelled" });
    }
  };

  const handleDeleteBooking = (bookingId: number) => {
    if (window.confirm(t("admin.bookings.confirmDelete") || "Sei sicuro di voler eliminare definitivamente questa prenotazione?")) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  // Helper per formattare le date in base alla lingua
  const formatDate = (date: string | Date) => {
    if (!date) return "-";
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

  // Calcola la percentuale di occupazione mensile
  const calculateOccupancyRate = () => {
    if (!bookings || bookings.length === 0) return 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filtra le prenotazioni per il mese corrente
    const currentMonthBookings = bookings.filter(booking => {
      if (!booking.startDate) return false;
      const startDate = new Date(booking.startDate);
      return startDate.getMonth() === currentMonth && 
             startDate.getFullYear() === currentYear &&
             booking.status !== "cancelled";
    });
    
    // Semplice calcolo del tasso di occupazione (esempio)
    // In un'applicazione reale, dovresti calcolare il numero effettivo di giorni prenotati
    return Math.min(Math.round((currentMonthBookings.length / 10) * 100), 100);
  };

  // Funzione per ottenere la tendenza delle prenotazioni
  const getBookingTrend = () => {
    if (!bookings || bookings.length < 2) return "stable";
    
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const twoMonthsAgoDate = new Date();
    twoMonthsAgoDate.setMonth(twoMonthsAgoDate.getMonth() - 2);
    
    const lastMonthBookings = bookings.filter(booking => {
      if (!booking.createdAt) return false;
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= lastMonthDate;
    }).length;
    
    const twoMonthsAgoBookings = bookings.filter(booking => {
      if (!booking.createdAt) return false;
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= twoMonthsAgoDate && bookingDate < lastMonthDate;
    }).length;
    
    if (lastMonthBookings > twoMonthsAgoBookings) {
      return "increasing";
    } else if (lastMonthBookings < twoMonthsAgoBookings) {
      return "decreasing";
    } else {
      return "stable";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar e contenuto principale */}
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col h-full bg-white dark:bg-zinc-800 border-r border-border">
            {/* Logo e titolo */}
            <div className="px-6 py-6 border-b border-border">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">VI</div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold">Villa Ingrosso</h2>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              </div>
            </div>
            
            {/* Menu principale */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    activeTab === "dashboard"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Home className="h-5 w-5 mr-3" />
                  {t("admin.tabs.dashboard")}
                </button>
                
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    activeTab === "users"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  {t("admin.tabs.users")}
                </button>
                
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    activeTab === "bookings"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  {t("admin.tabs.bookings")}
                </button>
                
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    activeTab === "messages"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Mail className="h-5 w-5 mr-3" />
                  {t("admin.tabs.contactForm")}
                  {stats.unreadMessages > 0 && (
                    <Badge className="ml-auto bg-primary">{stats.unreadMessages}</Badge>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    activeTab === "chat"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="h-5 w-5 mr-3" />
                  {t("admin.tabs.chatWithUsers")}
                </button>
                
                <button
                  onClick={() => setActiveTab("blog")}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    activeTab === "blog"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Blog & News
                </button>
                
                <button
                  onClick={() => setActiveTab("faq")}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    activeTab === "faq"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <HelpCircle className="h-5 w-5 mr-3" />
                  FAQ
                </button>
                
                <button
                  onClick={() => setActiveTab("sendgrid")}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    activeTab === "sendgrid"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Send className="h-5 w-5 mr-3" />
                  Email e SMS
                </button>
                
                <a
                  href="/admin/email"
                  className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Mail className="h-5 w-5 mr-3" />
                  Email Personalizzate
                </a>
              </nav>
            </div>
            
            {/* Profilo utente e logout */}
            <div className="px-3 py-4 border-t border-border">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-primary text-white">
                    {user.username?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.fullName || user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.isAdmin ? t("admin.users.roles.admin") : t("admin.users.roles.user")}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra mobile e contenuto principale */}
        <div className="flex flex-1 flex-col overflow-hidden">
          
          {/* Header mobile */}
          <div className="md:hidden bg-white dark:bg-zinc-800 border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">VI</div>
                <h2 className="ml-2 text-lg font-semibold">Admin</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} disabled={logoutMutation.isPending}>
                {logoutMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {/* Navigation tabs mobile */}
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="dashboard">
                    <Home className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="users">
                    <Users className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="bookings">
                    <Calendar className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="messages">
                    <Mail className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="chat">
                    <MessageCircle className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Contenuto principale */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tab Dashboard */}
            {activeTab === "dashboard" && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">{t("admin.tabs.dashboard")}</h1>
                    <p className="text-muted-foreground">
                      {format(new Date(), "PPPP", { locale: language === "it" ? it : enUS })}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => window.location.href = '/admin/booking'}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'it' ? 'Nuova Prenotazione' : 'New Booking'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/admin/email'}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {language === 'it' ? 'Invia Email' : 'Send Email'}
                    </Button>
                  </div>
                </div>
                
                {/* Statistiche card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {t("admin.dashboard.users")}
                          </p>
                          <h3 className="text-2xl font-bold mt-2">{stats.totalUsers}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("admin.dashboard.registeredUsers")}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <CircleUser className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {t("admin.dashboard.bookings")}
                          </p>
                          <div className="flex items-center mt-2">
                            <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
                            {getBookingTrend() === "increasing" ? (
                              <Badge className="ml-2 bg-green-500">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                +{Math.round(Math.random() * 15 + 5)}%
                              </Badge>
                            ) : getBookingTrend() === "decreasing" ? (
                              <Badge className="ml-2 bg-red-500">
                                <ArrowDown className="h-3 w-3 mr-1" />
                                -{Math.round(Math.random() * 10 + 3)}%
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("admin.dashboard.totalBookings")}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {t("admin.dashboard.pending")}
                          </p>
                          <h3 className="text-2xl font-bold mt-2">{stats.pendingBookings}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("admin.dashboard.pendingBookings")}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                          <Clock className="h-6 w-6 text-amber-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {t("admin.dashboard.messages")}
                          </p>
                          <h3 className="text-2xl font-bold mt-2">{stats.unreadMessages}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("admin.dashboard.unreadMessages")}
                          </p>
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bell className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Contenuto principale dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Prenotazioni recenti */}
                  <Card className="lg:col-span-1">
                    <CardHeader className="px-6">
                      <CardTitle>{t("admin.dashboard.recentBookings")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : bookings && bookings.length > 0 ? (
                        <div className="overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[120px]">{t("admin.bookings.table.guest")}</TableHead>
                                  <TableHead className="w-[100px]">{t("admin.bookings.table.dates")}</TableHead>
                                  <TableHead className="w-[80px] text-center">{t("admin.bookings.table.status")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bookings.slice(0, 5).map((booking) => (
                                  <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.guestName}</TableCell>
                                    <TableCell className="text-xs">
                                      <div className="flex flex-col">
                                        <span>{booking.startDate ? format(new Date(booking.startDate), "dd MMM", { locale: language === "it" ? it : enUS }) : "-"}</span>
                                        <span className="text-muted-foreground">
                                          {booking.endDate ? format(new Date(booking.endDate), "dd MMM", { locale: language === "it" ? it : enUS }) : "-"}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex justify-center">
                                        {booking.status === "confirmed" ? (
                                          <Badge className="bg-green-500 hover:bg-green-600">
                                            {t("admin.bookings.status.confirmed")}
                                          </Badge>
                                        ) : booking.status === "pending" ? (
                                          <Badge className="bg-amber-500 hover:bg-amber-600">
                                            {t("admin.bookings.status.pending")}
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-red-500 hover:bg-red-600">
                                            {t("admin.bookings.status.cancelled")}
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          <div className="px-6 py-4 border-t border-border">
                            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
                              {language === 'it' ? 'Vedi tutte le prenotazioni' : 'View all bookings'}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">{t("admin.bookings.noBookings")}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Statistiche occupazione */}
                  <Card className="lg:col-span-1">
                    <CardHeader className="px-6">
                      <CardTitle>{language === 'it' ? 'Statistiche occupazione' : 'Occupancy Statistics'}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6">
                      <div className="space-y-8">
                        {/* Tasso di occupazione */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">
                              {language === 'it' ? 'Tasso di occupazione' : 'Occupancy rate'}
                            </p>
                            <span className="text-sm font-medium">{calculateOccupancyRate()}%</span>
                          </div>
                          <Progress value={calculateOccupancyRate()} className="h-2" />
                          <p className="mt-2 text-xs text-muted-foreground">
                            {language === 'it' 
                              ? `${calculateOccupancyRate()}% di occupazione questo mese` 
                              : `${calculateOccupancyRate()}% occupancy this month`}
                          </p>
                        </div>
                        
                        {/* Messaggi non letti */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium">{language === 'it' ? 'Gestione messaggi' : 'Message management'}</p>
                            <Badge className={stats.unreadMessages > 0 ? "bg-red-500" : "bg-green-500"}>
                              {stats.unreadMessages > 0 
                                ? (language === 'it' ? 'Richiede attenzione' : 'Needs attention') 
                                : (language === 'it' ? 'Tutti letti' : 'All read')}
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setActiveTab("messages")}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {language === 'it' ? 'Gestisci messaggi' : 'Manage messages'}
                            {stats.unreadMessages > 0 && (
                              <Badge className="ml-auto bg-primary">{stats.unreadMessages}</Badge>
                            )}
                          </Button>
                        </div>
                        
                        {/* Prenotazioni in attesa */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium">
                              {language === 'it' ? 'Prenotazioni in attesa' : 'Pending bookings'}
                            </p>
                            <Badge className={stats.pendingBookings > 0 ? "bg-amber-500" : "bg-green-500"}>
                              {stats.pendingBookings}
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setActiveTab("bookings")}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            {language === 'it' ? 'Gestisci prenotazioni' : 'Manage bookings'}
                            {stats.pendingBookings > 0 && (
                              <Badge className="ml-auto bg-amber-500">{stats.pendingBookings}</Badge>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Tab Utenti */}
            {activeTab === "users" && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">{t("admin.users.title")}</h1>
                    <p className="text-muted-foreground">{t("admin.users.description")}</p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder={language === 'it' ? 'Cerca utenti...' : 'Search users...'} 
                        className="pl-9 w-[250px]" 
                      />
                    </div>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    {usersLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : users && users.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">{t("admin.users.table.id")}</TableHead>
                              <TableHead>{t("admin.users.table.name")}</TableHead>
                              <TableHead>{t("admin.users.table.email")}</TableHead>
                              <TableHead>{t("admin.users.table.username")}</TableHead>
                              <TableHead>{t("admin.users.table.role")}</TableHead>
                              <TableHead>{t("admin.users.table.created")}</TableHead>
                              <TableHead className="text-right">{language === 'it' ? 'Azioni' : 'Actions'}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {user.username?.charAt(0).toUpperCase() || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{user.fullName || "-"}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>
                                  {user.isAdmin ? (
                                    <Badge className="bg-primary">{t("admin.users.roles.admin")}</Badge>
                                  ) : (
                                    <Badge variant="outline">{t("admin.users.roles.user")}</Badge>
                                  )}
                                </TableCell>
                                <TableCell>{user.createdAt ? formatDate(user.createdAt) : "-"}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      // Apri la chat con questo utente
                                      setSelectedUser(user.id);
                                      setActiveTab("chat");
                                    }}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">{t("admin.users.noUsers")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Tab Prenotazioni */}
            {activeTab === "bookings" && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">{t("admin.bookings.title")}</h1>
                    <p className="text-muted-foreground">{t("admin.bookings.description")}</p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline" size="sm">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {language === 'it' ? 'Filtra per data' : 'Filter by date'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {language === 'it' ? 'Stato' : 'Status'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>{t("admin.bookings.status.confirmed")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("admin.bookings.status.pending")}</DropdownMenuItem>
                        <DropdownMenuItem>{t("admin.bookings.status.cancelled")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    {bookingsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : bookings && bookings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">{t("admin.bookings.table.id")}</TableHead>
                              <TableHead>{t("admin.bookings.table.guest")}</TableHead>
                              <TableHead>{t("admin.bookings.table.dates")}</TableHead>
                              <TableHead>{t("admin.bookings.table.guests")}</TableHead>
                              <TableHead>{t("admin.bookings.table.status")}</TableHead>
                              <TableHead className="text-right">{t("admin.bookings.table.actions")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bookings.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell>{booking.id}</TableCell>
                                <TableCell className="font-medium">{booking.guestName}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <div className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                      <span className="text-xs">{booking.startDate ? formatDate(booking.startDate) : "-"}</span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                      <span className="text-xs">{booking.endDate ? formatDate(booking.endDate) : "-"}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <span>{booking.guestCount}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {booking.status === "confirmed" ? (
                                    <div className="flex items-center">
                                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                                      <span>{t("admin.bookings.status.confirmed")}</span>
                                    </div>
                                  ) : booking.status === "pending" ? (
                                    <div className="flex items-center">
                                      <div className="h-2 w-2 rounded-full bg-amber-500 mr-2" />
                                      <span>{t("admin.bookings.status.pending")}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                                      <span>{t("admin.bookings.status.cancelled")}</span>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>{t("admin.bookings.actions")}</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handleViewBookingDetails(booking)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        {t("admin.bookings.viewDetails")}
                                      </DropdownMenuItem>
                                      {booking.status === "pending" && (
                                        <DropdownMenuItem onClick={() => handleConfirmBooking(booking.id)}>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          {t("admin.bookings.confirm")}
                                        </DropdownMenuItem>
                                      )}
                                      {booking.status !== "cancelled" && (
                                        <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                                          <XCircle className="h-4 w-4 mr-2" />
                                          {t("admin.bookings.cancel")}
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteBooking(booking.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        {t("admin.bookings.delete") || "Elimina"}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">{t("admin.bookings.noBookings")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Tab Richieste di contatto */}
            {activeTab === "messages" && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">{t("admin.messages.formTitle") || "Richieste di contatto"}</h1>
                    <p className="text-muted-foreground">{t("admin.messages.formDescription") || "Gestisci le richieste degli utenti inviate tramite il modulo di contatto"}</p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline" size="sm">
                      {language === 'it' ? 'Segna tutti come letti' : 'Mark all as read'}
                    </Button>
                  </div>
                </div>
                
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card 
                        key={message.id} 
                        className={message.read ? "" : "border-l-4 border-l-primary"}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {message.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{message.name}</CardTitle>
                                <CardDescription>{message.email} • {message.createdAt ? formatDate(message.createdAt) : "-"}</CardDescription>
                              </div>
                            </div>
                            <div>
                              {message.read ? (
                                <Badge variant="outline" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  {t("admin.messages.read")}
                                </Badge>
                              ) : (
                                <Badge className="text-xs bg-primary">
                                  {t("admin.messages.unread")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted/50 rounded-md p-4 mt-2">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end pt-0 pb-4">
                          {!message.read && (
                            <Button
                              size="sm"
                              onClick={() => markMessageAsRead(message.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {t("admin.messages.markAsRead")}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2"
                            onClick={() => {
                              // Cerca l'utente corrispondente all'email
                              const userWithEmail = users?.find(u => u.email === message.email);
                              if (userWithEmail) {
                                setSelectedUser(userWithEmail.id);
                                setActiveTab("chat");
                              } else {
                                toast({
                                  title: "Info",
                                  description: language === 'it' 
                                    ? "L'utente non ha un account. Non è possibile avviare una chat." 
                                    : "The user doesn't have an account. Cannot start a chat.",
                                });
                              }
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {language === 'it' ? 'Rispondi' : 'Reply'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">{t("admin.messages.noMessages")}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {/* Tab SendGrid */}
            {activeTab === "sendgrid" && (
              <div>
                <SendGridManager />
              </div>
            )}

            {/* Tab Chat con utenti */}
            {activeTab === "chat" && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">{t("admin.chat.title") || "Chat con gli utenti"}</h1>
                    <p className="text-muted-foreground">{t("admin.chat.chatDescription") || "Conversazioni in tempo reale con gli utenti della piattaforma"}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-250px)] min-h-[600px]">
                  {/* Lista degli utenti con chat */}
                  <Card className="md:w-1/3">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-base">{t("admin.chat.users") || "Utenti"}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[calc(100vh-350px)] min-h-[500px] overflow-y-auto">
                        {usersLoading ? (
                          <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : users && users.length > 0 ? (
                          <div className="divide-y">
                            {users.filter(u => !u.isAdmin).map((u) => (
                              <div
                                key={u.id}
                                className={`p-4 flex items-center hover:bg-muted/50 cursor-pointer transition-colors ${
                                  selectedUser === u.id ? "bg-muted" : ""
                                }`}
                                onClick={() => setSelectedUser(u.id)}
                              >
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarFallback className={`${
                                    selectedUser === u.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                  }`}>
                                    {u.username?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{u.fullName || u.username}</p>
                                  <p className="text-xs text-muted-foreground">{u.email}</p>
                                </div>
                                {selectedUser === u.id && (
                                  <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-full text-muted-foreground">
                            <p>{t("admin.chat.noUsers") || "Nessun utente trovato"}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Area dei messaggi */}
                  <Card className="flex-1 flex flex-col">
                    {!selectedUser ? (
                      <div className="flex-grow flex flex-col justify-center items-center p-6">
                        <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-center">
                          {t("admin.chat.selectUser") || "Seleziona un utente per visualizzare la chat"}
                        </p>
                      </div>
                    ) : (
                      <>
                        <CardHeader className="py-3 px-4 border-b flex-shrink-0">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback className="bg-primary text-white">
                                {users?.find(u => u.id === selectedUser)?.username?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {users?.find(u => u.id === selectedUser)?.fullName || 
                                 users?.find(u => u.id === selectedUser)?.username || 
                                 `${language === 'it' ? 'Utente' : 'User'} #${selectedUser}`}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {users?.find(u => u.id === selectedUser)?.email || ""}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <div className="flex-grow overflow-y-auto p-6 space-y-6">
                          {chatMessagesLoading ? (
                            <div className="flex justify-center items-center h-full">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : chatMessages && chatMessages.length > 0 ? (
                            chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  msg.isFromAdmin ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div className={`flex gap-3 max-w-[80%] ${
                                  msg.isFromAdmin ? "flex-row-reverse" : "flex-row"
                                }`}>
                                  <Avatar className={`h-8 w-8 ${
                                    msg.isFromAdmin ? "bg-primary text-primary-foreground" : "bg-muted"
                                  }`}>
                                    <AvatarFallback>
                                      {msg.isFromAdmin 
                                        ? "A" 
                                        : users?.find(u => u.id === selectedUser)?.username?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={`rounded-2xl px-4 py-2 ${
                                      msg.isFromAdmin
                                        ? "bg-primary text-white"
                                        : "bg-muted/70 text-foreground"
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                    <p className={`text-xs mt-1 ${
                                      msg.isFromAdmin ? "text-primary-foreground/70" : "text-muted-foreground"
                                    }`}>
                                      {msg.createdAt ? format(new Date(msg.createdAt), "p", { locale: language === "it" ? it : enUS }) : "-"}
                                    </p>
                                  </div>
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
                        
                        <div className="p-4 border-t mt-auto">
                          <form onSubmit={handleSendAdminMessage} className="flex gap-2">
                            <Input
                              value={newAdminMessage}
                              onChange={(e) => setNewAdminMessage(e.target.value)}
                              placeholder={t("admin.chat.messagePlaceholder") || "Scrivi un messaggio..."}
                              disabled={sendAdminMessage.isPending}
                              className="flex-1"
                            />
                            <Button 
                              type="submit" 
                              disabled={sendAdminMessage.isPending || !newAdminMessage.trim()}
                              className="bg-primary hover:bg-primary/90"
                            >
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
                  </Card>
                </div>
              </div>
            )}

            {/* Tab Blog */}
            {activeTab === "blog" && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">Gestione Blog</h1>
                    <p className="text-muted-foreground">Crea e gestisci articoli per il blog della villa</p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="default" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuovo Articolo
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Articoli del Blog</CardTitle>
                    <CardDescription>
                      Gestisci tutti gli articoli pubblicati sul blog
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Nessun articolo trovato</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Inizia creando il tuo primo articolo per il blog
                      </p>
                      <Button className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Crea il primo articolo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab FAQ */}
            {activeTab === "faq" && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">Gestione FAQ</h1>
                    <p className="text-muted-foreground">Crea e gestisci le domande frequenti</p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="default" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuova FAQ
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Domande Frequenti</CardTitle>
                    <CardDescription>
                      Gestisci tutte le FAQ per aiutare gli ospiti
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Nessuna FAQ trovata</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Inizia creando la tua prima domanda frequente
                      </p>
                      <Button className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Crea la prima FAQ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab SendGrid (Email e SMS) */}
            {activeTab === "sendgrid" && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold">Email e SMS</h1>
                    <p className="text-muted-foreground">Gestisci comunicazioni via email e SMS</p>
                  </div>
                </div>
                <SendGridManager />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modale per i dettagli della prenotazione */}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("admin.bookings.detailsTitle") || "Dettagli Prenotazione"}
            </DialogTitle>
            <DialogDescription>
              {t("admin.bookings.detailsDescription") || "Informazioni complete sulla prenotazione selezionata"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Informazioni ospite */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {t("admin.bookings.guestInfo") || "Informazioni Ospite"}
                  </h4>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedBooking.guestName}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {selectedBooking.guestCount} {t("admin.bookings.guests") || "ospiti"}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {t("admin.bookings.status") || "Status"}
                  </h4>
                  <Badge className={
                    selectedBooking.status === "confirmed" ? "bg-green-500" :
                    selectedBooking.status === "pending" ? "bg-amber-500" : "bg-red-500"
                  }>
                    {selectedBooking.status === "confirmed" ? (t("admin.bookings.status.confirmed") || "Confermata") :
                     selectedBooking.status === "pending" ? (t("admin.bookings.status.pending") || "In attesa") :
                     (t("admin.bookings.status.cancelled") || "Cancellata")}
                  </Badge>
                </div>
              </div>

              {/* Date */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  {t("admin.bookings.dates") || "Date"}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Check-in</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedBooking.startDate ? formatDate(selectedBooking.startDate) : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Check-out</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedBooking.endDate ? formatDate(selectedBooking.endDate) : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              {selectedBooking.notes && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {t("admin.bookings.notes") || "Note"}
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Data creazione */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  {t("admin.bookings.createdAt") || "Data Richiesta"}
                </h4>
                <p className="text-sm">
                  {selectedBooking.createdAt ? formatDate(selectedBooking.createdAt) : "-"}
                </p>
              </div>

              {/* Azioni rapide */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedBooking.status === "pending" && (
                  <Button 
                    onClick={() => {
                      handleConfirmBooking(selectedBooking.id);
                      setShowBookingDetails(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("admin.bookings.confirm") || "Conferma"}
                  </Button>
                )}
                {selectedBooking.status !== "cancelled" && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleCancelBooking(selectedBooking.id);
                      setShowBookingDetails(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t("admin.bookings.cancel") || "Cancella"}
                  </Button>
                )}
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleDeleteBooking(selectedBooking.id);
                    setShowBookingDetails(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("admin.bookings.delete") || "Elimina"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component necessario per l'icona di ricerca
const Search = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={className}
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
};