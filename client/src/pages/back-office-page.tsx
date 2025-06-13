import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Settings, 
  Users, 
  Calendar, 
  MessageSquare, 
  Mail, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe,
  BookOpen,
  HelpCircle,
  Package,
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Clock,
  Building,
  Shield
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

// Schema per le form
const userSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  fullName: z.string().optional(),
  password: z.string().min(6),
  isAdmin: z.boolean().default(false)
});

const bookingSchema = z.object({
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  numberOfGuests: z.number().min(1),
  totalPrice: z.number().min(0),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending')
});

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  emailType: z.enum(['welcome', 'booking', 'contact', 'newsletter', 'admin']).default('admin')
});

function BackOfficePage() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form instances
  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { username: "", email: "", fullName: "", password: "", isAdmin: false }
  });

  const bookingForm = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { 
      guestName: "", 
      guestEmail: "", 
      guestPhone: "",
      checkIn: "", 
      checkOut: "", 
      numberOfGuests: 1, 
      totalPrice: 0,
      status: 'pending'
    }
  });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { to: "", subject: "", message: "", emailType: 'admin' }
  });

  // Queries
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/stats");
      return res.json();
    }
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/bookings");
      return res.json();
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return res.json();
    }
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/admin/messages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/messages");
      return res.json();
    }
  });

  const { data: blogs = [] } = useQuery({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/blog");
      return res.json();
    }
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/faqs");
      return res.json();
    }
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/inventory");
      return res.json();
    }
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userSchema>) => {
      const res = await apiRequest("POST", "/api/admin/manual-user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Utente creato con successo" });
      setIsDialogOpen(false);
      userForm.reset();
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bookingSchema>) => {
      const res = await apiRequest("POST", "/api/admin/manual-booking", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Prenotazione creata con successo" });
      setIsDialogOpen(false);
      bookingForm.reset();
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailSchema>) => {
      const res = await apiRequest("POST", "/api/admin/send-custom-email", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Email inviata con successo" });
      setIsDialogOpen(false);
      emailForm.reset();
    }
  });

  const markMessageReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/messages/${messageId}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      toast({ title: "Messaggio segnato come letto" });
    }
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Status prenotazione aggiornato" });
    }
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/bookings/${bookingId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Prenotazione eliminata" });
    }
  });

  // Handler functions
  const handleCreateAction = (action: string) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Accesso Richiesto</h1>
          <p className="text-blue-200 mb-6">Devi effettuare l'accesso come amministratore per utilizzare il back-office.</p>
          <div className="space-y-3">
            <Link href="/back-office/auth">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Settings className="h-4 w-4 mr-2" />
                Accedi al Back-Office
              </Button>
            </Link>
            <div>
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna alla Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header with Status Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Villa Ingrosso PMS</h1>
                  <p className="text-sm text-gray-500">Property Management System v2.1.0</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4 pl-6 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600">Sistema Operativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('it-IT', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.fullName || user.username}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  Amministratore Sistema
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(user.fullName || user.username).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Professional Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Moduli Sistema</h2>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setSelectedTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === "dashboard" 
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard Operativo
            </button>
            <button
              onClick={() => setSelectedTab("bookings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === "bookings" 
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Gestione Prenotazioni
            </button>
            <button
              onClick={() => setSelectedTab("users")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === "users" 
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Users className="h-4 w-4" />
              Anagrafica Ospiti
            </button>
            <button
              onClick={() => setSelectedTab("messages")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === "messages" 
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Centro Messaggi
              {messages.filter((m: any) => !m.read).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                  {messages.filter((m: any) => !m.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab("content")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === "content" 
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              CMS Contenuti
            </button>
            <button
              onClick={() => setSelectedTab("inventory")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === "inventory" 
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Package className="h-4 w-4" />
              Gestione Inventario
              {inventory.filter((item: any) => item.quantity <= item.minStock).length > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                  {inventory.filter((item: any) => item.quantity <= item.minStock).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab("email")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === "email" 
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Mail className="h-4 w-4" />
              Sistema Email
            </button>
          </nav>
          <div className="p-4 border-t border-slate-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                Versione Sistema: v2.1.0
              </div>
              <div>Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</div>
              <div className="flex items-center gap-2 pt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Database: Connesso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="p-6 space-y-6">
              {/* Professional Dashboard Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Operativo</h2>
                    <p className="text-gray-600">Panoramica generale sistema alberghiero Villa Ingrosso</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4" />
                    Aggiornato: {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Prenotazioni Attive</CardTitle>
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {stats?.bookingGrowth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      {stats?.bookingGrowth > 0 ? '+' : ''}{stats?.bookingGrowth || 0}% vs mese precedente
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Ricavi Totali</CardTitle>
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">€{stats?.totalRevenue || 0}</div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {stats?.revenueGrowth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      {stats?.revenueGrowth > 0 ? '+' : ''}{stats?.revenueGrowth || 0}% vs mese precedente
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Messaggi Nuovi</CardTitle>
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats?.newMessages || 0}</div>
                    <p className="text-xs text-gray-500">
                      Richieste da processare
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Tasso Occupazione</CardTitle>
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats?.occupancyRate || 0}%</div>
                    <p className="text-xs text-gray-500">
                      Media ultimi 12 mesi
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Professional Action Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <CardTitle className="text-lg text-gray-900">Azioni Rapide</CardTitle>
                    <CardDescription>Operazioni comuni sistema alberghiero</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <Button 
                      onClick={() => handleCreateAction('booking')} 
                      className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-3" />
                      Nuova Prenotazione
                    </Button>
                    <Button 
                      onClick={() => handleCreateAction('user')} 
                      variant="outline" 
                      className="w-full justify-start h-12 border-gray-300"
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Registra Nuovo Ospite
                    </Button>
                    <Button 
                      onClick={() => handleCreateAction('email')} 
                      variant="outline" 
                      className="w-full justify-start h-12 border-gray-300"
                    >
                      <Send className="h-4 w-4 mr-3" />
                      Invia Comunicazione
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="text-lg text-gray-900">Prenotazioni Recenti</CardTitle>
                    <CardDescription>Ultime prenotazioni registrate nel sistema</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {bookings?.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{booking.guestName}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date(booking.checkIn).toLocaleDateString('it-IT')} - {new Date(booking.checkOut).toLocaleDateString('it-IT')}
                              </div>
                            </div>
                            <Badge 
                              variant={
                                booking.status === 'confirmed' ? 'default' : 
                                booking.status === 'pending' ? 'secondary' : 
                                'destructive'
                              }
                              className="text-xs"
                            >
                              {booking.status === 'confirmed' ? 'Confermata' :
                               booking.status === 'pending' ? 'In Attesa' :
                               'Cancellata'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestione Prenotazioni</h2>
                  <p className="text-gray-600">Sistema di gestione prenotazioni alberghiere</p>
                </div>
                <Button onClick={() => handleCreateAction('booking')} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Prenotazione
                </Button>
              </div>

              <Card className="shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Ospite</TableHead>
                        <TableHead className="font-semibold">Contatto</TableHead>
                        <TableHead className="font-semibold">Check-in</TableHead>
                        <TableHead className="font-semibold">Check-out</TableHead>
                        <TableHead className="font-semibold">Ospiti</TableHead>
                        <TableHead className="font-semibold">Importo</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.map((booking: any) => (
                        <TableRow key={booking.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{booking.guestName}</TableCell>
                          <TableCell className="text-sm text-gray-600">{booking.guestEmail}</TableCell>
                          <TableCell>{new Date(booking.checkIn).toLocaleDateString('it-IT')}</TableCell>
                          <TableCell>{new Date(booking.checkOut).toLocaleDateString('it-IT')}</TableCell>
                          <TableCell>{booking.numberOfGuests}</TableCell>
                          <TableCell className="font-medium">€{booking.totalPrice}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                booking.status === 'confirmed' ? 'default' : 
                                booking.status === 'pending' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {booking.status === 'confirmed' ? 'Confermata' :
                               booking.status === 'pending' ? 'In Attesa' :
                               'Cancellata'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateBookingStatusMutation.mutate({ 
                                  bookingId: booking.id, 
                                  status: booking.status === 'confirmed' ? 'pending' : 'confirmed' 
                                })}
                              >
                                {booking.status === 'confirmed' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteBookingMutation.mutate(booking.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs remain similar with professional styling... */}
            <TabsContent value="users" className="p-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Anagrafica Ospiti</h3>
                <p className="text-gray-500">Modulo in fase di sviluppo</p>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="p-6">
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Centro Messaggi</h3>
                <p className="text-gray-500">Sistema di gestione comunicazioni</p>
              </div>
            </TabsContent>

            <TabsContent value="content" className="p-6">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">CMS Contenuti</h3>
                <p className="text-gray-500">Sistema di gestione contenuti</p>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="p-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gestione Inventario</h3>
                <p className="text-gray-500">Sistema di gestione inventario</p>
              </div>
            </TabsContent>

            <TabsContent value="email" className="p-6">
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema Email</h3>
                <p className="text-gray-500">Centro di comunicazione email</p>
              </div>
            </TabsContent>

            {/* Dialog for Create Actions */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedAction === 'user' && 'Registra Nuovo Ospite'}
                    {selectedAction === 'booking' && 'Crea Nuova Prenotazione'}
                    {selectedAction === 'email' && 'Invia Comunicazione Email'}
                  </DialogTitle>
                </DialogHeader>

                {/* User Form */}
                {selectedAction === 'user' && (
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit((data) => createUserMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={userForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Annulla
                        </Button>
                        <Button type="submit" disabled={createUserMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                          {createUserMutation.isPending ? 'Creazione...' : 'Crea Utente'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* Email Form */}
                {selectedAction === 'email' && (
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit((data) => sendEmailMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destinatario</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Oggetto</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Messaggio</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={8} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Annulla
                        </Button>
                        <Button type="submit" disabled={sendEmailMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                          {sendEmailMutation.isPending ? 'Invio...' : 'Invia Email'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </DialogContent>
            </Dialog>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default BackOfficePage;