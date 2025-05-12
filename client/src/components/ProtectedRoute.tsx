import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, useLocation } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Mostra un loader mentre verifichiamo l'autenticazione
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se l'utente non è autenticato, redirect alla pagina di login
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Se la rotta è solo per admin e l'utente non è admin, redirect alla pagina account
  if (adminOnly && !user.isAdmin) {
    return <Redirect to="/account" />;
  }

  // Se tutto è ok, mostra il contenuto della rotta protetta
  return <>{children}</>;
}

// Componente specifico per le rotte admin
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
}