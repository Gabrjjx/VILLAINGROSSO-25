import { Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Privacy from "@/pages/Privacy";
import { LoadingProvider, useLoading } from "@/context/LoadingContext";
import WaveLoader from "@/components/WaveLoader";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
