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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Modern Glass-Effect Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
                  <Building className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Villa Ingrosso</h1>
                  <p className="text-blue-200 text-sm">Executive Management Suite</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6 pl-8 border-l border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-sm text-blue-200 font-medium">Sistema Attivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-300" />
                  <span className="text-sm text-blue-200">
                    {new Date().toLocaleDateString('it-IT', { 
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-lg font-semibold text-white">{user.fullName || user.username}</div>
                <div className="flex items-center gap-2 text-sm text-blue-200">
                  <Shield className="h-4 w-4" />
                  Executive Administrator
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">
                  {(user.fullName || user.username).charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-98px)]">
        {/* Modern Glass Sidebar */}
        <div className="w-72 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Control Center</h2>
            <p className="text-blue-200 text-sm">Gestione avanzata villa</p>
          </div>
          <nav className="flex-1 p-6 space-y-2">
            <button
              onClick={() => setSelectedTab("dashboard")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedTab === "dashboard" 
                  ? "bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-white border border-amber-400/30 shadow-lg" 
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Analytics Dashboard
            </button>
            <button
              onClick={() => setSelectedTab("bookings")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedTab === "bookings" 
                  ? "bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-white border border-amber-400/30 shadow-lg" 
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Calendar className="h-5 w-5" />
              Reservation Manager
            </button>
            <button
              onClick={() => setSelectedTab("users")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedTab === "users" 
                  ? "bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-white border border-amber-400/30 shadow-lg" 
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className="h-5 w-5" />
              Guest Relations
            </button>
            <button
              onClick={() => setSelectedTab("messages")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedTab === "messages" 
                  ? "bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-white border border-amber-400/30 shadow-lg" 
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              Communications Hub
              {messages.filter((m: any) => !m.read).length > 0 && (
                <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                  {messages.filter((m: any) => !m.read).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab("content")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedTab === "content" 
                  ? "bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-white border border-amber-400/30 shadow-lg" 
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              Content Studio
            </button>
            <button
              onClick={() => setSelectedTab("inventory")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedTab === "inventory" 
                  ? "bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-white border border-amber-400/30 shadow-lg" 
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Package className="h-5 w-5" />
              Inventory Control
              {inventory.filter((item: any) => item.quantity <= item.minStock).length > 0 && (
                <span className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                  {inventory.filter((item: any) => item.quantity <= item.minStock).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab("email")}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedTab === "email" 
                  ? "bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-white border border-amber-400/30 shadow-lg" 
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Mail className="h-5 w-5" />
              Email Command Center
            </button>
          </nav>
          <div className="p-6 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-blue-200">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">System Status</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-blue-300">
                  <span>Version</span>
                  <span className="font-semibold">v3.0 Executive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300">Database Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-300">APIs Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-900/20 via-blue-900/10 to-purple-900/20 backdrop-blur-sm">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="p-8 space-y-8">
              {/* Executive Dashboard Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Executive Analytics</h2>
                    <p className="text-blue-200 text-lg">Real-time villa performance insights</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-200 text-sm font-medium">Live Data Stream</span>
                    <RefreshCw className="h-4 w-4 text-blue-300" />
                  </div>
                </div>
              </div>

              {/* Premium KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-200 font-medium">Prenotazioni</div>
                      <div className="text-2xl font-bold text-white">{stats?.totalBookings || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {stats?.bookingGrowth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`font-semibold ${stats?.bookingGrowth > 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {stats?.bookingGrowth > 0 ? '+' : ''}{stats?.bookingGrowth || 0}%
                    </span>
                    <span className="text-blue-200">vs ultimo mese</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-200 font-medium">Ricavi</div>
                      <div className="text-2xl font-bold text-white">€{stats?.totalRevenue || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {stats?.revenueGrowth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`font-semibold ${stats?.revenueGrowth > 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {stats?.revenueGrowth > 0 ? '+' : ''}{stats?.revenueGrowth || 0}%
                    </span>
                    <span className="text-blue-200">crescita</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-200 font-medium">Messaggi</div>
                      <div className="text-2xl font-bold text-white">{stats?.newMessages || 0}</div>
                    </div>
                  </div>
                  <div className="text-sm text-orange-200">
                    Da processare oggi
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-200 font-medium">Occupazione</div>
                      <div className="text-2xl font-bold text-white">{stats?.occupancyRate || 0}%</div>
                    </div>
                  </div>
                  <div className="text-sm text-purple-200">
                    Tasso annuale
                  </div>
                </div>
              </div>

              {/* Executive Action Center */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Quick Actions</h3>
                    <p className="text-blue-200">Executive command center</p>
                  </div>
                  <div className="space-y-4">
                    <button 
                      onClick={() => handleCreateAction('booking')} 
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 rounded-xl border border-amber-400/30 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Nuova Prenotazione</div>
                        <div className="text-sm text-blue-200">Crea booking diretto</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleCreateAction('user')} 
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-xl border border-blue-400/30 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Registra Ospite</div>
                        <div className="text-sm text-blue-200">Nuovo cliente VIP</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleCreateAction('email')} 
                      className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-xl border border-green-400/30 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Email Broadcast</div>
                        <div className="text-sm text-blue-200">Comunicazione diretta</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Recent Bookings</h3>
                    <p className="text-blue-200">Live reservation stream</p>
                  </div>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {bookings?.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{booking.guestName}</div>
                            <div className="text-sm text-blue-200 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(booking.checkIn).toLocaleDateString('it-IT')} - {new Date(booking.checkOut).toLocaleDateString('it-IT')}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                            booking.status === 'pending' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 
                            'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confermata' :
                             booking.status === 'pending' ? 'In Attesa' :
                             'Cancellata'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Reservation Manager</h2>
                  <p className="text-blue-200 text-lg">Advanced booking control system</p>
                </div>
                <button 
                  onClick={() => handleCreateAction('booking')} 
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  New Reservation
                </button>
              </div>

              <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="text-left p-4 font-semibold text-white">Guest</th>
                        <th className="text-left p-4 font-semibold text-white">Contact</th>
                        <th className="text-left p-4 font-semibold text-white">Check-in</th>
                        <th className="text-left p-4 font-semibold text-white">Check-out</th>
                        <th className="text-left p-4 font-semibold text-white">Guests</th>
                        <th className="text-left p-4 font-semibold text-white">Amount</th>
                        <th className="text-left p-4 font-semibold text-white">Status</th>
                        <th className="text-left p-4 font-semibold text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings?.map((booking: any) => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-medium text-white">{booking.guestName}</td>
                          <td className="p-4 text-blue-200 text-sm">{booking.guestEmail}</td>
                          <td className="p-4 text-blue-200">{new Date(booking.checkIn).toLocaleDateString('it-IT')}</td>
                          <td className="p-4 text-blue-200">{new Date(booking.checkOut).toLocaleDateString('it-IT')}</td>
                          <td className="p-4 text-blue-200">{booking.numberOfGuests}</td>
                          <td className="p-4 font-semibold text-white">€{booking.totalPrice}</td>
                          <td className="p-4">
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                              booking.status === 'pending' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 
                              'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {booking.status === 'confirmed' ? 'Confermata' :
                               booking.status === 'pending' ? 'In Attesa' :
                               'Cancellata'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => updateBookingStatusMutation.mutate({ 
                                  bookingId: booking.id, 
                                  status: booking.status === 'confirmed' ? 'pending' : 'confirmed' 
                                })}
                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 text-blue-300 hover:text-white transition-colors"
                              >
                                {booking.status === 'confirmed' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                              <button 
                                onClick={() => deleteBookingMutation.mutate(booking.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30 text-red-300 hover:text-white transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Guest Relations Tab */}
            <TabsContent value="users" className="p-8">
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12 max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl shadow-lg w-fit mx-auto mb-6">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Guest Relations</h3>
                  <p className="text-blue-200">Advanced guest management system</p>
                </div>
              </div>
            </TabsContent>

            {/* Communications Hub Tab */}
            <TabsContent value="messages" className="p-8">
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12 max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg w-fit mx-auto mb-6">
                    <MessageSquare className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Communications Hub</h3>
                  <p className="text-blue-200">Real-time message management</p>
                </div>
              </div>
            </TabsContent>

            {/* Content Studio Tab */}
            <TabsContent value="content" className="p-8">
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12 max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg w-fit mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Content Studio</h3>
                  <p className="text-blue-200">Dynamic content management</p>
                </div>
              </div>
            </TabsContent>

            {/* Inventory Control Tab */}
            <TabsContent value="inventory" className="p-8">
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12 max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl shadow-lg w-fit mx-auto mb-6">
                    <Package className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Inventory Control</h3>
                  <p className="text-blue-200">Smart inventory tracking</p>
                </div>
              </div>
            </TabsContent>

            {/* Email Command Center Tab */}
            <TabsContent value="email" className="p-8">
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12 max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg w-fit mx-auto mb-6">
                    <Mail className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Email Command Center</h3>
                  <p className="text-blue-200">Executive communication suite</p>
                </div>
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