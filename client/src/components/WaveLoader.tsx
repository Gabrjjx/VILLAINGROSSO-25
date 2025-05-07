import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface WaveLoaderProps {
  isLoading?: boolean;
}

export default function WaveLoader({ isLoading = true }: WaveLoaderProps) {
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    if (!isLoading) {
      // Start fade out animation
      setOpacity(0);
    } else {
      setOpacity(1);
    }
  }, [isLoading]);

  // If not loading and animation has completed (opacity at 0), don't render
  if (!isLoading && opacity === 0) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-sky-50 to-blue-100 backdrop-blur-sm overflow-hidden"
      animate={{ opacity }}
      transition={{ duration: 0.8 }}
    >
      {/* Ocean wave background effect */}
      <div className="absolute inset-0 opacity-20">
        <Wave />
      </div>
      
      <div className="relative w-32 h-32">
        {/* Ripple animations */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-sky-500/30"
            initial={{ scale: 0.5, opacity: 0.2 }}
            animate={{ 
              scale: [0.5, 1.2, 0.5], 
              opacity: [0.2, 0.5, 0.2],
              borderWidth: ["4px", "2px", "4px"]
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Main water bubble */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 shadow-lg shadow-blue-300/50"
          animate={{ 
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Small bubbles */}
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/70"
              style={{
                width: `${6 - i}px`,
                height: `${6 - i}px`,
                top: `${20 + (i * 15)}%`,
                left: `${30 + (i * 12)}%`
              }}
              animate={{ 
                y: [0, -20, 0],
                x: [0, i % 2 === 0 ? 5 : -5, 0],
                opacity: [0.5, 0.9, 0.5],
                scale: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2 + i * 0.2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
      
      {/* Floating seaweed */}
      <motion.div 
        className="absolute bottom-32 left-1/4 w-1 h-16 bg-green-600 origin-bottom"
        animate={{ 
          rotateZ: [-5, 5, -5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div 
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full rounded-bl-none"
          animate={{ 
            rotateZ: [0, 10, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-36 right-1/3 w-1 h-14 bg-green-600 origin-bottom"
        animate={{ 
          rotateZ: [5, -5, 5]
        }}
        transition={{
          duration: 2.3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div 
          className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full rounded-br-none"
          animate={{ 
            rotateZ: [0, -15, 0]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
      </motion.div>
      
      {/* Villa name with subtle wave effect */}
      <motion.div 
        className="absolute bottom-12 text-center text-sky-800 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="text-xl tracking-wider">Villa Ingrosso</p>
        <p className="text-sm text-sky-600 mt-1">Il tuo rifugio sul mare</p>
        <motion.div 
          className="flex space-x-1.5 mt-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-sky-600"
              animate={{ 
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Animated wave component
function Wave() {
  return (
    <div className="relative w-full h-full">
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-40 bg-blue-400/20"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Multiple wave shapes */}
        <svg className="absolute top-0 left-0 w-full transform -translate-y-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <motion.path
            d="M0,0 C150,20 350,0 500,20 C650,40 700,60 900,40 C1050,20 1200,40 1200,40 L1200,120 L0,120 Z" 
            fill="rgba(135, 206, 250, 0.15)"
            animate={{
              d: [
                "M0,0 C150,20 350,0 500,20 C650,40 700,60 900,40 C1050,20 1200,40 1200,40 L1200,120 L0,120 Z",
                "M0,10 C150,40 350,20 500,10 C650,0 700,20 900,30 C1050,40 1200,20 1200,20 L1200,120 L0,120 Z",
                "M0,0 C150,20 350,0 500,20 C650,40 700,60 900,40 C1050,20 1200,40 1200,40 L1200,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
        
        <svg className="absolute top-0 left-0 w-full transform -translate-y-3/4" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <motion.path
            d="M0,20 C250,40 350,20 600,30 C800,40 1000,20 1200,30 L1200,120 L0,120 Z" 
            fill="rgba(135, 206, 250, 0.2)"
            animate={{
              d: [
                "M0,20 C250,40 350,20 600,30 C800,40 1000,20 1200,30 L1200,120 L0,120 Z",
                "M0,30 C250,20 350,40 600,20 C800,10 1000,30 1200,20 L1200,120 L0,120 Z",
                "M0,20 C250,40 350,20 600,30 C800,40 1000,20 1200,30 L1200,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
}