import { Route, Switch } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import Home from "@/pages/Home"; // Keep Home as eager import for immediate loading

// Lazy load all other pages for better performance
const NotFound = lazy(() => import("@/pages/not-found"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const LocationPage = lazy(() => import("@/pages/LocationPage"));
const RecommendationsPage = lazy(() => import("@/pages/RecommendationsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PricesPage = lazy(() => import("@/pages/PricesPage"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const AdminEmailPage = lazy(() => import("@/pages/AdminEmailPage"));
const AdminBookingForm = lazy(() => import("@/pages/AdminBookingForm"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const BookingConfirmation = lazy(() => import("@/pages/BookingConfirmation"));
const SimpleResetPasswordPage = lazy(() => import("@/pages/SimpleResetPasswordPage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));
const BlogPage = lazy(() => import("@/pages/blog-page"));
const BlogPostPage = lazy(() => import("@/pages/blog-post-page"));
const InventoryPage = lazy(() => import("@/pages/inventory-page"));
const FaqPage = lazy(() => import("@/pages/faq-page"));
const LoadingDemoPage = lazy(() => import("@/pages/loading-demo-page"));
const AnalyticsDashboard = lazy(() => import("@/pages/analytics-dashboard"));
const BackOfficePage = lazy(() => import("@/pages/back-office-page"));
const BackOfficeAuthPage = lazy(() => import("@/pages/back-office-auth-page"));

import NewsletterModal from "@/components/NewsletterModal";
import WhatsAppChat from "@/components/WhatsAppChat";
import { LoadingProvider, useLoading } from "@/context/LoadingContext";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import WaveLoader from "@/components/WaveLoader";
import SoundToggle from "@/components/SoundToggle";
import GoogleAnalyticsDebug from "./components/GoogleAnalyticsDebug";
import GoogleAnalyticsSetup from "./components/GoogleAnalyticsSetup";
import { RegistrationIncentiveBanner, RegistrationIncentivePopup } from "@/components/RegistrationIncentive";
import { initVillaAnalytics } from "@/lib/gtm-analytics";
import GTMPageWrapper from "@/components/GTMPageWrapper";

// Lightweight loading component for page transitions
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Preload critical pages after initial load
const preloadCriticalPages = () => {
  setTimeout(() => {
    import("@/pages/AboutPage");
    import("@/pages/GalleryPage");
    import("@/pages/PricesPage");
    import("@/pages/BookingPage");
    import("@/pages/ContactPage");
  }, 3000);
};

function Router() {
  return (
    <GTMPageWrapper>
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/back-office/auth" component={BackOfficeAuthPage} />
          <Route path="/back-office" component={BackOfficePage} />
          <Route path="/loading-demo" component={LoadingDemoPage} />
          <Route path="/analytics-dashboard" component={AnalyticsDashboard} />
          <Route path="/reset-password" component={SimpleResetPasswordPage} />
          <Route path="/change-password" component={ChangePasswordPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </GTMPageWrapper>
  );
}

function App() {
  // Initialize Villa Ingrosso analytics with GTM integration
  useEffect(() => {
    initVillaAnalytics();
    preloadCriticalPages();
  }, []);

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
  const { isLoading } = useLoading();
  
  return <WaveLoader isLoading={isLoading} />;
}

export default App;