import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingWaveProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "ocean" | "sunset" | "mediterranean";
}

export function LoadingWave({ 
  size = "md", 
  className,
  text = "Caricamento...",
  variant = "ocean"
}: LoadingWaveProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32",
    xl: "w-48 h-48"
  };

  const colorVariants = {
    ocean: {
      primary: "#0288d1",
      secondary: "#00acc1", 
      tertiary: "#26c6da",
      accent: "#4dd0e1"
    },
    sunset: {
      primary: "#ff7043",
      secondary: "#ff8a65",
      tertiary: "#ffab91", 
      accent: "#ffccbc"
    },
    mediterranean: {
      primary: "#1976d2",
      secondary: "#42a5f5",
      tertiary: "#64b5f6",
      accent: "#90caf9"
    }
  };

  const colors = colorVariants[variant];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4",
      className
    )}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Wave Animation Container */}
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`oceanGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="50%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.tertiary} />
            </linearGradient>
            
            <filter id={`glow-${variant}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Primary Wave */}
          <motion.path
            d="M10,50 Q30,30 50,50 T90,50 L90,90 L10,90 Z"
            fill={`url(#oceanGradient-${variant})`}
            filter={`url(#glow-${variant})`}
            animate={{
              d: [
                "M10,50 Q30,30 50,50 T90,50 L90,90 L10,90 Z",
                "M10,50 Q30,70 50,50 T90,50 L90,90 L10,90 Z",
                "M10,50 Q30,30 50,50 T90,50 L90,90 L10,90 Z"
              ]
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />

          {/* Secondary Wave */}
          <motion.path
            d="M10,60 Q25,40 50,60 T90,60 L90,90 L10,90 Z"
            fill={colors.secondary}
            opacity={0.7}
            animate={{
              d: [
                "M10,60 Q25,40 50,60 T90,60 L90,90 L10,90 Z",
                "M10,60 Q25,80 50,60 T90,60 L90,90 L10,90 Z", 
                "M10,60 Q25,40 50,60 T90,60 L90,90 L10,90 Z"
              ]
            }}
            transition={{
              duration: 3.5,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0.5
            }}
          />

          {/* Tertiary Wave */}
          <motion.path
            d="M10,70 Q35,50 50,70 T90,70 L90,90 L10,90 Z"
            fill={colors.tertiary}
            opacity={0.5}
            animate={{
              d: [
                "M10,70 Q35,50 50,70 T90,70 L90,90 L10,90 Z",
                "M10,70 Q35,90 50,70 T90,70 L90,90 L10,90 Z",
                "M10,70 Q35,50 50,70 T90,70 L90,90 L10,90 Z"
              ]
            }}
            transition={{
              duration: 4,
              ease: "easeInOut", 
              repeat: Infinity,
              delay: 1
            }}
          />

          {/* Floating Elements (representing sea foam/bubbles) */}
          <motion.circle
            cx="25"
            cy="40"
            r="2"
            fill={colors.accent}
            opacity={0.8}
            animate={{
              cy: [40, 20, 40],
              opacity: [0.8, 0.3, 0.8]
            }}
            transition={{
              duration: 2.5,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />

          <motion.circle
            cx="75"
            cy="35"
            r="1.5"
            fill={colors.accent}
            opacity={0.6}
            animate={{
              cy: [35, 15, 35],
              opacity: [0.6, 0.2, 0.6]
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0.8
            }}
          />

          <motion.circle
            cx="50"
            cy="25"
            r="1"
            fill={colors.accent}
            opacity={0.9}
            animate={{
              cy: [25, 5, 25],
              opacity: [0.9, 0.1, 0.9]
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.5
            }}
          />
        </svg>

        {/* Central Logo/Icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            y: [0, -3, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity
          }}
        >
          <div 
            className="text-white font-bold text-lg drop-shadow-lg"
            style={{ fontSize: size === "sm" ? "0.75rem" : size === "md" ? "1rem" : size === "lg" ? "1.25rem" : "1.5rem" }}
          >
            🏖️
          </div>
        </motion.div>
      </div>

      {/* Loading Text */}
      {text && (
        <motion.p
          className="text-center font-medium text-gray-700 dark:text-gray-300"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity
          }}
        >
          {text}
        </motion.p>
      )}

      {/* Animated Dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}