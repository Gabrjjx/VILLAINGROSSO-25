import { useEffect } from 'react';
import { useLocation } from 'wouter';
import VillaAnalytics from '@/lib/gtm-analytics';

// Custom hook to ensure GTM tracking on every page
export const useGTMPageTracking = (pageName?: string, additionalData?: Record<string, any>) => {
  const [location] = useLocation();

  useEffect(() => {
    // Track page view with GTM
    const title = document.title || `Villa Ingrosso - ${pageName || 'Page'}`;
    VillaAnalytics.trackPageView(location, title);

    // Track additional page-specific data if provided
    if (additionalData) {
      VillaAnalytics.trackPugliaEngagement(
        additionalData.elementType || 'page',
        additionalData.action || 'page_load',
        additionalData.category || 'navigation'
      );
    }

    // Send general page engagement event
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'page_engagement',
        page_path: location,
        page_title: title,
        page_name: pageName || location.replace('/', '') || 'home',
        timestamp: new Date().toISOString(),
        ...additionalData
      });
    }
  }, [location, pageName, additionalData]);
};

export default useGTMPageTracking;