import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Clock,
  AlertTriangle,
  TrendingUp,
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
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Schema per le form
const userSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(6)
});

const bookingSchema = z.object({
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(10),
  checkIn: z.string(),
  checkOut: z.string(),
  numberOfGuests: z.number().min(1).max(8),
  specialRequests: z.string().optional()
});

const emailSchema = z.object({
  recipients: z.string().min(1),
  subject: z.string().min(3),
  content: z.string().min(10),
  type: z.enum(['booking', 'welcome', 'newsletter', 'admin'])
});

const blogSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(50),
  excerpt: z.string().min(20),
  category: z.string().min(3),
  tags: z.string(),
  featured: z.boolean().optional()
});

const faqSchema = z.object({
  question: z.string().min(10),
  answer: z.string().min(20),
  category: z.string().min(3),
  tags: z.string()
});

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  totalUsers: number;
  newMessages: number;
  blogPosts: number;
  faqCount: number;
}

function BackOfficePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");

  // Forms
  const userForm = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { username: "", email: "", fullName: "", password: "" }
  });

  const bookingForm = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { 
      guestName: "", 
      guestEmail: "", 
      guestPhone: "", 
      checkIn: "", 
      checkOut: "", 
      numberOfGuests: 1,
      specialRequests: ""
    }
  });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { recipients: "", subject: "", content: "", type: "admin" as const }
  });

  const blogForm = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: { 
      title: "", 
      content: "", 
      excerpt: "", 
      category: "", 
      tags: "",
      featured: false 
    }
  });

  const faqForm = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: { question: "", answer: "", category: "", tags: "" }
  });

  // Queries
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: selectedTab === "users"
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/bookings"],
    enabled: selectedTab === "bookings"
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/messages"],
    enabled: selectedTab === "messages"
  });

  const { data: blogPosts = [] } = useQuery<any[]>({
    queryKey: ["/api/blog"],
    enabled: selectedTab === "content"
  });

  const { data: faqs = [] } = useQuery<any[]>({
    queryKey: ["/api/faqs"],
    enabled: selectedTab === "content"
  });

  const { data: inventory = [] } = useQuery<any[]>({
    queryKey: ["/api/inventory"],
    enabled: selectedTab === "inventory"
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/manual-user", data);
    },
    onSuccess: () => {
      toast({ title: "Utente creato con successo" });
      setIsDialogOpen(false);
      userForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/manual-booking", data);
    },
    onSuccess: () => {
      toast({ title: "Prenotazione creata con successo" });
      setIsDialogOpen(false);
      bookingForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/send-custom-email", data);
    },
    onSuccess: () => {
      toast({ title: "Email inviata con successo" });
      setIsDialogOpen(false);
      emailForm.reset();
    }
  });

  const createBlogMutation = useMutation({
    mutationFn: async (data: any) => {
      const tagsArray = data.tags.split(',').map((tag: string) => tag.trim());
      await apiRequest("POST", "/api/blog", { ...data, tags: tagsArray });
    },
    onSuccess: () => {
      toast({ title: "Blog post creato con successo" });
      setIsDialogOpen(false);
      blogForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    }
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: any) => {
      const tagsArray = data.tags.split(',').map((tag: string) => tag.trim());
      await apiRequest("POST", "/api/faqs", { ...data, tags: tagsArray });
    },
    onSuccess: () => {
      toast({ title: "FAQ creata con successo" });
      setIsDialogOpen(false);
      faqForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    }
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/bookings/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Prenotazione eliminata" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    }
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status aggiornato" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    }
  });

  const markMessageReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/admin/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
    }
  });

  // Handler functions
  const handleCreateUser = (data: z.infer<typeof userSchema>) => {
    createUserMutation.mutate(data);
  };

  const handleCreateBooking = (data: z.infer<typeof bookingSchema>) => {
    createBookingMutation.mutate(data);
  };

  const handleSendEmail = (data: z.infer<typeof emailSchema>) => {
    const recipients = data.recipients.split(',').map(email => email.trim());
    sendEmailMutation.mutate({ ...data, recipients });
  };

  const handleCreateBlog = (data: z.infer<typeof blogSchema>) => {
    createBlogMutation.mutate(data);
  };

  const handleCreateFaq = (data: z.infer<typeof faqSchema>) => {
    createFaqMutation.mutate(data);
  };

  const openDialog = (action: string) => {
    setSelectedAction(action);
    setIsDialogOpen(true);
  };

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accesso Negato</h1>
          <p className="text-gray-600 mb-6">Solo gli amministratori possono accedere al back-office.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-gray-800 text-white py-12 pt-24">
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
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prenotazioni Totali</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.activeBookings || 0} attive
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupazione</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.occupancyRate || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      Tasso di occupazione
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Utenti Registrati</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Utenti totali
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
                      Da leggere
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Azioni Rapide</CardTitle>
                  <CardDescription>Operazioni frequenti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button onClick={() => openDialog('booking')} className="h-20 flex-col">
                      <Plus className="h-6 w-6 mb-2" />
                      Nuova Prenotazione
                    </Button>
                    <Button onClick={() => openDialog('user')} variant="outline" className="h-20 flex-col">
                      <Plus className="h-6 w-6 mb-2" />
                      Nuovo Utente
                    </Button>
                    <Button onClick={() => openDialog('email')} variant="outline" className="h-20 flex-col">
                      <Send className="h-6 w-6 mb-2" />
                      Invia Email
                    </Button>
                    <Button onClick={() => openDialog('blog')} variant="outline" className="h-20 flex-col">
                      <Plus className="h-6 w-6 mb-2" />
                      Nuovo Blog Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestione Prenotazioni</h2>
                <Button onClick={() => openDialog('booking')}>
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
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Ospiti</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking: any) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.guestName}</div>
                              <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                          <TableCell>{booking.numberOfGuests}</TableCell>
                          <TableCell>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'pending' ? 'secondary' :
                              booking.status === 'cancelled' ? 'destructive' : 'outline'
                            }>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Select 
                                value={booking.status} 
                                onValueChange={(status) => updateBookingStatusMutation.mutate({ id: booking.id, status })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="destructive" 
                                size="sm"
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

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestione Utenti</h2>
                <Button onClick={() => openDialog('user')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Utente
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Ruolo</TableHead>
                        <TableHead>Registrazione</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName || '-'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                              {user.isAdmin ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
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
                      {messages.map((message: any) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.name}</TableCell>
                          <TableCell>{message.email}</TableCell>
                          <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                          <TableCell>{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={message.isRead ? 'outline' : 'default'}>
                              {message.isRead ? 'Letto' : 'Nuovo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!message.isRead && (
                              <Button 
                                size="sm" 
                                onClick={() => markMessageReadMutation.mutate(message.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestione Contenuti</h2>
                <div className="flex gap-2">
                  <Button onClick={() => openDialog('blog')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Blog Post
                  </Button>
                  <Button onClick={() => openDialog('faq')} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova FAQ
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Blog Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Blog Posts ({stats?.blogPosts || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {blogPosts.slice(0, 5).map((post: any) => (
                        <div key={post.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-gray-500">{post.category}</div>
                          </div>
                          <Badge variant="outline">{post.views || 0} views</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* FAQs */}
                <Card>
                  <CardHeader>
                    <CardTitle>FAQs ({stats?.faqCount || 0})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {faqs.slice(0, 5).map((faq: any) => (
                        <div key={faq.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <div className="font-medium truncate">{faq.question}</div>
                            <div className="text-sm text-gray-500">{faq.category}</div>
                          </div>
                          <Badge variant="outline">{faq.viewCount || 0} views</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <h2 className="text-2xl font-bold">Gestione Inventario</h2>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Articolo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Quantità</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ultimo Aggiornamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Badge variant={
                              item.quantity === 0 ? 'destructive' :
                              item.quantity <= item.minQuantity ? 'secondary' : 'default'
                            }>
                              {item.quantity === 0 ? 'Esaurito' :
                               item.quantity <= item.minQuantity ? 'Scorta bassa' : 'Disponibile'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestione Email</h2>
                <Button onClick={() => openDialog('email')}>
                  <Send className="h-4 w-4 mr-2" />
                  Invia Email Personalizzata
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Email di Benvenuto</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">Invia email di benvenuto ai nuovi utenti</p>
                    <Button variant="outline" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Configura Template
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Newsletter</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">Gestisci e invia newsletter</p>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Gestisci Newsletter
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Email di Conferma</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">Template per conferme prenotazione</p>
                    <Button variant="outline" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Configura Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

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
              </DialogTitle>
            </DialogHeader>

            {/* User Form */}
            {selectedAction === 'user' && (
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(handleCreateUser)} className="space-y-4">
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
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? 'Creazione...' : 'Crea Utente'}
                  </Button>
                </form>
              </Form>
            )}

            {/* Booking Form */}
            {selectedAction === 'booking' && (
              <Form {...bookingForm}>
                <form onSubmit={bookingForm.handleSubmit(handleCreateBooking)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={bookingForm.control}
                      name="guestName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Ospite</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookingForm.control}
                      name="guestEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Ospite</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={bookingForm.control}
                      name="guestPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefono</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookingForm.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookingForm.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={bookingForm.control}
                    name="numberOfGuests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numero Ospiti</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="8" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={bookingForm.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Richieste Speciali</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createBookingMutation.isPending}>
                    {createBookingMutation.isPending ? 'Creazione...' : 'Crea Prenotazione'}
                  </Button>
                </form>
              </Form>
            )}

            {/* Email Form */}
            {selectedAction === 'email' && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleSendEmail)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="recipients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destinatari (separati da virgola)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="email1@example.com, email2@example.com" />
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Email</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Amministrativa</SelectItem>
                            <SelectItem value="booking">Prenotazione</SelectItem>
                            <SelectItem value="welcome">Benvenuto</SelectItem>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenuto</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={sendEmailMutation.isPending}>
                    {sendEmailMutation.isPending ? 'Invio...' : 'Invia Email'}
                  </Button>
                </form>
              </Form>
            )}

            {/* Blog Form */}
            {selectedAction === 'blog' && (
              <Form {...blogForm}>
                <form onSubmit={blogForm.handleSubmit(handleCreateBlog)} className="space-y-4">
                  <FormField
                    control={blogForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titolo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={blogForm.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estratto</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={blogForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={blogForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (separati da virgola)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={blogForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenuto (Markdown supportato)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={12} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createBlogMutation.isPending}>
                    {createBlogMutation.isPending ? 'Creazione...' : 'Crea Blog Post'}
                  </Button>
                </form>
              </Form>
            )}

            {/* FAQ Form */}
            {selectedAction === 'faq' && (
              <Form {...faqForm}>
                <form onSubmit={faqForm.handleSubmit(handleCreateFaq)} className="space-y-4">
                  <FormField
                    control={faqForm.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domanda</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={faqForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={faqForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (separati da virgola)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={faqForm.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risposta (Markdown supportato)</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={8} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createFaqMutation.isPending}>
                    {createFaqMutation.isPending ? 'Creazione...' : 'Crea FAQ'}
                  </Button>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}

export default function BackOfficePageWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <BackOfficePage />
    </ProtectedRoute>
  );
}