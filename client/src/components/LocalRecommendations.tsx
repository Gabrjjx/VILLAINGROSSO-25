import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Phone, Globe, Car, Utensils, Coffee, ShoppingBag, Waves, Camera } from "lucide-react";
import NeighborhoodMap from './NeighborhoodMap';

// Coordinate di Villa Ingrosso a Leporano
const VILLA_COORDINATES = { lat: 40.3745, lng: 17.3098 };

const localPlaces = [
  {
    id: 1,
    name: "Torre Lapillo",
    category: "Spiagge",
    type: "beach",
    distance: "Calcolando...",
    duration: "Calcolando...",
    rating: 4.8,
    description: "Spiaggia di sabbia bianca finissima con mare cristallino e fondale basso, ideale per famiglie.",
    highlights: ["Mare cristallino", "Sabbia bianca", "Fondali bassi", "Attrezzata"],
    openHours: "Sempre aperta",
    coordinates: { lat: 40.3757, lng: 17.3089 },
    image: "/images/torre-lapillo.jpg"
  },
  {
    id: 2,
    name: "Punta Prosciutto",
    category: "Spiagge",
    type: "beach",
    distance: "Calcolando...",
    duration: "Calcolando...",
    rating: 4.9,
    description: "Una delle spiagge più fotografate del Salento, perfetta per il tramonto con vista sulle isole Cheradi.",
    highlights: ["Vista panoramica", "Tramonto mozzafiato", "Acque turchesi", "Instagrammabile"],
    openHours: "Sempre aperta",
    coordinates: { lat: 40.3698, lng: 17.3156 },
    image: "/images/punta-prosciutto.jpg"
  },
  {
    id: 3,
    name: "Centro Storico di Leporano",
    category: "Cultura",
    type: "attraction",
    distance: "Calcolando...",
    duration: "Calcolando...",
    rating: 4.3,
    description: "Centro storico con vista panoramica sul golfo di Taranto e architettura tipica pugliese.",
    highlights: ["Vista panoramica", "Architettura storica", "Belvedere", "Atmosfera autentica"],
    openHours: "Sempre accessibile",
    coordinates: { lat: 40.3789, lng: 17.3112 }
  },
  {
    id: 4,
    name: "Centro Storico di Taranto",
    category: "Cultura", 
    type: "attraction",
    distance: "Calcolando...",
    duration: "Calcolando...",
    rating: 4.5,
    description: "Città vecchia con il maestoso Castello Aragonese, cattedrale e il prestigioso Museo Archeologico Nazionale.",
    highlights: ["Castello Aragonese", "Museo Archeologico", "Centro storico", "Ponte girevole"],
    openHours: "Varia per attrazione",
    website: "www.comune.taranto.it",
    coordinates: { lat: 40.4668, lng: 17.2707 }
  },
  {
    id: 5,
    name: "Porto Cesareo",
    category: "Spiagge",
    type: "beach",
    distance: "Calcolando...",
    duration: "Calcolando...",
    rating: 4.7,
    description: "Località marina famosa per le sue acque cristalline e l'area marina protetta.",
    highlights: ["Area marina protetta", "Acque cristalline", "Snorkeling", "Spiagge attrezzate"],
    openHours: "Sempre aperta",
    coordinates: { lat: 40.2623, lng: 17.8939 }
  },
  {
    id: 6,
    name: "Gallipoli Centro Storico",
    category: "Cultura",
    type: "attraction", 
    distance: "Calcolando...",
    duration: "Calcolando...",
    rating: 4.6,
    description: "Splendida città fortificata su un'isola, con cattedrale barocca e mura di cinta medievali.",
    highlights: ["Centro storico", "Cattedrale barocca", "Mura medievali", "Porto antico"],
    openHours: "Sempre accessibile",
    coordinates: { lat: 40.0542, lng: 17.9934 }
  }
];

const categories = ["Tutte", "Spiagge", "Ristoranti", "Bar & Caffè", "Servizi", "Cultura"];

