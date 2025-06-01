import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { X, Gift, Calendar, MessageCircle, Star, ArrowRight } from "lucide-react";

export function RegistrationIncentiveBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Mostra il banner solo se l'utente non è registrato
    if (!user) {
      const hasSeenBanner = localStorage.getItem('hasSeenRegistrationBanner');
      if (!hasSeenBanner) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenRegistrationBanner', 'true');
  };

  const handleRegister = () => {
    setLocation('/auth');
    handleClose();
  };

  if (!isVisible || user) return null;

  return (
    <>
      {/* Spacer per compensare il banner fisso */}
      <div className="h-16 w-full"></div>
      
      {/* Banner fisso */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Gift className="h-5 w-5" />
              <div className="flex items-center gap-2">
                <span className="font-medium">Registrati ora e ottieni il 10% di sconto sulla prima prenotazione!</span>
                <Badge variant="secondary" className="bg-white text-blue-600">
                  Fino al 10 giugno
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRegister}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Registrati
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function RegistrationIncentivePopup() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      const hasSeenPopup = localStorage.getItem('hasSeenRegistrationPopup');
      const lastVisit = localStorage.getItem('lastVisitDate');
      const today = new Date().toDateString();

      // Mostra popup se è la prima visita o dopo 3 giorni
      if (!hasSeenPopup || (lastVisit && lastVisit !== today)) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 5000); // Mostra dopo 5 secondi

        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenRegistrationPopup', 'true');
    localStorage.setItem('lastVisitDate', new Date().toDateString());
  };

  const handleRegister = () => {
    setLocation('/auth');
    handleClose();
  };

  if (!isOpen || user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Benvenuto alla Villa Ingrosso!
          </DialogTitle>
          <DialogDescription>
            Scopri tutti i vantaggi di essere un ospite registrato
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Prenotazioni facili</p>
                <p className="text-xs text-muted-foreground">Gestisci le tue prenotazioni in un click</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Gift className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Sconti esclusivi</p>
                <p className="text-xs text-muted-foreground">10% di sconto sulla prima prenotazione</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Assistenza prioritaria</p>
                <p className="text-xs text-muted-foreground">Chat diretta con il nostro team</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleRegister} className="flex-1">
              Registrati ora
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Forse dopo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RegistrationIncentiveCard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) return null;

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-cyan-50 border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-800">
          Crea il tuo account
        </CardTitle>
        <CardDescription className="text-slate-600">
          Accedi a tutti i servizi e gestisci le tue prenotazioni
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 text-cyan-600" />
            <span>Prenotazioni semplificate</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MessageCircle className="h-4 w-4 text-cyan-600" />
            <span>Assistenza prioritaria</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Gift className="h-4 w-4 text-cyan-600" />
            <span>Offerte esclusive</span>
          </div>
        </div>
        
        <Button 
          onClick={() => setLocation('/auth')} 
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          Registrati ora
        </Button>
        
        <p className="text-xs text-center text-slate-500">
          È gratuito e richiede meno di un minuto
        </p>
      </CardContent>
    </Card>
  );
}