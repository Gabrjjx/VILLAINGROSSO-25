import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Booking } from "@shared/schema";
import { format, addDays, differenceInDays, isPast, isFuture, isToday } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { 
  Loader2, 
  LogOut, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  MessageCircle,
  Home,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  Star,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Edit,
  Save,
  X
} from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

export default function AccountPageWrapper() {
  return (
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  );
}

function AccountPage() {
  const { t, language } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || ""
  });

  // Carica le prenotazioni dell'utente
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/bookings");
        if (!res.ok) {
          throw new Error("Failed to fetch bookings");
        }
        return await res.json();
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: t("account.bookings.error"),
          description: t("account.bookings.errorFetching"),
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Mutation per aggiornare il profilo
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullName: string; email: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      // Aggiorna i dati dell'utente nella cache
      queryClient.setQueryData(["/api/user"], updatedUser);
      setIsEditingProfile(false);
      toast({
        title: t("account.profile.updateSuccess") || "Profilo aggiornato",
        description: t("account.profile.updateSuccessMessage") || "Le tue informazioni sono state aggiornate con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("account.profile.updateError") || "Errore di aggiornamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleEditProfile = () => {
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || ""
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (!profileData.fullName.trim() || !profileData.email.trim()) {
      toast({
        title: t("account.profile.validationError") || "Errore di validazione",
        description: t("account.profile.fillAllFields") || "Compila tutti i campi obbligatori.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handleCancelEdit = () => {
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || ""
    });
    setIsEditingProfile(false);
  };

  // Helper per formattare le date in base alla lingua
  const formatDate = (date: string | Date) => {
    const localeObj = language === "it" ? it : enUS;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "PPP", { locale: localeObj });
  };

  // Calcola statistiche delle prenotazioni
  const getBookingStats = () => {
    if (!bookings) return { total: 0, upcoming: 0, completed: 0, current: 0 };
    
    const now = new Date();
    const total = bookings.length;
    const upcoming = bookings.filter(b => isFuture(new Date(b.startDate))).length;
    const completed = bookings.filter(b => isPast(new Date(b.endDate))).length;
    const current = bookings.filter(b => {
      const startDate = new Date(b.startDate);
      const endDate = new Date(b.endDate);
      return startDate <= now && now <= endDate;
    }).length;
    
    return { total, upcoming, completed, current };
  };

  // Ottieni la prossima prenotazione
  const getNextBooking = () => {
    if (!bookings) return null;
    return bookings
      .filter(b => isFuture(new Date(b.startDate)))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  };

  // Ottieni la prenotazione corrente
  const getCurrentBooking = () => {
    if (!bookings) return null;
    const now = new Date();
    return bookings.find(b => {
      const startDate = new Date(b.startDate);
      const endDate = new Date(b.endDate);
      return startDate <= now && now <= endDate;
    });
  };

  // Calcola stato prenotazione
  const getBookingStatus = (booking: Booking) => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    
    if (startDate > now) return 'upcoming';
    if (startDate <= now && now <= endDate) return 'current';
    return 'completed';
  };

  // Badge per stato prenotazione
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Clock className="h-3 w-3 mr-1" />{t("account.bookings.status.upcoming") || "Prossima"}</Badge>;
      case 'current':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />{t("account.bookings.status.current") || "In corso"}</Badge>;
      case 'completed':
        return <Badge variant="secondary"><CalendarCheck className="h-3 w-3 mr-1" />{t("account.bookings.status.completed") || "Completata"}</Badge>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header dell'area utente */}
      <div className="bg-gradient-to-r from-primary/80 to-primary text-white p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t("account.welcome")}</h1>
            <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              {t("account.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[800px] grid-cols-4">
            <TabsTrigger value="overview">
              <Home className="h-4 w-4 mr-2" />
              {t("account.tabs.overview") || "Panoramica"}
            </TabsTrigger>
            <TabsTrigger value="profile">
              <UserIcon className="h-4 w-4 mr-2" />
              {t("account.tabs.profile")}
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              {t("account.tabs.bookings")}
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t("account.tabs.chat")}
            </TabsTrigger>
          </TabsList>

          {/* Tab Overview */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Statistiche prenotazioni */}
              {(() => {
                const stats = getBookingStats();
                return (
                  <>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t("account.overview.totalBookings") || "Prenotazioni Totali"}
                            </p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                          </div>
                          <Calendar className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t("account.overview.upcomingBookings") || "Prossime"}
                            </p>
                            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                          </div>
                          <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t("account.overview.currentBookings") || "In Corso"}
                            </p>
                            <p className="text-2xl font-bold text-green-600">{stats.current}</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t("account.overview.completedBookings") || "Completate"}
                            </p>
                            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
                          </div>
                          <CalendarCheck className="h-8 w-8 text-gray-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Prenotazione corrente o prossima */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-primary" />
                    {getCurrentBooking() ? 
                      (t("account.overview.currentStay") || "Soggiorno Attuale") : 
                      (t("account.overview.nextStay") || "Prossimo Soggiorno")
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const currentBooking = getCurrentBooking();
                    const nextBooking = getNextBooking();
                    const booking = currentBooking || nextBooking;
                    
                    if (!booking) {
                      return (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {t("account.overview.noUpcomingBookings") || "Nessuna prenotazione in programma"}
                          </p>
                        </div>
                      );
                    }
                    
                    const status = getBookingStatus(booking);
                    const daysUntilCheckIn = currentBooking ? 0 : differenceInDays(new Date(booking.startDate), new Date());
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{booking.guestName}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.guestCount} {booking.guestCount === 1 ? 'ospite' : 'ospiti'}
                            </p>
                          </div>
                          {getStatusBadge(status)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Villa Ingrosso, Leporano</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Contatto disponibile tramite chat</span>
                          </div>
                        </div>
                        
                        {!currentBooking && daysUntilCheckIn > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <Clock className="h-4 w-4 inline mr-1" />
                              {daysUntilCheckIn === 1 ? 
                                "Check-in domani!" : 
                                `Check-in tra ${daysUntilCheckIn} giorni`
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Informazioni Villa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-primary" />
                    {t("account.overview.villaInfo") || "Villa Ingrosso"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Leporano, Taranto - 300m dal mare</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>4 camere da letto</span>
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Fino a 8 ospiti</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Assistenza 24/7 disponibile
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Usa la chat per contattarci in qualsiasi momento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab profilo */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-primary" />
                      {t("account.profile.title") || "Il tuo profilo"}
                    </CardTitle>
                    <CardDescription>
                      {t("account.profile.description") || "Visualizza e modifica le informazioni del tuo account"}
                    </CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button variant="outline" size="sm" onClick={handleEditProfile}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t("account.profile.edit") || "Modifica"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          {t("account.profile.fullName") || "Nome completo"} *
                        </Label>
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Inserisci il tuo nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">
                          {t("account.profile.username") || "Nome utente"}
                        </Label>
                        <Input
                          id="username"
                          value={user.username}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Il nome utente non può essere modificato
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {t("account.profile.email") || "Email"} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Inserisci la tua email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{t("account.profile.accountType") || "Tipo di account"}</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <Badge variant={user.isAdmin ? "default" : "secondary"}>
                          {user.isAdmin ? (t("account.profile.admin") || "Amministratore") : (t("account.profile.user") || "Utente")}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={updateProfileMutation.isPending}
                        className="flex-1"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {t("account.profile.save") || "Salva modifiche"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={updateProfileMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("account.profile.cancel") || "Annulla"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">{t("account.profile.fullName")}</div>
                            <div className="font-medium">{user.fullName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">{t("account.profile.username")}</div>
                            <div className="font-medium">{user.username}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">{t("account.profile.email")}</div>
                            <div className="font-medium">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">{t("account.profile.accountType")}</div>
                            <Badge variant={user.isAdmin ? "default" : "secondary"}>
                              {user.isAdmin ? t("account.profile.admin") : t("account.profile.user")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                        Account verificato
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Il tuo account è attivo e verificato. Puoi effettuare prenotazioni e utilizzare tutti i servizi di Villa Ingrosso.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab prenotazioni */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  {t("account.bookings.title") || "Le Mie Prenotazioni"}
                </CardTitle>
                <CardDescription>
                  {t("account.bookings.description") || "Gestisci e visualizza tutte le tue prenotazioni"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-6">
                    {bookings
                      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                      .map((booking) => {
                        const status = getBookingStatus(booking);
                        const nights = Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24));
                        const daysUntil = differenceInDays(new Date(booking.startDate), new Date());
                        
                        return (
                          <Card key={booking.id} className="overflow-hidden border-l-4 border-l-primary">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="font-semibold text-lg mb-1">
                                    Villa Ingrosso
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {booking.guestName}
                                  </p>
                                </div>
                                {getStatusBadge(status)}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Check-in</p>
                                    <p className="text-sm font-medium">{format(new Date(booking.startDate), "dd MMM", { locale: language === "it" ? it : enUS })}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Check-out</p>
                                    <p className="text-sm font-medium">{format(new Date(booking.endDate), "dd MMM", { locale: language === "it" ? it : enUS })}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Ospiti</p>
                                    <p className="text-sm font-medium">{booking.guestCount}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Notti</p>
                                    <p className="text-sm font-medium">{nights}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {status === 'upcoming' && daysUntil > 0 && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                                  <p className="text-sm text-blue-800 font-medium">
                                    <AlertCircle className="h-4 w-4 inline mr-2" />
                                    {daysUntil === 1 ? 
                                      "Il tuo soggiorno inizia domani!" : 
                                      `Il tuo soggiorno inizia tra ${daysUntil} giorni`
                                    }
                                  </p>
                                </div>
                              )}
                              
                              {status === 'current' && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-l-green-400">
                                  <p className="text-sm text-green-800 font-medium">
                                    <CheckCircle className="h-4 w-4 inline mr-2" />
                                    Benvenuto a Villa Ingrosso! Stai attualmente soggiornando qui.
                                  </p>
                                </div>
                              )}
                              
                              {booking.notes && (
                                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">Note:</p>
                                  <p className="text-sm text-muted-foreground">{booking.notes}</p>
                                </div>
                              )}
                              
                              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  Leporano, Taranto - 300m dal mare
                                </div>
                                
                                {(status === 'upcoming' || status === 'current') && (
                                  <Button variant="outline" size="sm" onClick={() => setActiveTab('chat')}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Contatta Staff
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nessuna prenotazione</h3>
                    <p className="text-muted-foreground mb-6">
                      Non hai ancora effettuato nessuna prenotazione presso Villa Ingrosso.
                    </p>
                    <Button onClick={() => window.location.href = "/booking"}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Prenota Ora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab chat */}
          <TabsContent value="chat" className="mt-6">
            <ChatInterface />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}