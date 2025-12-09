// 🌙 Moonlit Tales - Ambient Music Service using ElevenLabs
// Uses ElevenLabs Sound Generation API for high-quality ambient sounds
import { Platform } from 'react-native';
import axios from 'axios';
import { getElevenLabsKey } from './elevenlabs';

// Ambient sound configurations
export type AmbientSoundType =
  | 'moonlit_wind'
  | 'forest_night'
  | 'dreamy_stars'
  | 'celestial_chimes'
  | 'rain_soft'
  | 'binaural_sleep';

interface AmbientSound {
  name: string;
  description: string;
  icon: string;
  prompt: string; // ElevenLabs sound generation prompt
}

export const AMBIENT_SOUNDS: Record<AmbientSoundType, AmbientSound> = {
  moonlit_wind: {
    name: 'Moonlit Wind',
    description: 'Gentle night breeze',
    icon: '🌙',
    prompt: 'Soft gentle wind blowing at night, peaceful breeze, calming atmosphere, no harsh sounds, continuous ambient',
  },
  forest_night: {
    name: 'Forest Night',
    description: 'Crickets and owls',
    icon: '🌲',
    prompt: 'Peaceful forest at night with soft cricket sounds, distant owl hoots, gentle rustling leaves, calming nature ambience',
  },
  dreamy_stars: {
    name: 'Dreamy Stars',
    description: 'Ethereal synth pads',
    icon: '✨',
    prompt: 'Soft ethereal synthesizer pads, dreamy ambient music, peaceful celestial tones, calming meditation sounds',
  },
  celestial_chimes: {
    name: 'Celestial Chimes',
    description: 'Soft wind chimes',
    icon: '🔔',
    prompt: 'Gentle wind chimes, soft metallic tones in the breeze, peaceful and calming, spa-like atmosphere',
  },
  rain_soft: {
    name: 'Gentle Rain',
    description: 'Light rainfall',
    icon: '🌧️',
    prompt: 'Soft gentle rain falling, light rainfall on leaves, peaceful rain sounds, no thunder, calming rain ambience',
  },
  binaural_sleep: {
    name: 'Sleep Waves',
    description: 'Calming tones',
    icon: '🧠',
    prompt: 'Soft calming ambient tones for sleep, gentle waves of sound, peaceful low frequency hum, meditation music',
  },
};

// Web audio element for ambient music
let ambientAudio: HTMLAudioElement | null = null;
let isAmbientPlaying = false;
let currentAmbientVolume = 0.3;

// Cache for generated ambient sounds
const ambientCache: Record<string, string> = {};

