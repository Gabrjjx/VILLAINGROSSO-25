import { Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AboutPage from "@/pages/AboutPage";
import GalleryPage from "@/pages/GalleryPage";
import LocationPage from "@/pages/LocationPage";
import RecommendationsPage from "@/pages/RecommendationsPage";
import ContactPage from "@/pages/ContactPage";
import Privacy from "@/pages/Privacy";
import AuthPage from "@/pages/AuthPage";
import AccountPage from "@/pages/AccountPage";
import AdminPage from "@/pages/AdminPage";
import { LoadingProvider, useLoading } from "@/context/LoadingContext";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import WaveLoader from "@/components/WaveLoader";
import SoundToggle from "@/components/SoundToggle";
// Importazione componenti di Google Analytics
import GoogleAnalyticsDebug from "./components/GoogleAnalyticsDebug";
import GoogleAnalyticsSetup from "./components/GoogleAnalyticsSetup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/location" component={LocationPage} />
      <Route path="/recommendations" component={RecommendationsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <TooltipProvider>
            <WaveLoaderWithContext />
            <SoundToggle />
            <Router />
            <Toaster />
          </TooltipProvider>
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function WaveLoaderWithContext() {
  // Import useLoading hook from context
  const { isLoading } = useLoading();
  
  return <WaveLoader isLoading={isLoading} />;
}

export default App;
