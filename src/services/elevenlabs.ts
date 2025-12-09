// 🌙 Moonlit Tales - ElevenLabs Voice Narration Service (Web Compatible)
import axios from 'axios';
import { Platform } from 'react-native';
import { VoiceType } from '../types';

// API configuration - reads from env or can be set manually
let ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

export const setElevenLabsKey = (key: string) => {
  ELEVENLABS_API_KEY = key;
};

export const getElevenLabsKey = () => ELEVENLABS_API_KEY;

// Voice IDs for different narration styles
const VOICE_IDS: Record<VoiceType, string> = {
  prince: 'pNInz6obpgDQGcFmaJgB', // Adam - warm male voice
  narrator: 'EXAVITQu4vr4xnSDxMaL', // Bella - soft female narrator
};

// Voice settings for bedtime stories
const VOICE_SETTINGS = {
  stability: 0.75,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true,
};

// Whisper mode settings (softer, slower)
const WHISPER_SETTINGS = {
  stability: 0.9,
  similarity_boost: 0.6,
  style: 0.3,
  use_speaker_boost: false,
};

export interface NarrationResult {
  audioUri: string;
  success: boolean;
  error?: string;
}

// Web Audio API for browser playback
let webAudioElement: HTMLAudioElement | null = null;
let isPlaying = false;

export const generateNarration = async (
  text: string,
  voiceType: VoiceType = 'narrator',
  whisperMode: boolean = false
): Promise<NarrationResult> => {
  console.log('[Narration] Starting generation...');
  console.log('[Narration] API Key present:', !!ELEVENLABS_API_KEY);
  console.log('[Narration] Voice type:', voiceType);
  console.log('[Narration] Text length:', text.length);

  if (!ELEVENLABS_API_KEY) {
    console.log('[Narration] ERROR: No API key configured');
    return {
      audioUri: '',
      success: false,
      error: 'ElevenLabs API key not configured. Please set your API key in Settings.',
    };
  }

  const voiceId = VOICE_IDS[voiceType];
  const settings = whisperMode ? WHISPER_SETTINGS : VOICE_SETTINGS;

  console.log('[Narration] Using voice ID:', voiceId);

  try {
    console.log('[Narration] Making API request...');
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: settings,
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    );

    console.log('[Narration] API response received, status:', response.status);
    console.log('[Narration] Response data size:', response.data?.byteLength || 0);

    // For web, create a blob URL
    if (Platform.OS === 'web') {
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUri = URL.createObjectURL(blob);
      console.log('[Narration] SUCCESS - Blob URL created:', audioUri.substring(0, 50) + '...');
      return {
        audioUri,
        success: true,
      };
    }

    // For native, we'd save to file system (but for now just use blob)
    const blob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUri = URL.createObjectURL(blob);
    console.log('[Narration] SUCCESS - Blob URL created');
    return {
      audioUri,
      success: true,
    };
  } catch (error: any) {
    console.error('[Narration] ERROR:', error.response?.status, error.response?.data || error.message);
    return {
      audioUri: '',
      success: false,
      error: error.response?.data?.detail?.message || 'Failed to generate narration. Please try again.',
    };
  }
};

// Play narration using Web Audio API
export const playNarration = async (
  audioUri: string,
  onPlaybackStatusUpdate?: (status: any) => void
): Promise<void> => {
  try {
    await stopNarration();

    if (Platform.OS === 'web') {
      webAudioElement = new Audio();
      webAudioElement.src = audioUri;
      webAudioElement.volume = 0.9;
      webAudioElement.preload = 'auto';

      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        if (!webAudioElement) {
          reject(new Error('Audio element not created'));
          return;
        }

        webAudioElement.oncanplaythrough = () => {
          console.log('Audio ready to play');
          resolve();
        };

        webAudioElement.onerror = (e) => {
          console.error('Audio loading error:', e);
          reject(new Error('Failed to load audio'));
        };

        // Trigger load
        webAudioElement.load();
      });

      webAudioElement.ontimeupdate = () => {
        if (onPlaybackStatusUpdate && webAudioElement) {
          const duration = webAudioElement.duration;
          const position = webAudioElement.currentTime;
          if (!isNaN(duration) && !isNaN(position)) {
            onPlaybackStatusUpdate({
              isLoaded: true,
              isPlaying: !webAudioElement.paused,
              positionMillis: position * 1000,
              durationMillis: duration * 1000,
              didJustFinish: false,
            });
          }
        }
      };

      webAudioElement.onended = () => {
        console.log('Audio playback ended');
        if (onPlaybackStatusUpdate) {
          onPlaybackStatusUpdate({
            isLoaded: true,
            isPlaying: false,
            didJustFinish: true,
          });
        }
        isPlaying = false;
      };

      // Start playback
      await webAudioElement.play();
      isPlaying = true;
      console.log('Narration playback started');
    }
  } catch (error) {
    console.error('Error playing narration:', error);
    isPlaying = false;
    throw error;
  }
};

export const pauseNarration = async (): Promise<void> => {
  if (Platform.OS === 'web' && webAudioElement && isPlaying) {
    webAudioElement.pause();
    isPlaying = false;
  }
};

export const resumeNarration = async (): Promise<void> => {
  if (Platform.OS === 'web' && webAudioElement && !isPlaying) {
    await webAudioElement.play();
    isPlaying = true;
  }
};

export const stopNarration = async (): Promise<void> => {
  if (Platform.OS === 'web' && webAudioElement) {
    webAudioElement.pause();
    webAudioElement.currentTime = 0;
    webAudioElement = null;
    isPlaying = false;
  }
};

export const seekNarration = async (positionMillis: number): Promise<void> => {
  if (Platform.OS === 'web' && webAudioElement) {
    webAudioElement.currentTime = positionMillis / 1000;
  }
};

export const setNarrationVolume = async (volume: number): Promise<void> => {
  if (Platform.OS === 'web' && webAudioElement) {
    webAudioElement.volume = Math.max(0, Math.min(1, volume));
  }
};

export const isNarrationPlaying = (): boolean => isPlaying;

// Get available voices from ElevenLabs
export const getAvailableVoices = async (): Promise<any[]> => {
  if (!ELEVENLABS_API_KEY) {
    return [];
  }

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });
    return response.data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
};

// Update voice IDs (for user customization)
export const setVoiceId = (voiceType: VoiceType, voiceId: string): void => {
  VOICE_IDS[voiceType] = voiceId;
};
