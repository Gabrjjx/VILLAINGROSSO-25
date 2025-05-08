import { Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AboutPage from "@/pages/AboutPage";
import GalleryPage2 from "@/pages/GalleryPage2";
import LocationPage2 from "@/pages/LocationPage2";
import RecommendationsPage from "@/pages/RecommendationsPage";
import ContactPage from "@/pages/ContactPage";
import Privacy from "@/pages/Privacy";
import { LoadingProvider, useLoading } from "@/context/LoadingContext";
import WaveLoader from "@/components/WaveLoader";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/gallery" component={GalleryPage2} />
      <Route path="/location" component={LocationPage2} />
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
