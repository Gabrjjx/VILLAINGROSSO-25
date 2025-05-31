import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, UserPlus, BookOpen, Phone, Mail, User, Calendar as CalendarIcon2, Euro, Users, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BookingFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  numberOfGuests: number;
  totalPrice: number;
  notes: string;
  status: string;
  source: string;
}

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  notes: string;
}

export default function AdminBookingForm() {
  const [activeTab, setActiveTab] = useState("booking");
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: undefined,
    checkOut: undefined,
    numberOfGuests: 2,
    totalPrice: 0,
    notes: "",
    status: "confirmed",
    source: "phone"
  });

  const [userForm, setUserForm] = useState<UserFormData>({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    dateOfBirth: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation per creare prenotazione
  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/manual-booking", data);
      if (!res.ok) {
        throw new Error("Errore nella creazione della prenotazione");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Prenotazione creata",
        description: "La prenotazione è stata aggiunta con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      // Reset form
      setBookingForm({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        checkIn: undefined,
        checkOut: undefined,
        numberOfGuests: 2,
        totalPrice: 0,
        notes: "",
        status: "confirmed",
        source: "phone"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation per creare utente
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/manual-user", data);
      if (!res.ok) {
        throw new Error("Errore nella creazione dell'utente");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Utente creato",
        description: "L'utente è stato aggiunto con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      // Reset form
      setUserForm({
        username: "",
        email: "",
        fullName: "",
        phone: "",
        dateOfBirth: "",
        notes: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.guestName || !bookingForm.guestEmail || !bookingForm.checkIn || !bookingForm.checkOut) {
      toast({
        title: "Campi mancanti",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      ...bookingForm,
      checkIn: bookingForm.checkIn?.toISOString(),
      checkOut: bookingForm.checkOut?.toISOString(),
    };

    createBookingMutation.mutate(bookingData);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.username || !userForm.email || !userForm.fullName) {
      toast({
        title: "Campi mancanti",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    // Genera password temporanea
    const userData = {
      ...userForm,
      password: `VillaIngrosso${Math.random().toString(36).substring(2, 8)}`,
      privacyAccepted: true
    };

    createUserMutation.mutate(userData);
  };

  const calculateNights = () => {
    if (bookingForm.checkIn && bookingForm.checkOut) {
      const diffTime = bookingForm.checkOut.getTime() - bookingForm.checkIn.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gestione Manuale</h1>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Prenotazioni Telefoniche
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <CalendarIcon2 className="h-4 w-4" />
            Nuova Prenotazione
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nuovo Utente
          </TabsTrigger>
        </TabsList>

        {/* Tab Prenotazione */}
        <TabsContent value="booking" className="space-y-6">
          <form onSubmit={handleBookingSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dati Ospite */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Dati Ospite
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guestName">Nome Completo *</Label>
                      <Input
                        id="guestName"
                        value={bookingForm.guestName}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, guestName: e.target.value }))}
                        placeholder="Nome e Cognome"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="guestEmail">Email *</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        value={bookingForm.guestEmail}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, guestEmail: e.target.value }))}
                        placeholder="ospite@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guestPhone">Telefono</Label>
                    <Input
                      id="guestPhone"
                      value={bookingForm.guestPhone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, guestPhone: e.target.value }))}
                      placeholder="+39 123 456 7890"
                    />
                  </div>

                  <Separator />

                  {/* Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Check-in *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !bookingForm.checkIn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bookingForm.checkIn ? (
                              format(bookingForm.checkIn, "PPP", { locale: it })
                            ) : (
                              "Seleziona data"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={bookingForm.checkIn}
                            onSelect={(date) => setBookingForm(prev => ({ ...prev, checkIn: date }))}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Check-out *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !bookingForm.checkOut && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {bookingForm.checkOut ? (
                              format(bookingForm.checkOut, "PPP", { locale: it })
                            ) : (
                              "Seleziona data"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={bookingForm.checkOut}
                            onSelect={(date) => setBookingForm(prev => ({ ...prev, checkOut: date }))}
                            disabled={(date) => !bookingForm.checkIn || date <= bookingForm.checkIn}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numberOfGuests">Numero Ospiti</Label>
                      <Select
                        value={bookingForm.numberOfGuests.toString()}
                        onValueChange={(value) => setBookingForm(prev => ({ ...prev, numberOfGuests: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "ospite" : "ospiti"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="totalPrice">Prezzo Totale (€)</Label>
                      <Input
                        id="totalPrice"
                        type="number"
                        value={bookingForm.totalPrice}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, totalPrice: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Note</Label>
                    <Textarea
                      id="notes"
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Richieste speciali, note aggiuntive..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dettagli Prenotazione */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon2 className="h-5 w-5 mr-2" />
                    Dettagli
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={bookingForm.status}
                      onValueChange={(value) => setBookingForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">✅ Confermata</SelectItem>
                        <SelectItem value="pending">⏳ In Attesa</SelectItem>
                        <SelectItem value="cancelled">❌ Cancellata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Fonte</Label>
                    <Select
                      value={bookingForm.source}
                      onValueChange={(value) => setBookingForm(prev => ({ ...prev, source: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">📞 Telefono</SelectItem>
                        <SelectItem value="email">📧 Email</SelectItem>
                        <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                        <SelectItem value="website">🌐 Sito Web</SelectItem>
                        <SelectItem value="booking">📚 Booking.com</SelectItem>
                        <SelectItem value="airbnb">🏠 Airbnb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Riepilogo */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Notti:</span>
                      <span className="font-medium">{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ospiti:</span>
                      <span className="font-medium">{bookingForm.numberOfGuests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Totale:</span>
                      <span className="font-bold text-lg">€{bookingForm.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createBookingMutation.isPending}
                    className="w-full"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {createBookingMutation.isPending ? "Creazione..." : "Crea Prenotazione"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </TabsContent>

        {/* Tab Utente */}
        <TabsContent value="user" className="space-y-6">
          <form onSubmit={handleUserSubmit}>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Nuovo Utente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={userForm.username}
                        onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="username"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="userEmail">Email *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="utente@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Nome e Cognome"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="userPhone">Telefono</Label>
                      <Input
                        id="userPhone"
                        value={userForm.phone}
                        onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+39 123 456 7890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Data di Nascita</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={userForm.dateOfBirth}
                        onChange={(e) => setUserForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="userNotes">Note</Label>
                    <Textarea
                      id="userNotes"
                      value={userForm.notes}
                      onChange={(e) => setUserForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Note aggiuntive sull'utente..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> Verrà generata automaticamente una password temporanea.
                      L'utente potrà cambiarla al primo accesso.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {createUserMutation.isPending ? "Creazione..." : "Crea Utente"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}