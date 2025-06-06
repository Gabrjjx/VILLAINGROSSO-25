import { Route, Switch } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AboutPage from "@/pages/AboutPage";
import GalleryPage from "@/pages/GalleryPage";
import LocationPage from "@/pages/LocationPage";
import RecommendationsPage from "@/pages/RecommendationsPage";
import ContactPage from "@/pages/ContactPage";
import PricesPage from "@/pages/PricesPage";
import Privacy from "@/pages/Privacy";
import AuthPage from "@/pages/AuthPage";
import AccountPage from "@/pages/AccountPage";
import AdminPage from "@/pages/AdminPage";
import AdminEmailPage from "@/pages/AdminEmailPage";
import AdminBookingForm from "@/pages/AdminBookingForm";
import BookingPage from "@/pages/BookingPage";
import BookingConfirmation from "@/pages/BookingConfirmation";
import SimpleResetPasswordPage from "@/pages/SimpleResetPasswordPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import BlogPage from "@/pages/blog-page";
import BlogPostPage from "@/pages/blog-post-page";
import InventoryPage from "@/pages/inventory-page";
import FaqPage from "@/pages/faq-page";
import LoadingDemoPage from "@/pages/loading-demo-page";
import NewsletterModal from "@/components/NewsletterModal";
import WhatsAppChat from "@/components/WhatsAppChat";
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
import { RegistrationIncentiveBanner, RegistrationIncentivePopup } from "@/components/RegistrationIncentive";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/location" component={LocationPage} />
      <Route path="/recommendations" component={RecommendationsPage} />
      <Route path="/prices" component={PricesPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/email" component={AdminEmailPage} />
      <Route path="/admin/booking" component={AdminBookingForm} />
      <Route path="/booking" component={BookingPage} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/inventory" component={InventoryPage} />
      <Route path="/faq" component={FaqPage} />
      <Route path="/loading-demo" component={LoadingDemoPage} />
      <Route path="/reset-password" component={SimpleResetPasswordPage} />
      <Route path="/change-password" component={ChangePasswordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <WaveLoaderWithContext />
          <SoundToggle />

          <Router />
          <RegistrationIncentivePopup />
          <NewsletterModal />
          <WhatsAppChat />
          <Toaster />
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
