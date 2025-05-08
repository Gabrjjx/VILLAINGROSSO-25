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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-sky-100 to-cyan-200 backdrop-blur-sm overflow-hidden"
      animate={{ opacity }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced ocean background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
        <Wave />
      </div>
      
      {/* Sailing boat */}
      <motion.div 
        className="absolute w-24 h-24 top-[35%] left-[15%]"
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 3, 0, -3, 0]
        }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <div className="relative w-full h-full">
          {/* Boat body */}
          <div className="absolute bottom-0 w-20 h-6 bg-amber-800 rounded-b-full rounded-t-lg"></div>
          
          {/* Sail */}
          <div className="absolute bottom-5 left-5 w-0 h-0 border-l-[30px] border-l-transparent border-b-[60px] border-b-white"></div>
          <div className="absolute bottom-5 left-8 w-0 h-0 border-l-[20px] border-l-white border-b-[40px] border-b-transparent"></div>
          
          {/* Mast */}
          <div className="absolute bottom-5 left-10 w-1 h-16 bg-amber-900"></div>
        </div>
      </motion.div>
      
      {/* Larger sea-themed center element */}
      <div className="relative w-40 h-40">
        {/* Sea ripple animations */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-cyan-500/30"
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
        
        {/* Main sea circle */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-lg shadow-blue-300/50 overflow-hidden"
          animate={{ 
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Waves inside circle */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-white/10"
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg className="absolute top-0 left-0 w-full transform -translate-y-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <motion.path
                d="M0,0 C15,5 35,0 50,5 C65,10 85,5 100,10 L100,20 L0,20 Z"
                fill="rgba(255, 255, 255, 0.2)"
                animate={{
                  d: [
                    "M0,0 C15,5 35,0 50,5 C65,10 85,5 100,10 L100,20 L0,20 Z",
                    "M0,5 C15,0 35,5 50,0 C65,5 85,10 100,5 L100,20 L0,20 Z",
                    "M0,0 C15,5 35,0 50,5 C65,10 85,5 100,10 L100,20 L0,20 Z"
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
          
          {/* Fish silhouette */}
          <motion.div
            className="absolute w-8 h-4"
            style={{
              top: '30%',
              left: '20%',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '60% 70% 70% 60%',
              transform: 'skew(-10deg)'
            }}
            animate={{
              x: [0, 40, 0],
              rotateY: [0, 180, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div 
              className="absolute right-0 top-1/2 w-2 h-3"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '60% 0 0 60%',
                transform: 'translateY(-50%)'
              }}
            ></div>
          </motion.div>
          
          {/* Bubbles */}
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/70"
              style={{
                width: `${6 - i % 3}px`,
                height: `${6 - i % 3}px`,
                top: `${15 + (i * 12)}%`,
                left: `${10 + (i * 15 % 60)}%`
              }}
              animate={{ 
                y: [0, -30, -60],
                x: [0, i % 2 === 0 ? 10 : -10, 0],
                opacity: [0.7, 0.9, 0],
                scale: [0.8, 1, 1.2]
              }}
              transition={{
                duration: 2 + i * 0.3,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
      
      {/* More seaweed and sea elements */}
      <motion.div 
        className="absolute bottom-32 left-1/4 w-1.5 h-20 bg-green-600 origin-bottom"
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
          className="absolute -top-1 -right-2 w-5 h-5 bg-green-500 rounded-full rounded-bl-none"
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
        <motion.div 
          className="absolute -top-4 right-0 w-4 h-4 bg-green-500 rounded-full rounded-bl-none"
          animate={{ 
            rotateZ: [0, -15, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-36 right-1/3 w-1.5 h-24 bg-green-600 origin-bottom"
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
          className="absolute -top-1 -left-2 w-5 h-5 bg-green-500 rounded-full rounded-br-none"
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
        <motion.div 
          className="absolute -top-5 left-0 w-4 h-4 bg-green-500 rounded-full rounded-br-none"
          animate={{ 
            rotateZ: [0, 10, 0]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4
          }}
        />
      </motion.div>
      
      {/* Villa name with themed styling */}
      <motion.div 
        className="absolute bottom-16 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="text-3xl font-display tracking-wider text-blue-800">
          Villa Ingrosso
        </p>
        <p className="text-lg text-blue-600 font-light mt-2">
          Un paradiso sul Mar Ionio
        </p>
        <motion.div 
          className="flex space-x-3 mt-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-cyan-500"
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