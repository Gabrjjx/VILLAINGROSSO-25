import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Settings, Shield, Lock, User } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username è richiesto"),
  password: z.string().min(1, "Password è richiesta")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function BackOfficeAuthPage() {
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Redirect se già loggato come admin
  useEffect(() => {
    if (user?.isAdmin) {
      setLocation("/back-office");
    }
  }, [user, setLocation]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(data);
      
      // Verifica che l'utente sia admin dopo il login
      const currentUser = loginMutation.data;
      if (currentUser?.isAdmin) {
        toast({
          title: "Accesso riuscito",
          description: "Benvenuto nel Back-Office Villa Ingrosso",
        });
        setLocation("/back-office");
      } else {
        toast({
          title: "Accesso negato",
          description: "Solo gli amministratori possono accedere al back-office",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Errore di accesso",
        description: error.message || "Credenziali non valide",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se già loggato come admin, mostra messaggio di reindirizzamento
  if (user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold mb-2">Reindirizzamento...</h2>
            <p className="text-gray-600">Sei già autenticato come amministratore.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Back-Office</h1>
          <p className="text-blue-200">Villa Ingrosso - Accesso Amministratori</p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <CardTitle className="text-xl text-white">Accesso Sicuro</CardTitle>
            <CardDescription className="text-blue-200">
              Inserisci le tue credenziali di amministratore
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inserisci username"
                          className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Inserisci password"
                          className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  disabled={isLoading || loginMutation.isPending}
                >
                  {isLoading || loginMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Accesso in corso...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Accedi al Back-Office
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            {/* Helper Text */}
            <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-sm text-blue-200 text-center">
                <Lock className="h-4 w-4 inline mr-1" />
                Accesso riservato solo agli amministratori
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-300 text-sm">
            © 2025 Villa Ingrosso - Sistema di Gestione
          </p>
        </div>
      </div>
    </div>
  );
}