import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { createWaveSound } from '../utils/createWaveSound';

export default function SoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [usingSynthSound, setUsingSynthSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectURLRef = useRef<string | null>(null);
  
  // Create synthetic sound on first render
  useEffect(() => {
    const generateSyntheticSound = async () => {
      try {
        console.log("Generating synthetic ocean sounds as backup...");
        // Generate a synthetic ocean sound
        const soundBlob = await createWaveSound();
        
        // Create an object URL for the blob
        const objectURL = URL.createObjectURL(soundBlob);
        audioObjectURLRef.current = objectURL;
        
        // Create a backup audio element with synthetic sound
        const synthAudio = new Audio(objectURL);
        synthAudio.loop = true;
        synthAudio.volume = volume;
        synthAudioRef.current = synthAudio;
        
        // Set as loaded even if real audio fails
        if (!isLoaded) {
          setIsLoaded(true);
          setUsingSynthSound(true);
        }
      } catch (synthError) {
        console.error('Failed to create synthetic sound:', synthError);
      }
    };
    
    // Generate synthetic sound as a backup
    generateSyntheticSound();
    
    // Cleanup on unmount
    return () => {
      if (synthAudioRef.current) {
        synthAudioRef.current.pause();
        synthAudioRef.current.src = '';
      }
      
      // Revoke object URL if we created one
      if (audioObjectURLRef.current) {
        URL.revokeObjectURL(audioObjectURLRef.current);
      }
    };
  }, []);
  
  // Handle audio element load and error events
  useEffect(() => {
    if (!audioRef.current) return;
    
    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      setUsingSynthSound(false);
    };
    
    const handleError = () => {
      console.warn("Real audio file couldn't be loaded, using synthetic sound");
      if (synthAudioRef.current) {
        setUsingSynthSound(true);
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    };
    
    audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough);
    audioRef.current.addEventListener('error', handleError);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, []);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    
    if (synthAudioRef.current) {
      synthAudioRef.current.volume = volume;
    }
  }, [volume]);
  
  const togglePlay = () => {
    // If real audio is loaded
    if (!isLoaded) return;
    
    if (isPlaying) {
      // Stop whichever audio is playing
      if (!usingSynthSound && audioRef.current) {
        audioRef.current.pause();
      } else if (synthAudioRef.current) {
        synthAudioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Play the appropriate audio
      const audio = usingSynthSound ? synthAudioRef.current : audioRef.current;
      
      if (!audio) return;
      
      // We use the play() Promise to handle autoplay restrictions
      const playPromise = audio.play();
      
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
      {/* Hidden audio element for loading real ocean sounds */}
      <audio 
        ref={audioRef}
        preload="auto"
        loop
        src="/audio/ocean-waves-alt.mp3"
        style={{ display: 'none' }}
      />
      
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