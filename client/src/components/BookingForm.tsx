import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBookingSchema } from "@shared/schema";
import { useLanguage } from "@/context/LanguageContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateRange } from "react-day-picker";
import { format, addDays, isBefore, isAfter, differenceInDays } from "date-fns";
import { it, enUS } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Estendiamo lo schema per aggiungere validazioni aggiuntive
const bookingSchema = insertBookingSchema.extend({
  startDate: z.date({
    required_error: "Data di inizio soggiorno richiesta",
  }),
  endDate: z.date({
    required_error: "Data di fine soggiorno richiesta",
  }),
  guestCount: z.number()
    .min(1, "Numero di ospiti minimo: 1")
    .max(5, "Numero di ospiti massimo: 5"),
  notes: z.string().optional(),
}).refine(
  data => isAfter(data.endDate, data.startDate),
  {
    message: "La data di fine deve essere successiva alla data di inizio",
    path: ["endDate"],
  }
).refine(
  data => differenceInDays(data.endDate, data.startDate) >= 3,
  {
    message: "Soggiorno minimo: 3 notti",
    path: ["endDate"],
  }
);

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingForm() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Se l'utente non è autenticato, mostra il messaggio di login
  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-cyan-600">
            {t("booking.loginRequired.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("booking.loginRequired.message")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => window.location.href = '/auth'} className="bg-cyan-600 hover:bg-cyan-700">
            {t("booking.loginRequired.button")}
          </Button>
        </CardContent>
      </Card>
    );
  }
  const today = new Date();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(today, 1),
    to: addDays(today, 8)
  });

  // Inizializza il form con i valori predefiniti
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDate: addDays(today, 1),
      endDate: addDays(today, 8),
      guestName: "",
      guestCount: 2,
      totalAmount: 0,
      notes: "",
      status: "pending", // Tutte le nuove prenotazioni vengono create con stato "pending"
    },
  });

  // Gestisce l'invio del form
  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      if (!res.ok) {
        throw new Error("Failed to create booking");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // Salva i dati della prenotazione per la pagina di conferma
      const bookingData = {
        id: data.id,
        guestName: form.getValues().guestName,
        startDate: form.getValues().startDate,
        endDate: form.getValues().endDate,
        guestCount: form.getValues().guestCount,
        notes: form.getValues().notes,
        createdAt: new Date().toISOString()
      };
      
      sessionStorage.setItem('lastBooking', JSON.stringify(bookingData));
      
      // Reindirizza alla pagina di conferma
      setLocation("/booking-confirmation");
      
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("booking.error.title"),
        description: error.message || t("booking.error.message"),
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: BookingFormValues) {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("Date range:", dateRange);
    
    // Assicuriamoci che le date siano impostate correttamente
    if (dateRange?.from && dateRange?.to) {
      data.startDate = dateRange.from;
      data.endDate = dateRange.to;
      // Importo da definire dopo la conferma
      data.totalAmount = 0;
    }
    
    bookingMutation.mutate(data);
  }

  // Gestisce il cambio di date
  const handleDateRangeChange = (range: DateRange | undefined) => {
    console.log("Date range changed:", range);
    if (range?.from) {
      form.setValue("startDate", range.from);
      setDateRange(range);
      
      if (range.to) {
        form.setValue("endDate", range.to);
      }
    }
  };

  // Calcola il numero di notti
  const numberOfNights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;

  // Utilizzato per formattare le date in base alla lingua corrente
  const formatDate = (date: Date) => {
    const localeObj = language === "it" ? it : enUS;
    return format(date, "PPP", { locale: localeObj });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-primary text-white">
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Richiesta di Prenotazione
        </CardTitle>
        <CardDescription className="text-primary-foreground/90">Invia una richiesta per il tuo soggiorno presso Villa Ingrosso</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">


            {/* Selezione date */}
            <div className="space-y-4">
              <FormLabel>{t("booking.dateRange")}</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                        </>
                      ) : (
                        formatDate(dateRange.from)
                      )
                    ) : (
                      <span>{t("booking.selectDates")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    disabled={(date) => isBefore(date, today)}
                  />
                </PopoverContent>
              </Popover>
              
              {numberOfNights > 0 && (
                <div className="text-sm text-muted-foreground">
                  {numberOfNights} {numberOfNights === 1 ? t("booking.night") : t("booking.nights")}
                </div>
              )}
            </div>

            {/* Nome dell'ospite */}
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome dell'ospite</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Inserisci il nome completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Numero di ospiti */}
            <FormField
              control={form.control}
              name="guestCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("booking.guestCount")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={5} 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Massimo 5 ospiti
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informazioni soggiorno */}
            {numberOfNights > 0 && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Soggiorno di {numberOfNights} {numberOfNights === 1 ? "notte" : "notti"}
                </p>
                {numberOfNights < 3 && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Soggiorno minimo: 3 notti
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Il prezzo finale verrà concordato dopo la verifica della disponibilità.
                </p>
              </div>
            )}

            {/* Note aggiuntive */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("booking.notes")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t("booking.notesPlaceholder")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-end px-0">
              <Button 
                type="submit" 
                className="w-full md:w-auto" 
                disabled={bookingMutation.isPending}
                onClick={() => {
                  console.log("Button clicked!");
                  console.log("Form errors:", form.formState.errors);
                  console.log("Form is valid:", form.formState.isValid);
                }}
              >
                {bookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("booking.submitting")}
                  </>
                ) : (
                  "Invia Richiesta"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}