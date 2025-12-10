// 🌙 Moonlit Tales - Local Storage Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story, StorySettings, VoiceSettings, BackgroundTheme, Character } from '../types';

const STORAGE_KEYS = {
  STORIES: '@moonlit_stories',
  FAVORITES: '@moonlit_favorites',
  SETTINGS: '@moonlit_settings',
  API_KEYS: '@moonlit_api_keys',
  LAST_MODE: '@moonlit_last_mode',
  CUSTOM_CHARACTERS: '@moonlit_custom_characters',
};

// Story Storage
export const saveStory = async (story: Story): Promise<void> => {
  try {
    const existingStories = await getStories();
    const updatedStories = [story, ...existingStories];
    await AsyncStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(updatedStories));
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
};

export const getStories = async (): Promise<Story[]> => {
  try {
    const storiesJson = await AsyncStorage.getItem(STORAGE_KEYS.STORIES);
    if (storiesJson) {
      const stories = JSON.parse(storiesJson);
      // Convert date strings back to Date objects
      return stories.map((story: any) => ({
        ...story,
        createdAt: new Date(story.createdAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting stories:', error);
    return [];
  }
};

export const getStoryById = async (id: string): Promise<Story | null> => {
  try {
    const stories = await getStories();
    return stories.find((story) => story.id === id) || null;
  } catch (error) {
    console.error('Error getting story:', error);
    return null;
  }
};

export const updateStory = async (id: string, updates: Partial<Story>): Promise<void> => {
  try {
    const stories = await getStories();
    const index = stories.findIndex((story) => story.id === id);
    if (index !== -1) {
      stories[index] = { ...stories[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
    }
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
};

export const deleteStory = async (id: string): Promise<void> => {
  try {
    const stories = await getStories();
    const filteredStories = stories.filter((story) => story.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(filteredStories));
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

export const toggleFavorite = async (id: string): Promise<boolean> => {
  try {
    const stories = await getStories();
    const story = stories.find((s) => s.id === id);
    if (story) {
      story.isFavorite = !story.isFavorite;
      await AsyncStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
      return story.isFavorite;
    }
    return false;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const getFavoriteStories = async (): Promise<Story[]> => {
  try {
    const stories = await getStories();
    return stories.filter((story) => story.isFavorite);
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

// API Keys Storage
export interface APIKeys {
  openai: string;
  elevenlabs: string;
  gemini: string;
}

export const saveAPIKeys = async (keys: APIKeys): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  } catch (error) {
    console.error('Error saving API keys:', error);
    throw error;
  }
};

export const getAPIKeys = async (): Promise<APIKeys> => {
  try {
    const keysJson = await AsyncStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (keysJson) {
      return JSON.parse(keysJson);
    }
    return { openai: '', elevenlabs: '', gemini: '' };
  } catch (error) {
    console.error('Error getting API keys:', error);
    return { openai: '', elevenlabs: '', gemini: '' };
  }
};

// Last Used Mode
export const saveLastMode = async (mode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_MODE, mode);
  } catch (error) {
    console.error('Error saving last mode:', error);
  }
};

export const getLastMode = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_MODE);
  } catch (error) {
    console.error('Error getting last mode:', error);
    return null;
  }
};

// App Settings
export interface AppSettings {
  backgroundMusicVolume: number;
  narrationVolume: number;
  defaultVoice: 'prince' | 'narrator';
  defaultLength: 'short' | 'medium' | 'long';
  autoPlay: boolean;
  hapticFeedback: boolean;
  // Voice quality settings
  voiceSettings: VoiceSettings;
  // Background theme
  backgroundTheme: BackgroundTheme;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.75,        // Balanced stability
  similarityBoost: 0.75,  // Clear voice
  style: 0.5,             // Moderate expressiveness
  speed: 1.0,             // Normal speed
};

const DEFAULT_SETTINGS: AppSettings = {
  backgroundMusicVolume: 0.3,
  narrationVolume: 0.8,
  defaultVoice: 'narrator',
  defaultLength: 'medium',
  autoPlay: true,
  hapticFeedback: true,
  voiceSettings: DEFAULT_VOICE_SETTINGS,
  backgroundTheme: 'dreamy',
};

export const saveSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settingsJson) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Generate unique ID
export const generateId = (): string => {
  return `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Clear all data (for debugging/reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.STORIES,
      STORAGE_KEYS.FAVORITES,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.LAST_MODE,
      STORAGE_KEYS.CUSTOM_CHARACTERS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

// Custom Characters Storage
export const saveCustomCharacter = async (character: Character): Promise<void> => {
  try {
    const existingCharacters = await getCustomCharacters();
    const updatedCharacters = [...existingCharacters, character];
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_CHARACTERS, JSON.stringify(updatedCharacters));
  } catch (error) {
    console.error('Error saving custom character:', error);
    throw error;
  }
};

export const getCustomCharacters = async (): Promise<Character[]> => {
  try {
    const charactersJson = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_CHARACTERS);
    if (charactersJson) {
      return JSON.parse(charactersJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting custom characters:', error);
    return [];
  }
};

export const updateCustomCharacter = async (id: string, updates: Partial<Character>): Promise<void> => {
  try {
    const characters = await getCustomCharacters();
    const index = characters.findIndex((char) => char.id === id);
    if (index !== -1) {
      characters[index] = { ...characters[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_CHARACTERS, JSON.stringify(characters));
    }
  } catch (error) {
    console.error('Error updating custom character:', error);
    throw error;
  }
};

export const deleteCustomCharacter = async (id: string): Promise<void> => {
  try {
    const characters = await getCustomCharacters();
    const filteredCharacters = characters.filter((char) => char.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_CHARACTERS, JSON.stringify(filteredCharacters));
  } catch (error) {
    console.error('Error deleting custom character:', error);
    throw error;
  }
};

// Generate unique character ID
export const generateCharacterId = (): string => {
  return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
