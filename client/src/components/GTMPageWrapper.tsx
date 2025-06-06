import { useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    // Ensure GTM tracking fires on every page load
    const title = document.title || `Villa Ingrosso - ${pageName || 'Page'}`;
    const pageData = {
      page_path: location,
      page_title: title,
      page_name: pageName || location.replace('/', '') || 'home',
      page_category: pageCategory || 'general',
      timestamp: new Date().toISOString()
    };

    // Track with Villa Analytics system
    VillaAnalytics.trackPageView(location, title);
    
    // Send direct GTM event
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'villa_page_view',
        ...pageData
      });
    }

    // Track page engagement
    VillaAnalytics.trackPugliaEngagement(
      pageCategory || 'page',
      'page_load',
      pageName || 'navigation'
    );

  }, [location, pageName, pageCategory]);

  return <>{children}</>;
}

export default GTMPageWrapper;