export default function LocalRecommendations() {
  const [selectedCategory, setSelectedCategory] = useState("Tutte");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placesWithDistances, setPlacesWithDistances] = useState(localPlaces);

  // Calcola le distanze reali usando Google Maps API tramite il nostro backend
  useEffect(() => {
    const calculateDistances = async () => {
      try {
        const response = await fetch('/api/calculate-distances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: VILLA_COORDINATES,
            destinations: localPlaces.map(place => place.coordinates)
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch distance data');
        }
        
        const data = await response.json();
        
        if (data.status === 'OK') {
          const updatedPlaces = localPlaces.map((place, index) => {
            const element = data.rows[0].elements[index];
            if (element.status === 'OK') {
              return {
                ...place,
                distance: element.distance.text,
                duration: element.duration.text
              };
            }
            return place;
          });
          
          setPlacesWithDistances(updatedPlaces);
        }
      } catch (error) {
        console.error('Error calculating distances:', error);
        // Fallback to basic calculation using Haversine formula
        const updatedPlaces = localPlaces.map(place => {
          const distance = calculateHaversineDistance(
            VILLA_COORDINATES.lat, 
            VILLA_COORDINATES.lng,
            place.coordinates.lat, 
            place.coordinates.lng
          );
          return {
            ...place,
            distance: `${distance.toFixed(1)} km`,
            duration: `${Math.round(distance * 3)} min in auto`
          };
        });
        setPlacesWithDistances(updatedPlaces);
      }
    };

    calculateDistances();
  }, []);

  // Calcolo distanza Haversine come fallback
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raggio della Terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredPlaces = selectedCategory === "Tutte" 
    ? placesWithDistances 
    : placesWithDistances.filter(place => place.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Spiagge": return <Waves className="h-4 w-4" />;
      case "Ristoranti": return <Utensils className="h-4 w-4" />;
      case "Bar & Caffè": return <Coffee className="h-4 w-4" />;
      case "Servizi": return <ShoppingBag className="h-4 w-4" />;
      case "Cultura": return <Camera className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "beach": return "🏖️";
      case "restaurant": return "🍽️";
      case "cafe": return "☕";
      case "shopping": return "🛒";
      case "attraction": return "🏛️";
      default: return "📍";
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Scopri il Territorio
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Villa Ingrosso ti offre l'accesso privilegiato alle meraviglie della costa ionica. 
            Scopri i nostri luoghi del cuore selezionati per te.
          </p>
        </div>

        {/* Mappa interattiva */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-600" />
            Mappa dei Luoghi di Interesse
          </h3>
          <NeighborhoodMap />
        </div>

        {/* Filtri categoria */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2 ${
                selectedCategory === category 
                  ? "bg-cyan-600 hover:bg-cyan-700" 
                  : "hover:bg-cyan-50"
              }`}
            >
              {getCategoryIcon(category)}
              {category}
            </Button>
          ))}
        </div>

        {/* Griglia luoghi */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <Card key={place.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(place.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{place.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {place.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{place.rating}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {place.description}
                </CardDescription>

                {/* Distanza e tempo */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {place.distance}
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    {place.duration}
                  </div>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1">
                  {place.highlights.slice(0, 3).map((highlight, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                {/* Orari */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {place.openHours}
                </div>

                {/* Contatti */}
                <div className="space-y-1">
                  {place.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`tel:${place.phone}`}
                        className="text-cyan-600 hover:underline"
                      >
                        {place.phone}
                      </a>
                    </div>
                  )}
                  {place.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a 
                        href={`https://${place.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 hover:underline"
                      >
                        {place.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Suggerimenti aggiuntivi */}
        <div className="mt-12 bg-cyan-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            💡 Consigli degli Host
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>🌅 Miglior momento per le spiagge:</strong> Mattino presto o tardo pomeriggio per evitare la folla
            </div>
            <div>
              <strong>🍽️ Prenotazioni ristoranti:</strong> Consigliamo di prenotare, specialmente nei weekend
            </div>
            <div>
              <strong>🚗 Parcheggio:</strong> Nelle spiagge principali può essere limitato in alta stagione
            </div>
            <div>
              <strong>💰 Pagamenti:</strong> Molti locali accettano solo contanti, soprattutto al mare
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}