// Generate ambient sound using ElevenLabs Sound Generation API
const generateAmbientSound = async (soundType: AmbientSoundType): Promise<string | null> => {
  const apiKey = getElevenLabsKey();

  if (!apiKey) {
    console.log('ElevenLabs API key not configured for ambient sounds');
    return null;
  }

  // Check cache first
  if (ambientCache[soundType]) {
    return ambientCache[soundType];
  }

  const soundConfig = AMBIENT_SOUNDS[soundType];

  try {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/sound-generation',
      {
        text: soundConfig.prompt,
        duration_seconds: 30, // Generate 30 seconds of ambient sound
        prompt_influence: 0.7,
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    // Create blob URL from response
    const blob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUri = URL.createObjectURL(blob);

    // Cache the generated sound
    ambientCache[soundType] = audioUri;

    return audioUri;
  } catch (error: any) {
    console.error('Error generating ambient sound:', error.response?.data || error.message);
    return null;
  }
};

// Play ambient music
export const playAmbientMusic = async (
  soundType: AmbientSoundType,
  volume: number = 0.3,
  onStatusUpdate?: (status: 'loading' | 'playing' | 'error') => void
): Promise<void> => {
  if (Platform.OS !== 'web') return;

  try {
    await stopAmbientMusic();

    onStatusUpdate?.('loading');

    // Generate ambient sound using ElevenLabs
    const audioUrl = await generateAmbientSound(soundType);

    if (!audioUrl) {
      console.log('Could not generate ambient sound');
      onStatusUpdate?.('error');
      return;
    }

    ambientAudio = new Audio();
    ambientAudio.src = audioUrl;
    ambientAudio.loop = true;
    ambientAudio.volume = Math.max(0, Math.min(1, volume));
    ambientAudio.preload = 'auto';
    currentAmbientVolume = volume;

    let hasStartedPlaying = false;

    // Error handling - only report error if we haven't started playing
    ambientAudio.onerror = (e) => {
      if (!hasStartedPlaying) {
        console.error('Audio playback error:', e);
        isAmbientPlaying = false;
        onStatusUpdate?.('error');
      }
    };

    // Handle when audio ends (for looping manually if needed)
    ambientAudio.onended = () => {
      if (ambientAudio && isAmbientPlaying) {
        // Manually restart for looping
        ambientAudio.currentTime = 0;
        ambientAudio.play().catch(() => {});
      }
    };

    ambientAudio.oncanplaythrough = async () => {
      if (hasStartedPlaying) return; // Prevent double-firing

      try {
        if (ambientAudio) {
          await ambientAudio.play();
          hasStartedPlaying = true;
          isAmbientPlaying = true;
          onStatusUpdate?.('playing');
          console.log('Ambient music started:', soundType);
        }
      } catch (playError) {
        console.log('Playback requires user interaction first');
        isAmbientPlaying = false;
        onStatusUpdate?.('error');
      }
    };

    // Try to load
    ambientAudio.load();

  } catch (error) {
    console.error('Error setting up ambient music:', error);
    isAmbientPlaying = false;
    onStatusUpdate?.('error');
  }
};

// Stop ambient music
export const stopAmbientMusic = async (): Promise<void> => {
  if (Platform.OS === 'web' && ambientAudio) {
    try {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
      ambientAudio.src = '';
    } catch (e) {
      // Ignore errors on stop
    }
    ambientAudio = null;
    isAmbientPlaying = false;
  }
};

// Pause ambient music
export const pauseAmbientMusic = async (): Promise<void> => {
  if (Platform.OS === 'web' && ambientAudio && isAmbientPlaying) {
    try {
      ambientAudio.pause();
      isAmbientPlaying = false;
    } catch (e) {
      console.error('Error pausing ambient music:', e);
    }
  }
};

// Resume ambient music
export const resumeAmbientMusic = async (): Promise<void> => {
  if (Platform.OS === 'web' && ambientAudio && !isAmbientPlaying) {
    try {
      await ambientAudio.play();
      isAmbientPlaying = true;
    } catch (e) {
      console.log('Resume requires user interaction');
    }
  }
};

// Set ambient music volume
export const setAmbientVolume = (volume: number): void => {
  currentAmbientVolume = Math.max(0, Math.min(1, volume));
  if (Platform.OS === 'web' && ambientAudio) {
    ambientAudio.volume = currentAmbientVolume;
  }
};

// Get current ambient volume
export const getAmbientVolume = (): number => currentAmbientVolume;

// Check if ambient music is playing
export const isAmbientMusicPlaying = (): boolean => isAmbientPlaying;

// Fade ambient music volume (for when narration starts)
export const fadeAmbientVolume = async (
  targetVolume: number,
  durationMs: number = 1000
): Promise<void> => {
  if (Platform.OS !== 'web' || !ambientAudio) return;

  const startVolume = ambientAudio.volume;
  const volumeDiff = targetVolume - startVolume;
  const steps = 20;
  const stepDuration = durationMs / steps;

  for (let i = 1; i <= steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, stepDuration));
    if (ambientAudio) {
      ambientAudio.volume = Math.max(0, Math.min(1, startVolume + (volumeDiff * i) / steps));
    }
  }
  currentAmbientVolume = targetVolume;
};

// Pre-generate all ambient sounds (call on app start if API key is available)
export const preGenerateAmbientSounds = async (): Promise<void> => {
  const apiKey = getElevenLabsKey();
  if (!apiKey) return;

  const soundTypes: AmbientSoundType[] = [
    'moonlit_wind',
    'forest_night',
    'rain_soft',
  ];

  // Pre-generate a few sounds in the background
  for (const soundType of soundTypes) {
    if (!ambientCache[soundType]) {
      await generateAmbientSound(soundType);
    }
  }
};

// Clear ambient cache
export const clearAmbientCache = (): void => {
  // Revoke all blob URLs to free memory
  Object.values(ambientCache).forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // Ignore errors
    }
  });

  // Clear the cache object
  Object.keys(ambientCache).forEach((key) => {
    delete ambientCache[key];
  });
};
