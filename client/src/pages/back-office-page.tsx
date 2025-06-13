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
  RefreshCw
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

const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  published: z.boolean().default(false)
});

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1),
  published: z.boolean().default(true)
});

const inventorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().min(0),
  minStock: z.number().min(0).default(5),
  category: z.string().min(1),
  location: z.string().optional()
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

  const blogForm = useForm<z.infer<typeof blogSchema>>({
    resolver: zodResolver(blogSchema),
    defaultValues: { title: "", slug: "", content: "", excerpt: "", published: false }
  });

  const faqForm = useForm<z.infer<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: "", answer: "", category: "", published: true }
  });

  const inventoryForm = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { name: "", description: "", quantity: 0, minStock: 5, category: "", location: "" }
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

  const createBlogMutation = useMutation({
    mutationFn: async (data: z.infer<typeof blogSchema>) => {
      const res = await apiRequest("POST", "/api/blog", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog post creato con successo" });
      setIsDialogOpen(false);
      blogForm.reset();
    }
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: z.infer<typeof faqSchema>) => {
      const res = await apiRequest("POST", "/api/faqs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "FAQ creata con successo" });
      setIsDialogOpen(false);
      faqForm.reset();
    }
  });

  const createInventoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inventorySchema>) => {
      const res = await apiRequest("POST", "/api/inventory", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Articolo inventario creato con successo" });
      setIsDialogOpen(false);
      inventoryForm.reset();
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

  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId: number) => {
      const res = await apiRequest("DELETE", `/api/blog/${blogId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Blog post eliminato" });
    }
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (faqId: number) => {
      const res = await apiRequest("DELETE", `/api/faqs/${faqId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "FAQ eliminata" });
    }
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: async (inventoryId: number) => {
      const res = await apiRequest("DELETE", `/api/inventory/${inventoryId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Articolo inventario eliminato" });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Back-Office</h1>
                <p className="text-slate-200">Gestione amministrativa Villa Ingrosso</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-300">Benvenuto,</p>
              <p className="text-lg font-semibold">{user.fullName || user.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Prenotazioni
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utenti
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messaggi
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Contenuti
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prenotazioni Totali</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.bookingGrowth > 0 ? '+' : ''}{stats?.bookingGrowth || 0}% dal mese scorso
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ricavi</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{stats?.totalRevenue || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.revenueGrowth > 0 ? '+' : ''}{stats?.revenueGrowth || 0}% dal mese scorso
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nuovi Messaggi</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.newMessages || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Messaggi da leggere
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasso Occupazione</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.occupancyRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Ultimi 12 mesi
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Azioni Rapide</CardTitle>
                  <CardDescription>Gestione veloce delle operazioni comuni</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => handleCreateAction('booking')} className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova Prenotazione
                  </Button>
                  <Button onClick={() => handleCreateAction('user')} variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Utente
                  </Button>
                  <Button onClick={() => handleCreateAction('email')} variant="outline" className="w-full justify-start">
                    <Send className="h-4 w-4 mr-2" />
                    Invia Email
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prenotazioni Recenti</CardTitle>
                  <CardDescription>Ultime prenotazioni effettuate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings?.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestione Prenotazioni</h2>
                <Button onClick={() => handleCreateAction('booking')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Prenotazione
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ospite</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Ospiti</TableHead>
                        <TableHead>Prezzo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.map((booking: any) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.guestName}</TableCell>
                          <TableCell>{booking.guestEmail}</TableCell>
                          <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                          <TableCell>{booking.numberOfGuests}</TableCell>
                          <TableCell>€{booking.totalPrice}</TableCell>
                          <TableCell>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}>
                              {booking.status}
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
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestione Utenti</h2>
                <Button onClick={() => handleCreateAction('user')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Utente
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nome Completo</TableHead>
                        <TableHead>Ruolo</TableHead>
                        <TableHead>Registrato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.fullName || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                              {user.isAdmin ? 'Admin' : 'Utente'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Messaggi di Contatto</h2>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Messaggio</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages?.map((message: any) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.name}</TableCell>
                          <TableCell>{message.email}</TableCell>
                          <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                          <TableCell>{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={message.read ? 'default' : 'secondary'}>
                              {message.read ? 'Letto' : 'Nuovo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!message.read && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markMessageReadMutation.mutate(message.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Gestione Contenuti</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Blog Posts */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Blog Posts</CardTitle>
                      <Button onClick={() => handleCreateAction('blog')} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuovo Post
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {blogs?.slice(0, 5).map((blog: any) => (
                        <div key={blog.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{blog.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant={blog.published ? 'default' : 'secondary'}>
                              {blog.published ? 'Pubblicato' : 'Bozza'}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteBlogMutation.mutate(blog.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* FAQs */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>FAQ</CardTitle>
                      <Button onClick={() => handleCreateAction('faq')} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuova FAQ
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {faqs?.slice(0, 5).map((faq: any) => (
                        <div key={faq.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{faq.question}</p>
                            <p className="text-sm text-muted-foreground">{faq.category}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant={faq.published ? 'default' : 'secondary'}>
                              {faq.published ? 'Pubblicata' : 'Bozza'}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteFaqMutation.mutate(faq.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestione Inventario</h2>
                <Button onClick={() => handleCreateAction('inventory')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Articolo
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Quantità</TableHead>
                        <TableHead>Stock Minimo</TableHead>
                        <TableHead>Ubicazione</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.minStock}</TableCell>
                          <TableCell>{item.location || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={item.quantity <= item.minStock ? 'destructive' : 'default'}>
                              {item.quantity <= item.minStock ? 'Stock Basso' : 'OK'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteInventoryMutation.mutate(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Sistema Email</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Invia Email Personalizzata</CardTitle>
                  <CardDescription>
                    Invia email utilizzando il sistema Bird API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleCreateAction('email')}>
                    <Send className="h-4 w-4 mr-2" />
                    Componi Email
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dialog for Create Actions */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedAction === 'user' && 'Crea Nuovo Utente'}
                  {selectedAction === 'booking' && 'Crea Nuova Prenotazione'}
                  {selectedAction === 'email' && 'Invia Email Personalizzata'}
                  {selectedAction === 'blog' && 'Crea Nuovo Blog Post'}
                  {selectedAction === 'faq' && 'Crea Nuova FAQ'}
                  {selectedAction === 'inventory' && 'Aggiungi Articolo Inventario'}
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
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annulla
                      </Button>
                      <Button type="submit" disabled={createUserMutation.isPending}>
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
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annulla
                      </Button>
                      <Button type="submit" disabled={sendEmailMutation.isPending}>
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
  );
}

export default BackOfficePage;