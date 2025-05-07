import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type LoadingContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  
  // Auto-stop loading on initial page load after resources are loaded
  useEffect(() => {
    // Wait for all page resources to load
    const handleLoad = () => {
      // Small delay for smoother UX
      setTimeout(() => {
        stopLoading();
      }, 1500); // Show animation for at least 1.5 seconds
    };
    
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);
  
  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}