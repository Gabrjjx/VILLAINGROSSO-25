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

export default function ResetPasswordPage() {
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
        throw new Error(errorData.message || "Errore nella richiesta di reset");
      }
      return res.json();
    },
    onSuccess: () => {
      setIsEmailSent(true);
      toast({
        title: "Email inviata",
        description: "Controlla la tua email per il link di reset della password.",
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

  // Mutation per reset password
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/reset-password", data);
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

    resetPasswordMutation.mutate({
      token: resetFormData.token,
      newPassword: resetFormData.newPassword
    });
  };

  // Se il reset è completato con successo
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Password Reimpostata</CardTitle>
            <CardDescription>
              La tua password è stata aggiornata con successo. Sarai reindirizzato alla pagina di login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/auth")} className="w-full">
              Vai al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Pulsante per tornare indietro */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setLocation("/auth")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna al Login
        </Button>

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

          {/* Tab per richiedere reset via email */}
          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Reset Password via Email
                </CardTitle>
                <CardDescription>
                  Inserisci il tuo indirizzo email per ricevere un link di reset della password.
                </CardDescription>
              </CardHeader>
              
              {isEmailSent ? (
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Email Inviata!</h3>
                  <p className="text-muted-foreground mb-4">
                    Controlla la tua casella email per il link di reset della password.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEmailSent(false)}
                    className="w-full"
                  >
                    Invia di nuovo
                  </Button>
                </CardContent>
              ) : (
                <form onSubmit={handleRequestSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
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
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={requestResetMutation.isPending}
                    >
                      {requestResetMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Invia Email di Reset
                        </>
                      )}
                    </Button>
                  </CardContent>
                </form>
              )}
            </Card>
          </TabsContent>

          {/* Tab per reset con token */}
          <TabsContent value="reset">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Reimposta Password
                </CardTitle>
                <CardDescription>
                  Hai ricevuto un token via email? Inseriscilo qui insieme alla nuova password.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleResetSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Token di Reset</Label>
                    <Input
                      id="token"
                      type="text"
                      placeholder="Inserisci il token ricevuto via email"
                      value={resetFormData.token}
                      onChange={(e) => setResetFormData({
                        ...resetFormData,
                        token: e.target.value
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reset in corso...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
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