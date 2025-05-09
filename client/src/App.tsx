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
import { LoadingProvider, useLoading } from "@/context/LoadingContext";
import WaveLoader from "@/components/WaveLoader";
import SoundToggle from "@/components/SoundToggle";
// Importazione relativa per risolvere problema di moduli
import GoogleAnalyticsDebug from "./components/GoogleAnalyticsDebug";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LoadingProvider>
      <TooltipProvider>
        <WaveLoaderWithContext />
        <SoundToggle />
        <GoogleAnalyticsDebug />
        <Router />
      </TooltipProvider>
    </LoadingProvider>
  );
}

function WaveLoaderWithContext() {
  // Import useLoading hook from context
  const { isLoading } = useLoading();
  
  return <WaveLoader isLoading={isLoading} />;
}

export default App;
