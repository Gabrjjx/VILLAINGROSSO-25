import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Lock, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ChangePasswordPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [isSuccess, setIsSuccess] = useState(false);

  // Mutation per reset password diretto
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { email: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/reset-password-direct", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to change password");
      }
      return await res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Password cambiata",
        description: "La tua password è stata cambiata con successo. Ora puoi effettuare il login.",
      });
      // Reindirizza alla pagina di login dopo 3 secondi
      setTimeout(() => {
        setLocation("/auth");
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: "Errore",
        description: "Inserisci l'indirizzo email",
        variant: "destructive",
      });
      return;
    }

    if (!formData.newPassword) {
      toast({
        title: "Errore",
        description: "Inserisci la nuova password",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Errore", 
        description: "La password deve essere di almeno 6 caratteri",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      email: formData.email,
      newPassword: formData.newPassword
    });
  };

  // Se il cambio password è completato con successo
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Password Cambiata!
                </h3>
                <p className="text-sm text-gray-600">
                  La tua password è stata cambiata con successo. 
                  Verrai reindirizzato al login tra pochi secondi.
                </p>
              </div>
              <Button 
                onClick={() => setLocation("/auth")}
                className="w-full"
              >
                Vai al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Villa Ingrosso</h1>
          <p className="text-gray-600">Cambia Password</p>
        </div>

        {/* Back to Login Button */}
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/auth")}
            className="text-sky-600 hover:text-sky-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al Login
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Imposta Nuova Password
            </CardTitle>
            <CardDescription>
              Hai ricevuto un'email di reset? Inserisci la tua email e la nuova password qui sotto.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Indirizzo Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Inserisci il tuo indirizzo email"
                  value={formData.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    email: e.target.value
                  })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nuova Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Inserisci la nuova password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({
                    ...formData,
                    newPassword: e.target.value
                  })}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Minimo 6 caratteri</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Conferma la nuova password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({
                    ...formData,
                    confirmPassword: e.target.value
                  })}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cambiando password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Cambia Password
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => setLocation("/reset-password")}
                  className="text-sky-600 hover:text-sky-700"
                >
                  Non hai ricevuto l'email? Richiedila di nuovo
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}