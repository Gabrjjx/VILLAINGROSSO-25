import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Key, CheckCircle, Lock, Mail, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SimpleResetPasswordPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [requestFormData, setRequestFormData] = useState({
    email: ""
  });
  
  const [resetFormData, setResetFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"request" | "reset">("request");

  // Mutation per richiedere reset via email
  const requestResetMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/request-password-reset", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send reset email");
      }
      return res.json();
    },
    onSuccess: () => {
      setIsEmailSent(true);
      toast({
        title: "Email inviata",
        description: "Ti abbiamo inviato un link per reimpostare la password",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore invio email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation per reset password diretto
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/reset-password-direct", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reset password");
      }
      return await res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Password reimpostata",
        description: "La tua password è stata reimpostata con successo. Ora puoi effettuare il login.",
      });
      // Reindirizza alla pagina di login dopo 3 secondi
      setTimeout(() => {
        setLocation("/auth");
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Errore reset password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestFormData.email) {
      toast({
        title: "Errore",
        description: "Inserisci un indirizzo email valido",
        variant: "destructive",
      });
      return;
    }
    requestResetMutation.mutate({ email: requestFormData.email });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono",
        variant: "destructive",
      });
      return;
    }

    if (resetFormData.newPassword.length < 6) {
      toast({
        title: "Errore", 
        description: "La password deve essere di almeno 6 caratteri",
        variant: "destructive",
      });
      return;
    }

    if (!resetFormData.email) {
      toast({
        title: "Errore",
        description: "Inserisci l'indirizzo email",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({
      email: resetFormData.email,
      newPassword: resetFormData.newPassword
    });
  };

  // Se il reset è completato con successo
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
                  Password Reimpostata!
                </h3>
                <p className="text-sm text-gray-600">
                  La tua password è stata reimpostata con successo. 
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
          <p className="text-gray-600">Reset della Password</p>
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

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "request" | "reset")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="request" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Richiedi Reset
            </TabsTrigger>
            <TabsTrigger value="reset" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Reimposta Password
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Request Reset */}
          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Richiedi Reset Password
                </CardTitle>
                <CardDescription>
                  Inserisci la tua email per ricevere le istruzioni per il reset della password.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleRequestSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Indirizzo Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Il tuo indirizzo email"
                      value={requestFormData.email}
                      onChange={(e) => setRequestFormData({
                        ...requestFormData,
                        email: e.target.value
                      })}
                      required
                    />
                  </div>

                  {isEmailSent && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Email inviata!</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Controlla la tua casella email e clicca sul link per reimpostare la password.
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={requestResetMutation.isPending}
                  >
                    {requestResetMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Invia Email di Reset
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>

          {/* Tab 2: Reset Password */}
          <TabsContent value="reset">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Reimposta Password
                </CardTitle>
                <CardDescription>
                  Hai ricevuto un'email di reset? Inserisci l'indirizzo email e la nuova password.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleResetSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Indirizzo Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Inserisci il tuo indirizzo email"
                      value={resetFormData.email}
                      onChange={(e) => setResetFormData({
                        ...resetFormData,
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
                      value={resetFormData.newPassword}
                      onChange={(e) => setResetFormData({
                        ...resetFormData,
                        newPassword: e.target.value
                      })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Conferma Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Conferma la nuova password"
                      value={resetFormData.confirmPassword}
                      onChange={(e) => setResetFormData({
                        ...resetFormData,
                        confirmPassword: e.target.value
                      })}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Reimpostazione...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Reimposta Password
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}