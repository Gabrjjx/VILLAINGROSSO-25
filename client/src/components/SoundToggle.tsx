import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { createWaveSound } from '../utils/createWaveSound';

// Import audio files directly (Vite will handle this correctly)
import oceanWavesSound from '../assets/ocean-waves.mp3';
import oceanWavesAltSound from '../assets/ocean-waves-alt.mp3';

// Audio files array
const BEACH_SOUNDS_URLS = [
  oceanWavesSound,
  oceanWavesAltSound
];

export default function SoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [usingSynthSound, setUsingSynthSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectURLRef = useRef<string | null>(null);
  
  // Initialize audio on component mount
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audio.preload = 'auto';
    
    let currentUrlIndex = 0;
    const tryNextAudioSource = () => {
      if (currentUrlIndex < BEACH_SOUNDS_URLS.length) {
        // Try the next audio file in our list
        audio.src = BEACH_SOUNDS_URLS[currentUrlIndex];
        currentUrlIndex++;
      } else {
        // If we've tried all files, generate a synthetic sound
        generateSyntheticSound();
      }
    };
    
    const generateSyntheticSound = async () => {
      console.log("Trying to generate synthetic ocean sounds...");
      try {
        // Generate a synthetic ocean sound
        const soundBlob = await createWaveSound();
        
        // Create an object URL for the blob
        const objectURL = URL.createObjectURL(soundBlob);
        audioObjectURLRef.current = objectURL;
        
        // Use the generated sound
        audio.src = objectURL;
        setUsingSynthSound(true);
      } catch (synthError) {
        console.error('Failed to create synthetic sound:', synthError);
        setIsLoaded(false);
      }
    };
    
    // Set up event listeners
    audio.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
    });
    
    audio.addEventListener('error', (e) => {
      console.warn(`Error loading audio file ${currentUrlIndex-1}: ${BEACH_SOUNDS_URLS[currentUrlIndex-1]}`, e);
      tryNextAudioSource();
    });
    
    // Start with the first audio source
    tryNextAudioSource();
    
    audioRef.current = audio;
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.remove();
      }
      
      // Revoke object URL if we created one
      if (audioObjectURLRef.current) {
        URL.revokeObjectURL(audioObjectURLRef.current);
      }
    };
  }, []);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  const togglePlay = () => {
    if (!audioRef.current || !isLoaded) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // We use the play() Promise to handle autoplay restrictions
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Audio playback error:', error);
            // Often this is due to browser autoplay policy, 
            // where user interaction is required
          });
      }
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
  
  // Animation variants
  const waveVariants = {
    playing: (i: number) => ({
      y: [0, -5, 0],
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const
      }
    }),
    paused: { y: 0 }
  };

  return (
    <div className="fixed right-6 bottom-6 z-40 flex flex-col items-center">
      {/* Sound wave animation */}
      <div className="mb-2 flex items-end justify-center h-8 space-x-0.5">
        {isPlaying && Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-cyan-500 rounded-full"
            style={{ 
              height: `${12 + (i % 3) * 4}px`,
              opacity: 0.6 + (i * 0.08)
            }}
            variants={waveVariants}
            animate="playing"
            custom={i}
          />
        ))}
      </div>
      
      {/* Sound toggle button */}
      <motion.button
        className="relative flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm bg-white/20 border border-white/30 shadow-md"
        onClick={togglePlay}
        whileTap={{ scale: 0.9 }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 0 15px 2px rgba(103, 232, 249, 0.3)" 
        }}
        disabled={!isLoaded}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-cyan-600" />
        ) : (
          <VolumeX className="w-5 h-5 text-cyan-600" />
        )}
        
        {/* Ripple effect when sound is on */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ 
              opacity: 0, 
              scale: 1.5,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </motion.button>
      
      {/* Volume slider (appears when sound is playing) */}
      {isPlaying && (
        <motion.div 
          className="mt-3 bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30 shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 accent-cyan-500 cursor-pointer"
          />
        </motion.div>
      )}
      
      {/* Label */}
      <motion.div 
        className="absolute top-0 -translate-y-full mb-1 text-xs font-medium text-cyan-700 opacity-80"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPlaying ? 0.8 : 0 }}
      >
        {isPlaying ? (usingSynthSound ? "Suoni del mare (generati)" : "Suoni del mare") : ""}
      </motion.div>
    </div>
  );
}