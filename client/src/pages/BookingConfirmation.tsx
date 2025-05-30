import { useLocation, Link } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Users, MapPin, Home, MessageCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface BookingData {
  id: number;
  guestName: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  notes?: string;
  createdAt: string;
}

export default function BookingConfirmation() {
  const [location] = useLocation();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    // Ottieni i dati della prenotazione dall'URL e sessionStorage
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const bookingId = urlParams.get('id');
    
    console.log('BookingConfirmation - URL:', location);
    console.log('BookingConfirmation - Booking ID from URL:', bookingId);
    
    if (bookingId) {
      // Recupera i dati salvati dal form di prenotazione
      const savedBooking = sessionStorage.getItem('lastBooking');
      console.log('BookingConfirmation - Data from sessionStorage:', savedBooking);
      
      if (savedBooking) {
        try {
          const data = JSON.parse(savedBooking);
          console.log('BookingConfirmation - Parsed data:', data);
          setBookingData({ ...data, id: parseInt(bookingId) });
          sessionStorage.removeItem('lastBooking');
        } catch (error) {
          console.error('Errore nel parsing dei dati della prenotazione:', error);
          setBookingData(null);
        }
      } else {
        console.log('BookingConfirmation - No data found in sessionStorage');
      }
    } else {
      console.log('BookingConfirmation - No booking ID in URL');
    }
  }, [location]);

  if (!bookingData || !bookingData.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Caricamento dettagli prenotazione...</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                Torna alla Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = new Date(bookingData.startDate);
  const endDate = new Date(bookingData.endDate);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header di conferma */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Richiesta Inviata con Successo!
          </h1>
          <p className="text-lg text-muted-foreground">
            Grazie per aver scelto Villa Ingrosso
          </p>
        </div>

        {/* Card principale con dettagli */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Codice Richiesta: #{bookingData.id.toString().padStart(6, '0')}
            </CardTitle>
            <CardDescription className="text-blue-100">
              La tua richiesta di prenotazione è stata ricevuta
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Dettagli soggiorno */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Date di soggiorno</p>
                    <p className="text-gray-600">
                      {format(startDate, "dd MMMM yyyy", { locale: it })} - {format(endDate, "dd MMMM yyyy", { locale: it })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {nights} {nights === 1 ? "notte" : "notti"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Ospiti</p>
                    <p className="text-gray-600">{bookingData.guestCount} {bookingData.guestCount === 1 ? "persona" : "persone"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Destinazione</p>
                    <p className="text-gray-600">Villa Ingrosso</p>
                    <p className="text-sm text-muted-foreground">Leporano, Taranto</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Nome ospite</p>
                    <p className="text-gray-600">{bookingData.guestName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note aggiuntive */}
            {bookingData.notes && (
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900 mb-2">Note aggiuntive</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{bookingData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informazioni prossimi passi */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Prossimi Passi</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">1</div>
                <p>Il proprietario riceverà la tua richiesta e verificherà la disponibilità per le date selezionate</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">2</div>
                <p>Ti contatteremo entro 24 ore con conferma della disponibilità e preventivo personalizzato</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">3</div>
                <p>Una volta concordati i dettagli, riceverai le istruzioni per finalizzare la prenotazione</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contatti */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Hai domande?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-blue-600">g.ingrosso@villaingrosso.com</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Telefono</p>
                <p className="text-blue-600">+39 347 089 6961</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pulsanti azione */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Home className="w-4 h-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contattaci
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}