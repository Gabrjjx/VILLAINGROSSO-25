// Google Tag Manager and Analytics Integration for Villa Ingrosso
// Tracks user interactions with Puglia-inspired wave animations and booking flow

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    gtm: {
      start: number;
      uniqueEventId: number;
    };
  }
}

// Enhanced analytics tracking for Villa Ingrosso features
export class VillaAnalytics {
  
  // Track wave loading animation views
  static trackWaveAnimation(variant: string, component: string, duration?: number) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'wave_animation_view',
        animation_variant: variant,
        component_name: component,
        animation_duration: duration || null,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track booking form interactions
  static trackBookingInteraction(action: string, step: string, value?: any) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'booking_interaction',
        booking_action: action,
        booking_step: step,
        booking_value: value || null,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track villa gallery interactions
  static trackGalleryView(imageIndex: number, imageSource: string) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'gallery_interaction',
        image_index: imageIndex,
        image_source: imageSource,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track loading overlay interactions
  static trackLoadingOverlay(isVisible: boolean, variant: string, text: string) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'loading_overlay_interaction',
        overlay_visible: isVisible,
        overlay_variant: variant,
        overlay_text: text,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track page section loading with wave animations
  static trackSectionLoad(sectionName: string, loadTime: number, hasWaveAnimation: boolean) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'section_load_complete',
        section_name: sectionName,
        load_time_ms: loadTime,
        has_wave_animation: hasWaveAnimation,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track user engagement with Puglia-themed elements
  static trackPugliaEngagement(elementType: string, action: string, category: string) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'puglia_engagement',
        element_type: elementType,
        engagement_action: action,
        engagement_category: category,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track villa inquiry submissions
  static trackVillaInquiry(inquiryType: string, source: string, success: boolean) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'villa_inquiry_submission',
        inquiry_type: inquiryType,
        inquiry_source: source,
        submission_success: success,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track language switching
  static trackLanguageSwitch(fromLanguage: string, toLanguage: string) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'language_switch',
        from_language: fromLanguage,
        to_language: toLanguage,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track loading demo page interactions
  static trackLoadingDemo(demoType: string, variant: string, userAction: string) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'loading_demo_interaction',
        demo_type: demoType,
        demo_variant: variant,
        user_action: userAction,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track conversion events (bookings, inquiries, newsletter signup)
  static trackConversion(conversionType: string, value?: number, currency?: string) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'conversion',
        conversion_type: conversionType,
        conversion_value: value || null,
        conversion_currency: currency || 'EUR',
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });

      // Also send to Google Analytics conversion tracking
      if (window.gtag && conversionType === 'booking') {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-17038146595/T1_zCLvx5r4aEKP4tbw_'
        });
      }
    }
  }

  // Track user journey through villa booking process
  static trackBookingJourney(step: string, stepNumber: number, totalSteps: number) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'booking_journey_step',
        journey_step: step,
        step_number: stepNumber,
        total_steps: totalSteps,
        journey_progress: Math.round((stepNumber / totalSteps) * 100),
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Enhanced page view tracking for SPA
  static trackPageView(path: string, title?: string) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'virtual_page_view',
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
        timestamp: new Date().toISOString()
      });

      // Also update Google Analytics
      if (window.gtag) {
        window.gtag('config', 'G-4XTWR8TM7C', {
          page_path: path,
          page_title: title
        });
      }
    }
  }
}

// Initialize enhanced tracking on page load
export const initVillaAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Track initial page load with wave animations
    VillaAnalytics.trackPageView(window.location.pathname);
    
    // Track if user has wave animations enabled
    VillaAnalytics.trackPugliaEngagement('wave_system', 'initialized', 'loading_animations');
    
    console.log('Villa Ingrosso Analytics initialized with GTM integration');
  }
};

export default VillaAnalytics;