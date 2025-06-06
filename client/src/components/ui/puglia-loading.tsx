import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PugliaLoadingProps {
  variant: "booking" | "gallery" | "villa-details" | "map" | "weather";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PugliaLoading({ variant, size = "md", className }: PugliaLoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  if (variant === "booking") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="bookingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1976d2" />
                <stop offset="50%" stopColor="#42a5f5" />
                <stop offset="100%" stopColor="#90caf9" />
              </linearGradient>
            </defs>
            
            {/* Calendar icon with animation */}
            <motion.rect
              x="20" y="25" width="60" height="50"
              fill="none" stroke="url(#bookingGradient)" strokeWidth="3"
              rx="5"
              animate={{ strokeDasharray: [0, 200], strokeDashoffset: [0, -200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Calendar grid */}
            {[0, 1, 2].map((row) =>
              [0, 1, 2].map((col) => (
                <motion.circle
                  key={`${row}-${col}`}
                  cx={30 + col * 15}
                  cy={40 + row * 10}
                  r="2"
                  fill="#42a5f5"
                  animate={{
                    scale: [0.5, 1, 0.5],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: (row * 3 + col) * 0.1
                  }}
                />
              ))
            )}
          </svg>
        </div>
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Verificando disponibilità...
        </motion.p>
      </div>
    );
  }

  if (variant === "gallery") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="galleryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7043" />
                <stop offset="50%" stopColor="#ffab91" />
                <stop offset="100%" stopColor="#ffccbc" />
              </linearGradient>
            </defs>
            
            {/* Photo frames */}
            {[0, 1, 2].map((i) => (
              <motion.rect
                key={i}
                x={15 + i * 20}
                y={20 + i * 10}
                width="25"
                height="20"
                fill="none"
                stroke="url(#galleryGradient)"
                strokeWidth="2"
                rx="2"
                animate={{
                  y: [20 + i * 10, 15 + i * 10, 20 + i * 10],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
            
            {/* Camera icon */}
            <motion.circle
              cx="50" cy="70"
              r="8"
              fill="url(#galleryGradient)"
              animate={{
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            />
          </svg>
        </div>
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Caricando galleria...
        </motion.p>
      </div>
    );
  }

  if (variant === "villa-details") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="villaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e7d32" />
                <stop offset="50%" stopColor="#66bb6a" />
                <stop offset="100%" stopColor="#a5d6a7" />
              </linearGradient>
            </defs>
            
            {/* Villa outline */}
            <motion.path
              d="M20,70 L50,30 L80,70 L80,85 L20,85 Z"
              fill="none"
              stroke="url(#villaGradient)"
              strokeWidth="3"
              animate={{
                pathLength: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Windows */}
            <motion.rect x="35" y="55" width="8" height="8" fill="#66bb6a" 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            />
            <motion.rect x="57" y="55" width="8" height="8" fill="#66bb6a"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.8 }}
            />
            
            {/* Door */}
            <motion.rect x="45" y="65" width="10" height="20" fill="#2e7d32"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
          </svg>
        </div>
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Caricando dettagli villa...
        </motion.p>
      </div>
    );
  }

  if (variant === "map") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0288d1" />
                <stop offset="50%" stopColor="#29b6f6" />
                <stop offset="100%" stopColor="#81d4fa" />
              </linearGradient>
            </defs>
            
            {/* Map outline */}
            <motion.rect
              x="15" y="15" width="70" height="70"
              fill="none"
              stroke="url(#mapGradient)"
              strokeWidth="2"
              rx="5"
              animate={{
                strokeDasharray: [0, 280],
                strokeDashoffset: [0, -280]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Location pins */}
            {[
              { x: 35, y: 35 },
              { x: 50, y: 50 },
              { x: 65, y: 40 }
            ].map((pin, i) => (
              <motion.circle
                key={i}
                cx={pin.x}
                cy={pin.y}
                r="4"
                fill="#0288d1"
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
              />
            ))}
          </svg>
        </div>
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Caricando mappa...
        </motion.p>
      </div>
    );
  }

  if (variant === "weather") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="weatherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffc107" />
                <stop offset="50%" stopColor="#ffeb3b" />
                <stop offset="100%" stopColor="#fff59d" />
              </linearGradient>
            </defs>
            
            {/* Sun */}
            <motion.circle
              cx="50" cy="35"
              r="12"
              fill="url(#weatherGradient)"
              animate={{
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 360]
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
            />
            
            {/* Sun rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.line
                key={i}
                x1={50 + Math.cos(angle * Math.PI / 180) * 18}
                y1={35 + Math.sin(angle * Math.PI / 180) * 18}
                x2={50 + Math.cos(angle * Math.PI / 180) * 22}
                y2={35 + Math.sin(angle * Math.PI / 180) * 22}
                stroke="#ffc107"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
            
            {/* Cloud */}
            <motion.path
              d="M25,65 Q20,60 25,55 Q30,50 40,55 Q50,50 60,55 Q65,60 60,65 Z"
              fill="#e3f2fd"
              stroke="#90caf9"
              strokeWidth="1"
              animate={{
                x: [0, 10, 0],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Caricando meteo...
        </motion.p>
      </div>
    );
  }

  return null;
}