import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Key, CheckCircle, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    token: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione
    if (!formData.token || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Errore di validazione",
        description: "Compila tutti i campi richiesti.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Errore di validazione",
        description: "Le password non corrispondono.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Errore di validazione",
        description: "La password deve essere di almeno 6 caratteri.",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({
      token: formData.token,
      newPassword: formData.newPassword
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Password Reimpostata</CardTitle>
            <CardDescription>
              La tua password è stata reimpostata con successo. Verrai reindirizzato alla pagina di login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Reimposta Password</CardTitle>
          <CardDescription>
            Inserisci il token di reset fornito dall'amministratore e la tua nuova password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">
                Token di Reset *
              </Label>
              <Input
                id="token"
                type="text"
                value={formData.token}
                onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                placeholder="Inserisci il token fornito dall'amministratore"
                required
              />
              <p className="text-xs text-muted-foreground">
                Il token ti è stato fornito dall'amministratore del sistema
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                Nuova Password *
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Inserisci la nuova password (min. 6 caratteri)"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Conferma Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Conferma la nuova password"
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reimpostando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Reimposta Password
                </>
              )}
            </Button>
            
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setLocation("/auth")}
                disabled={resetPasswordMutation.isPending}
              >
                Torna al Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}