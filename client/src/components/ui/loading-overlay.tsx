import { motion, AnimatePresence } from "framer-motion";
import { LoadingWave } from "./loading-wave";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  variant?: "ocean" | "sunset" | "mediterranean";
  blur?: boolean;
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  text = "Caricamento in corso...",
  variant = "ocean",
  blur = true,
  className
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            blur && "backdrop-blur-sm",
            className
          )}
          style={{
            background: variant === "ocean" 
              ? "linear-gradient(135deg, rgba(2, 136, 209, 0.1) 0%, rgba(0, 172, 193, 0.1) 50%, rgba(38, 198, 218, 0.1) 100%)"
              : variant === "sunset"
              ? "linear-gradient(135deg, rgba(255, 112, 67, 0.1) 0%, rgba(255, 138, 101, 0.1) 50%, rgba(255, 171, 145, 0.1) 100%)"
              : "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.1) 50%, rgba(100, 181, 246, 0.1) 100%)"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white/90 dark:bg-gray-900/90 rounded-2xl p-8 shadow-2xl border border-white/20"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <LoadingWave 
              size="lg" 
              text={text} 
              variant={variant}
              className="px-8"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}