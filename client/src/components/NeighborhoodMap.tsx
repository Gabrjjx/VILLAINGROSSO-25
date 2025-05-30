import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function NeighborhoodMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carica Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Coordinate di Villa Ingrosso, Leporano
    const villaIngrosso = { lat: 40.3742, lng: 17.3064 };

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 14,
      center: villaIngrosso,
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#0891b2" }]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#f8fafc" }]
        }
      ]
    });

    // Marker per Villa Ingrosso
    const villaMarker = new window.google.maps.Marker({
      position: villaIngrosso,
      map: map,
      title: 'Villa Ingrosso',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#0891b2" stroke="white" stroke-width="4"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="20" font-weight="bold">🏖️</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40)
      }
    });

    // Info window per Villa Ingrosso
    const villaInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #0891b2;">🏖️ Villa Ingrosso</h3>
          <p style="margin: 0; font-size: 14px;">La tua casa vacanze a 300m dal mare cristallino della costa ionica</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Leporano (TA) - Puglia</p>
        </div>
      `
    });

    villaMarker.addListener('click', () => {
      villaInfoWindow.open(map, villaMarker);
    });

    // Punti di interesse locali
    const localPOIs = [
      {
        position: { lat: 40.3758, lng: 17.3089 },
        title: 'Spiaggia di Torre Lapillo',
        type: 'beach',
        description: 'Spiaggia di sabbia bianca con mare cristallino, distante solo 5 minuti a piedi dalla villa'
      },
      {
        position: { lat: 40.3698, lng: 17.3156 },
        title: 'Punta Prosciutto',
        type: 'beach',
        description: 'Una delle spiagge più belle del Salento, perfetta per il tramonto'
      },
      {
        position: { lat: 40.3721, lng: 17.3045 },
        title: 'Ristorante da Mario',
        type: 'restaurant',
        description: 'Cucina tipica salentina con pesce fresco e specialità locali'
      },
      {
        position: { lat: 40.3734, lng: 17.3078 },
        title: 'Supermercato Conad',
        type: 'shopping',
        description: 'Supermercato per le necessità quotidiane, aperto tutti i giorni'
      },
      {
        position: { lat: 40.3789, lng: 17.3112 },
        title: 'Bar Centrale',
        type: 'cafe',
        description: 'Bar storico di Leporano, perfetto per la colazione italiana'
      },
      {
        position: { lat: 40.3945, lng: 17.2876 },
        title: 'Centro Storico Taranto',
        type: 'attraction',
        description: 'Città vecchia con castello aragonese e musei archeologici (25 min in auto)'
      }
    ];

    // Aggiungi marker per ogni POI
    localPOIs.forEach(poi => {
      const marker = new window.google.maps.Marker({
        position: poi.position,
        map: map,
        title: poi.title,
        icon: getMarkerIcon(poi.type)
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #0891b2;">${getTypeIcon(poi.type)} ${poi.title}</h4>
            <p style="margin: 0; font-size: 13px;">${poi.description}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  };

  const getMarkerIcon = (type: string) => {
    const colors: { [key: string]: string } = {
      beach: '#06b6d4',
      restaurant: '#f59e0b',
      shopping: '#8b5cf6',
      cafe: '#84cc16',
      attraction: '#ef4444'
    };

    const icons: { [key: string]: string } = {
      beach: '🏖️',
      restaurant: '🍽️',
      shopping: '🛒',
      cafe: '☕',
      attraction: '🏛️'
    };

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${colors[type] || '#6b7280'}" stroke="white" stroke-width="3"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-size="14">${icons[type] || '📍'}</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 32)
    };
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      beach: '🏖️',
      restaurant: '🍽️',
      shopping: '🛒',
      cafe: '☕',
      attraction: '🏛️'
    };
    return icons[type] || '📍';
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
      {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-600">Mappa interattiva non disponibile</p>
            <p className="text-sm text-gray-500">Configurare Google Maps API Key</p>
          </div>
        </div>
      )}
    </div>
  );
}