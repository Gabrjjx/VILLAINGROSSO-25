import { useEffect, ReactNode, useMemo } from 'react';
import { useLocation } from 'wouter';
import VillaAnalytics from '@/lib/gtm-analytics';

interface GTMPageWrapperProps {
  children: ReactNode;
  pageName?: string;
  pageCategory?: string;
}

// Universal wrapper component to ensure GTM tracking on every page
export function GTMPageWrapper({ children, pageName, pageCategory }: GTMPageWrapperProps) {
  const [location] = useLocation();

  // Memoize page data to avoid recalculations
  const pageData = useMemo(() => {
    const title = document.title || `Villa Ingrosso - ${pageName || 'Page'}`;
    return {
      page_path: location,
      page_title: title,
      page_name: pageName || location.replace('/', '') || 'home',
      page_category: pageCategory || 'general'
    };
  }, [location, pageName, pageCategory]);

  useEffect(() => {
    // Debounce analytics calls to avoid flooding
    const trackingTimer = setTimeout(() => {
      // Track with Villa Analytics system
      VillaAnalytics.trackPageView(pageData.page_path, pageData.page_title);
      
      // Send direct GTM event only if dataLayer exists
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'villa_page_view',
          ...pageData,
          timestamp: new Date().toISOString()
        });
      }
    }, 100);

    return () => clearTimeout(trackingTimer);
  }, [pageData]);

  return <>{children}</>;
}

export default GTMPageWrapper;