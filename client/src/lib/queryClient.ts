import { QueryClient } from "@tanstack/react-query";

// Crea un'istanza di QueryClient per gestire le query React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10 * 60 * 1000, // 10 minuti per dati statici
      gcTime: 15 * 60 * 1000, // 15 minuti in cache (gcTime in v5)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface ApiRequestOptions {
  on401?: "throw" | "returnNull";
}

// Definisci una funzione helper per gestire le richieste API
export const apiRequest = async (
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  body?: any
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  
  // Aggiungi il token JWT all'header Authorization se esiste nel localStorage
  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "same-origin",
    mode: "same-origin",
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Solo per POST/PUT/PATCH/DELETE aggiungiamo timestamp per evitare cache
  let finalUrl = url;
  if (method !== "GET") {
    const timestamp = new Date().getTime();
    finalUrl = url.includes("?") 
      ? `${url}&_t=${timestamp}` 
      : `${url}?_t=${timestamp}`;
  }

  // Log dell'API request
  console.log(`API Request: ${method} ${finalUrl} ${authToken ? '(with JWT)' : '(without JWT)'}`);
  
  return fetch(finalUrl, config);
};

// Funzione getQueryFn per usare con useQuery
export const getQueryFn = (options?: ApiRequestOptions) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [endpoint, ...params] = queryKey;
    let url = endpoint as string;
    
    // Se ci sono parametri nel queryKey, considera l'endpoint come un modello di URL
    if (params.length && url.includes("{}")) {
      url = params.reduce(
        (acc: string, param) => acc.replace("{}", param.toString()),
        url
      );
    }

    const res = await apiRequest("GET", url);
    
    if (!res.ok) {
      if (res.status === 401 && options?.on401 === "returnNull") {
        return null;
      }
      
      const data = await res.json().catch(() => ({}));
      const message = data.error || `Request failed with status ${res.status}`;
      throw new Error(message);
    }
    
    return res.json();
  };
};