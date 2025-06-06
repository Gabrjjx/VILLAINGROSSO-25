import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VillaAnalytics from "@/lib/gtm-analytics";
import { LoadingWave } from "@/components/ui/loading-wave";
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Clock, Waves, MapPin, Calendar } from "lucide-react";

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState({
    waveAnimations: 0,
    bookingInteractions: 0,
    pageViews: 0,
    conversions: 0,
    avgLoadTime: 0
  });

  // Demo analytics tracking for wave animations
  const demoWaveAnimation = (variant: "ocean" | "sunset" | "mediterranean") => {
    VillaAnalytics.trackWaveAnimation(variant, 'analytics_demo', 1500);
    VillaAnalytics.trackLoadingDemo('wave_animation', variant, 'user_triggered');
    setTrackingData(prev => ({ ...prev, waveAnimations: prev.waveAnimations + 1 }));
  };

  const demoBookingInteraction = () => {
    VillaAnalytics.trackBookingInteraction('demo_interaction', 'analytics_page', 'demo_value');
    setTrackingData(prev => ({ ...prev, bookingInteractions: prev.bookingInteractions + 1 }));
  };

  const demoConversion = () => {
    VillaAnalytics.trackConversion('demo_booking', 150, 'EUR');
    setTrackingData(prev => ({ ...prev, conversions: prev.conversions + 1 }));
  };

  // Initialize tracking
  useEffect(() => {
    VillaAnalytics.trackPageView('/analytics-dashboard', 'Villa Ingrosso - Analytics Dashboard');
    VillaAnalytics.trackPugliaEngagement('analytics_dashboard', 'page_visit', 'admin_tools');
  }, []);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-20">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
              <CardDescription className="text-center">
                This dashboard is only accessible to administrators.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <BarChart3 className="text-blue-600" />
            Villa Ingrosso Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Comprehensive tracking and analytics for Puglia-inspired wave animations, 
            booking conversions, and user engagement metrics through Google Tag Manager.
          </p>
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wave-analytics">Wave Analytics</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="gtm-events">GTM Events</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wave Animations</CardTitle>
                  <Waves className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{trackingData.waveAnimations}</div>
                  <p className="text-xs text-muted-foreground">Puglia-inspired animations viewed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Booking Interactions</CardTitle>
                  <Calendar className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{trackingData.bookingInteractions}</div>
                  <p className="text-xs text-muted-foreground">Form interactions tracked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  <Eye className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{trackingData.pageViews}</div>
                  <p className="text-xs text-muted-foreground">SPA navigation events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{trackingData.conversions}</div>
                  <p className="text-xs text-muted-foreground">Booking conversions tracked</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Google Tag Manager Integration Status</CardTitle>
                <CardDescription>
                  Real-time status of GTM container GTM-NBVVMZK2 and tracking implementation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">GTM Container Active</span>
                    </div>
                    <Badge variant="default" className="bg-green-500">GTM-NBVVMZK2</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Google Analytics Connected</span>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-600">G-4XTWR8TM7C</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium">Wave Analytics Tracking</span>
                    </div>
                    <Badge variant="outline" className="border-purple-500 text-purple-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wave Analytics Tab */}
          <TabsContent value="wave-analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Puglia-Inspired Wave Animation Analytics</CardTitle>
                <CardDescription>
                  Track user engagement with ocean-themed loading animations throughout Villa Ingrosso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Ocean Waves</h4>
                    <LoadingWave variant="ocean" size="md" />
                    <Button 
                      className="mt-4 w-full"
                      onClick={() => demoWaveAnimation('ocean')}
                    >
                      Track Ocean Animation
                    </Button>
                  </div>

                  <div className="text-center p-6 border rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Sunset Mediterranean</h4>
                    <LoadingWave variant="sunset" size="md" />
                    <Button 
                      className="mt-4 w-full"
                      onClick={() => demoWaveAnimation('sunset')}
                    >
                      Track Sunset Animation
                    </Button>
                  </div>

                  <div className="text-center p-6 border rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Mediterranean Blue</h4>
                    <LoadingWave variant="mediterranean" size="md" />
                    <Button 
                      className="mt-4 w-full"
                      onClick={() => demoWaveAnimation('mediterranean')}
                    >
                      Track Mediterranean Animation
                    </Button>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold mb-3">Tracked Wave Events</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Event Types:</strong>
                      <ul className="mt-2 space-y-1">
                        <li>• wave_animation_view</li>
                        <li>• loading_overlay_interaction</li>
                        <li>• section_load_complete</li>
                        <li>• loading_demo_interaction</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Tracked Properties:</strong>
                      <ul className="mt-2 space-y-1">
                        <li>• Animation variant (ocean/sunset/mediterranean)</li>
                        <li>• Component name and location</li>
                        <li>• Animation duration</li>
                        <li>• User interaction timestamps</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversions Tab */}
          <TabsContent value="conversions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Conversion Tracking</CardTitle>
                <CardDescription>
                  Monitor villa booking submissions and conversion funnel performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button 
                      size="lg" 
                      className="h-20 flex flex-col"
                      onClick={demoBookingInteraction}
                    >
                      <MousePointer className="mb-2" />
                      Track Booking Interaction
                    </Button>

                    <Button 
                      size="lg" 
                      className="h-20 flex flex-col bg-green-600 hover:bg-green-700"
                      onClick={demoConversion}
                    >
                      <TrendingUp className="mb-2" />
                      Track Conversion Event
                    </Button>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h5 className="font-semibold mb-3">Conversion Events Tracked</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Booking Journey Steps:</strong>
                        <ul className="mt-2 space-y-1">
                          <li>• Form field interactions</li>
                          <li>• Date selection events</li>
                          <li>• Guest count changes</li>
                          <li>• Form submission attempts</li>
                          <li>• Successful booking completions</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Conversion Attributes:</strong>
                        <ul className="mt-2 space-y-1">
                          <li>• Booking ID and value</li>
                          <li>• Guest information</li>
                          <li>• Stay duration and dates</li>
                          <li>• Source tracking (page/referrer)</li>
                          <li>• Conversion timestamp</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GTM Events Tab */}
          <TabsContent value="gtm-events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Google Tag Manager Event Reference</CardTitle>
                <CardDescription>
                  Complete list of custom events sent to GTM container GTM-NBVVMZK2
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold text-blue-600">Animation Events</h5>
                      <div className="space-y-2 text-sm">
                        <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                          <strong>wave_animation_view</strong>
                          <p className="text-gray-600">Fired when wave animations are displayed</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                          <strong>loading_overlay_interaction</strong>
                          <p className="text-gray-600">Tracks full-screen loading overlays</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                          <strong>puglia_engagement</strong>
                          <p className="text-gray-600">General Puglia-themed element interactions</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-green-600">Booking Events</h5>
                      <div className="space-y-2 text-sm">
                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                          <strong>booking_interaction</strong>
                          <p className="text-gray-600">Form field interactions and changes</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                          <strong>booking_journey_step</strong>
                          <p className="text-gray-600">Progress through booking funnel</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                          <strong>conversion</strong>
                          <p className="text-gray-600">Successful booking submissions</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h5 className="font-semibold mb-3">Implementation Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Data Layer Integration:</strong>
                        <ul className="mt-2 space-y-1">
                          <li>• All events push to window.dataLayer</li>
                          <li>• Structured event properties</li>
                          <li>• Timestamp and page context</li>
                          <li>• Enhanced eCommerce support</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Google Analytics Sync:</strong>
                        <ul className="mt-2 space-y-1">
                          <li>• Automatic GA4 event forwarding</li>
                          <li>• Conversion tracking (AW-17038146595)</li>
                          <li>• Custom dimensions and metrics</li>
                          <li>• SPA page view tracking</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}