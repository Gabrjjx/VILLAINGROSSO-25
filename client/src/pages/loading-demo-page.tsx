import { useState } from "react";
import { motion } from "framer-motion";
import { LoadingWave } from "@/components/ui/loading-wave";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { LoadingSkeleton, LoadingGrid, LoadingList } from "@/components/ui/loading-skeleton";
import { PugliaLoading } from "@/components/ui/puglia-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoadingDemoPage() {
  const { t } = useLanguage();
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<"ocean" | "sunset" | "mediterranean">("ocean");

  const variants = [
    { key: "ocean", name: "Ocean (Costa Ionica)", color: "bg-blue-500" },
    { key: "sunset", name: "Sunset (Tramonto Pugliese)", color: "bg-orange-500" },
    { key: "mediterranean", name: "Mediterranean (Mare Nostrum)", color: "bg-cyan-500" }
  ] as const;

  const pugliaVariants = [
    { key: "booking", name: "Booking Animation" },
    { key: "gallery", name: "Gallery Loading" },
    { key: "villa-details", name: "Villa Details" },
    { key: "map", name: "Map Loading" },
    { key: "weather", name: "Weather Info" }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      
      <LoadingOverlay 
        isVisible={showOverlay} 
        text="Demonstrating Villa Ingrosso Loading System..." 
        variant={selectedVariant}
      />

      <div className="container mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Puglia-Inspired Wave Loading Animations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Immersive loading transitions that capture the essence of the Ionian coast, 
            featuring fluid wave motifs and Mediterranean color palettes for Villa Ingrosso.
          </p>
        </motion.div>

        <Tabs defaultValue="wave-animations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wave-animations">Wave Animations</TabsTrigger>
            <TabsTrigger value="puglia-loading">Puglia Loading</TabsTrigger>
            <TabsTrigger value="skeletons">Skeleton States</TabsTrigger>
            <TabsTrigger value="overlay-demo">Overlay System</TabsTrigger>
          </TabsList>

          {/* Wave Animations Tab */}
          <TabsContent value="wave-animations" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Primary Wave Loading Components</CardTitle>
                <CardDescription>
                  Core wave animations inspired by the Ionian Sea waters around Leporano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {variants.map((variant) => (
                    <motion.div
                      key={variant.key}
                      className="text-center p-6 bg-white rounded-lg shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-lg font-semibold mb-4">{variant.name}</h3>
                      <LoadingWave 
                        size="lg" 
                        variant={variant.key}
                        text={`Loading ${variant.name.toLowerCase()}...`}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Size Variations</h4>
                  <div className="flex justify-center items-end space-x-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Small</p>
                      <LoadingWave size="sm" variant="ocean" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Medium</p>
                      <LoadingWave size="md" variant="ocean" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Large</p>
                      <LoadingWave size="lg" variant="ocean" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Extra Large</p>
                      <LoadingWave size="xl" variant="ocean" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Puglia Loading Tab */}
          <TabsContent value="puglia-loading" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Specialized Puglia Loading States</CardTitle>
                <CardDescription>
                  Context-specific animations for different Villa Ingrosso features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pugliaVariants.map((variant) => (
                    <motion.div
                      key={variant.key}
                      className="text-center p-6 bg-white rounded-lg shadow-lg border"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-lg font-semibold mb-4">{variant.name}</h3>
                      <PugliaLoading 
                        variant={variant.key as any}
                        size="md"
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skeleton States Tab */}
          <TabsContent value="skeletons" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Skeleton Loading States</CardTitle>
                <CardDescription>
                  Animated placeholders for content loading
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Villa Content Skeleton</h4>
                  <LoadingSkeleton variant="villa" />
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Card Grid Loading</h4>
                  <LoadingGrid items={6} columns={3} />
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">List Loading</h4>
                  <LoadingList items={4} showAvatar={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overlay Demo Tab */}
          <TabsContent value="overlay-demo" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Full-Screen Loading Overlay</CardTitle>
                <CardDescription>
                  Immersive loading experiences for page transitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Color Variants</h4>
                    <div className="flex flex-wrap gap-3">
                      {variants.map((variant) => (
                        <Button
                          key={variant.key}
                          variant={selectedVariant === variant.key ? "default" : "outline"}
                          onClick={() => setSelectedVariant(variant.key)}
                          className="flex items-center space-x-2"
                        >
                          <div className={`w-3 h-3 rounded-full ${variant.color}`} />
                          <span>{variant.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Demo Overlay</h4>
                    <Button 
                      onClick={() => {
                        setShowOverlay(true);
                        setTimeout(() => setShowOverlay(false), 3000);
                      }}
                      size="lg"
                      className="w-full md:w-auto"
                    >
                      Show {selectedVariant} Loading Overlay (3s)
                    </Button>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h5 className="font-semibold mb-3">Usage Examples</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• <strong>Ocean:</strong> General page loading, villa details</li>
                      <li>• <strong>Sunset:</strong> Gallery image loading, photo uploads</li>
                      <li>• <strong>Mediterranean:</strong> Booking processing, form submissions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Implementation Complete</h3>
              <p className="text-blue-100">
                All loading animations are now integrated throughout Villa Ingrosso, 
                providing a cohesive and immersive user experience that reflects 
                the beauty of the Puglia coastline.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}