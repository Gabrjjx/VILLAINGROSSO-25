import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/LanguageContext";

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <Toaster />
    <App />
  </LanguageProvider>
);
