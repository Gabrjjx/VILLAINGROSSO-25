import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";

// Definisci gli schemi di validazione
const loginSchema = z.object({
  username: z.string().min(3, "Username troppo corto"),
  password: z.string().min(6, "Password troppo corta"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username troppo corto"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password troppo corta"),
  fullName: z.string().min(2, "Nome completo troppo corto"),
  dateOfBirth: z.string().min(1, "Data di nascita obbligatoria"),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: "Devi accettare il trattamento dei dati personali per procedere"
  })
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  // Form per il login
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form per la registrazione
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      dateOfBirth: "",
      privacyAccepted: false,
    },
  });

  // Handlers per submit
  const handleLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      isAdmin: false,
    });
  };

  // Se l'utente è già loggato, redirect alla pagina appropriata
  if (user) {
    return <Redirect to={user.isAdmin ? "/admin" : "/account"} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      {/* Pulsante per tornare alla home */}
      <div className="w-full max-w-6xl mb-6 flex justify-start">
        <a href="/" className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.backToHome") || "Torna alla Home"}
        </a>
      </div>
      
      <div className="w-full max-w-6xl flex flex-col md:flex-row">
        {/* Hero section */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center bg-gradient-to-br from-primary/80 to-primary rounded-l-lg hidden md:flex">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t("authPage.hero.title")}
          </h1>
          <p className="text-white/90 mb-6">
            {t("authPage.hero.description")}
          </p>
          <div className="bg-white/10 p-4 rounded-lg text-white/90 text-sm">
            <h3 className="font-semibold mb-2">{t("authPage.hero.features.title")}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("authPage.hero.features.booking")}</li>
              <li>{t("authPage.hero.features.personalArea")}</li>
              <li>{t("authPage.hero.features.history")}</li>
            </ul>
          </div>
        </div>

        {/* Auth forms */}
        <div className="w-full md:w-1/2 bg-card rounded-r-lg shadow-xl">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("authPage.login.title")}</TabsTrigger>
              <TabsTrigger value="register">{t("authPage.register.title")}</TabsTrigger>
            </TabsList>

            {/* Login form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t("authPage.login.title")}</CardTitle>
                  <CardDescription>
                    {t("authPage.login.description")}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">{t("authPage.login.username")}</Label>
                      <Input
                        id="username"
                        type="text"
                        {...loginForm.register("username")}
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t("authPage.login.password")}</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("authPage.login.loggingIn")}
                        </>
                      ) : (
                        t("authPage.login.submit")
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Register form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>{t("authPage.register.title")}</CardTitle>
                  <CardDescription>
                    {t("authPage.register.description")}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-fullName">{t("authPage.register.fullName")}</Label>
                      <Input
                        id="reg-fullName"
                        type="text"
                        {...registerForm.register("fullName")}
                      />
                      {registerForm.formState.errors.fullName && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">{t("authPage.register.email")}</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">{t("authPage.register.username")}</Label>
                      <Input
                        id="reg-username"
                        type="text"
                        {...registerForm.register("username")}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">{t("authPage.register.password")}</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("authPage.register.registering")}
                        </>
                      ) : (
                        t("authPage.register.submit")
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}