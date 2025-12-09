// 🌙 Moonlit Tales - ElevenLabs Voice Narration Service
import axios from 'axios';
import { Paths, File } from 'expo-file-system';
import { Audio } from 'expo-av';
import { VoiceType } from '../types';

// API configuration - reads from env or can be set manually
let ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';

export const setElevenLabsKey = (key: string) => {
  ELEVENLABS_API_KEY = key;
};

export const getElevenLabsKey = () => ELEVENLABS_API_KEY;

// Voice IDs for different narration styles
// These are ElevenLabs voice IDs - users can customize these
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

export const generateNarration = async (
  text: string,
  voiceType: VoiceType = 'narrator',
  whisperMode: boolean = false
): Promise<NarrationResult> => {
  if (!ELEVENLABS_API_KEY) {
    return {
      audioUri: '',
      success: false,
      error: 'ElevenLabs API key not configured. Please set your API key in Settings.',
    };
  }

  const voiceId = VOICE_IDS[voiceType];
  const settings = whisperMode ? WHISPER_SETTINGS : VOICE_SETTINGS;

  try {
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

    // Save audio to file system using new expo-file-system API
    const fileName = `story_${Date.now()}.mp3`;
    const audioFile = new File(Paths.cache, fileName);

    // Convert arraybuffer to base64
    const base64Audio = btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    // Decode base64 and write as binary
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    await audioFile.write(bytes);

    return {
      audioUri: audioFile.uri,
      success: true,
    };
  } catch (error: any) {
    console.error('ElevenLabs API Error:', error.response?.data || error.message);
    return {
      audioUri: '',
      success: false,
      error: error.response?.data?.detail?.message || 'Failed to generate narration. Please try again.',
    };
  }
};

// Audio player management
let currentSound: Audio.Sound | null = null;
let isPlaying = false;

export const playNarration = async (
  audioUri: string,
  onPlaybackStatusUpdate?: (status: any) => void
): Promise<void> => {
  try {
    // Stop any currently playing audio
    await stopNarration();

    // Configure audio mode for background playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // Create and play the sound
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    currentSound = sound;
    isPlaying = true;
  } catch (error) {
    console.error('Error playing narration:', error);
    throw error;
  }
};

export const pauseNarration = async (): Promise<void> => {
  if (currentSound && isPlaying) {
    await currentSound.pauseAsync();
    isPlaying = false;
  }
};

export const resumeNarration = async (): Promise<void> => {
  if (currentSound && !isPlaying) {
    await currentSound.playAsync();
    isPlaying = true;
  }
};

export const stopNarration = async (): Promise<void> => {
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
    isPlaying = false;
  }
};

export const seekNarration = async (positionMillis: number): Promise<void> => {
  if (currentSound) {
    await currentSound.setPositionAsync(positionMillis);
  }
};

export const setNarrationVolume = async (volume: number): Promise<void> => {
  if (currentSound) {
    await currentSound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
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
