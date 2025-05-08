/**
 * This utility generates a basic wave sound for development purposes.
 * In a production environment, we would use a real ocean waves audio file.
 */

export async function createWaveSound(): Promise<Blob> {
  // Check if AudioContext is available
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    throw new Error('AudioContext is not supported in this browser');
  }

  // Create audio context and buffer
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();
  const bufferSize = audioContext.sampleRate * 10; // 10 seconds of audio
  const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
  
  // Generate wave sound data
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    
    // Fill with wave pattern
    for (let i = 0; i < bufferSize; i++) {
      // Multiple sine waves at different frequencies for more natural sound
      const t = i / audioContext.sampleRate;
      
      // Base wave (0.08Hz) - slow wave pattern, like larger ocean swells
      const baseWave = 0.5 * Math.sin(2 * Math.PI * 0.08 * t);
      
      // Medium waves (0.2Hz, 0.4Hz) - more natural medium wave patterns
      const mediumWave1 = 0.3 * Math.sin(2 * Math.PI * 0.2 * t + 0.1);
      const mediumWave2 = 0.25 * Math.sin(2 * Math.PI * 0.4 * t + 0.2);
      
      // Slower waves for more realistic ocean sound
      const slowWave1 = 0.15 * Math.sin(2 * Math.PI * 0.6 * t + 0.3);
      const slowWave2 = 0.12 * Math.sin(2 * Math.PI * 0.7 * t + 0.4);
      
      // Fast waves (0.9-1.5Hz) - surf and bubbles, quieter to be less harsh
      const fastWave1 = 0.05 * Math.sin(2 * Math.PI * 0.9 * t + 0.5);
      const fastWave2 = 0.03 * Math.sin(2 * Math.PI * 1.2 * t + 0.6);
      const fastWave3 = 0.02 * Math.sin(2 * Math.PI * 1.5 * t + 0.7);
      
      // Apply a smoothed/filtered white noise for surf sound
      // We use less noise and smooth it for a gentler sound
      let noise = 0;
      for (let j = 0; j < 3; j++) { // Smoothing by averaging
        noise += (Math.random() * 2 - 1);
      }
      noise = (noise / 3) * 0.05; // Reduce amplitude for gentler sound
      
      // Combine all components with better balance
      let sample = baseWave + mediumWave1 + mediumWave2 + slowWave1 + slowWave2 + fastWave1 + fastWave2 + fastWave3 + noise;
      
      // Apply amplitude modulation for additional realism - slower modulation
      const slowAmpMod = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.03 * t); // Gentler modulation
      sample *= 0.35 * slowAmpMod; // Reduced overall volume
      
      // Apply a very slow modulation to simulate tide changes
      const tideEffect = 1.0 + 0.15 * Math.sin(2 * Math.PI * 0.01 * t);
      sample *= tideEffect;
      
      // Add some randomness to make each channel slightly different
      if (channel === 1) {
        sample += 0.03 * (Math.random() * 2 - 1); // Less stereo difference
      }
      
      // Prevent clipping
      if (sample > 1) sample = 1;
      if (sample < -1) sample = -1;
      
      data[i] = sample;
    }
  }

  // Convert buffer to a WAV Blob
  return await exportBufferToWav(buffer, audioContext.sampleRate);
}

// Function to convert AudioBuffer to WAV format
async function exportBufferToWav(buffer: AudioBuffer, sampleRate: number): Promise<Blob> {
  const interleaved = interleaveChannels(buffer);
  const dataView = encodeWAV(interleaved, sampleRate, buffer.numberOfChannels);
  return new Blob([dataView], { type: 'audio/wav' });
}

// Interleave channels for WAV format
function interleaveChannels(buffer: AudioBuffer): Float32Array {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length * numChannels;
  const result = new Float32Array(length);
  let offset = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      result[offset++] = buffer.getChannelData(channel)[i];
    }
  }
  
  return result;
}

// Create WAV file header and data
function encodeWAV(samples: Float32Array, sampleRate: number, numChannels: number): DataView {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 for PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);
  
  // Write the PCM samples
  floatTo16BitPCM(view, 44, samples);
  
  return view;
}

// Helper function to write a string to a DataView
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Convert float samples to 16-bit PCM
function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array): void {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}