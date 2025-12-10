// 🌙 Moonlit Tales - Type Definitions

export type StoryMode =
  | 'romance'
  | 'quest'
  | 'sleepy'
  | 'custom'
  | 'gossip';

export type StoryLength = 'short' | 'medium' | 'long';

export interface StorySettings {
  mode: StoryMode;
  length: StoryLength;
  toneSoftness: number; // 0-100
  lullabyEnding: boolean;
  customTheme?: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  mode: StoryMode;
  createdAt: string; // ISO string for serialization compatibility
  audioUrl?: string;
  isFavorite: boolean;
  settings: StorySettings;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  emoji: string;
  type: 'royal' | 'chaotic' | 'custom';
  personality?: string;
  themeSong?: {
    description: string; // User's description of the music
    audioUrl?: string;   // Generated audio URL
  };
  isCustom?: boolean;    // Flag for user-created characters
  imagePrompt?: string;  // Custom prompt for AI image generation
}

export interface AudioTrack {
  id: string;
  name: string;
  file: string;
  category: 'ambient' | 'narration';
}

export type VoiceType = 'prince' | 'narrator';

export interface VoiceSettings {
  stability: number;      // 0-1: Higher = more stable/consistent, lower = more expressive
  similarityBoost: number; // 0-1: Voice clarity vs variation
  style: number;          // 0-1: Style exaggeration (0 = natural, 1 = expressive)
  speed: number;          // 0.5-2: Playback speed (1 = normal)
}

export interface NarrationSettings {
  voice: VoiceType;
  whisperMode: boolean;
  backgroundMusicVolume: number;
}

export type BackgroundTheme = 'dreamy' | 'lofi' | 'starry' | 'aurora' | 'misty';

export const BACKGROUND_THEMES: Record<BackgroundTheme, {
  name: string;
  icon: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  particleCount: number;
  particleSpeed: number;
}> = {
  dreamy: {
    name: 'Dreamy Moonlight',
    icon: '🌙',
    description: 'Soft, ethereal moonlit vibes',
    colors: {
      primary: '#1A0A2A',
      secondary: '#311C4B',
      accent: '#C8A6FF',
    },
    particleCount: 30,
    particleSpeed: 0.3,
  },
  lofi: {
    name: 'Lofi Nights',
    icon: '🎧',
    description: 'Cozy, warm aesthetic',
    colors: {
      primary: '#1A1420',
      secondary: '#2A1F35',
      accent: '#FFB6C1',
    },
    particleCount: 20,
    particleSpeed: 0.2,
  },
  starry: {
    name: 'Starry Sky',
    icon: '✨',
    description: 'Twinkling celestial wonder',
    colors: {
      primary: '#0A0A1A',
      secondary: '#1A1A3A',
      accent: '#E6D8A8',
    },
    particleCount: 50,
    particleSpeed: 0.4,
  },
  aurora: {
    name: 'Aurora Dreams',
    icon: '🌌',
    description: 'Northern lights magic',
    colors: {
      primary: '#0A1A2A',
      secondary: '#1A2A4A',
      accent: '#7DD3A8',
    },
    particleCount: 25,
    particleSpeed: 0.5,
  },
  misty: {
    name: 'Misty Forest',
    icon: '🌲',
    description: 'Peaceful foggy serenity',
    colors: {
      primary: '#1A1A20',
      secondary: '#252530',
      accent: '#DDE3F3',
    },
    particleCount: 15,
    particleSpeed: 0.15,
  },
};

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  StoryGenerator: { mode: StoryMode };
  StoryReader: { story: Story };
  CharacterGallery: undefined;
  SavedStories: undefined;
  Settings: undefined;
};

// Story mode configurations
export const STORY_MODES: Record<StoryMode, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
}> = {
  romance: {
    title: 'Romance Stories',
    subtitle: 'The Heart of the App',
    icon: '💜',
    color: '#C8A6FF',
    description: 'Gentle, poetic, deeply romantic bedtime stories starring Queen Pratima and Prince Pranav',
  },
  quest: {
    title: 'Royal Quests',
    subtitle: 'Fantasy Adventures',
    icon: '🏰',
    color: '#E6D8A8',
    description: 'Fantasy adventures with a romantic core through enchanted forests and celestial gardens',
  },
  sleepy: {
    title: 'Sleepy Short Tales',
    subtitle: 'Micro Stories',
    icon: '😴',
    color: '#DDE3F3',
    description: 'Very short, calming tales for when you\'re tired, ending like a lullaby',
  },
  custom: {
    title: 'Custom Stories',
    subtitle: 'Your Theme',
    icon: '✨',
    color: '#7DD3A8',
    description: 'Create a story with your own magical theme, always romantic and dreamy',
  },
  gossip: {
    title: 'Gossip Mode',
    subtitle: 'The Chaotic Court',
    icon: '😂',
    color: '#FFD699',
    description: 'Playful, humorous tales with the chaotic court characters',
  },
};

// Character definitions
export const CHARACTERS: Character[] = [
  {
    id: 'pratima',
    name: 'Pratima',
    title: 'The Queen',
    emoji: '👑',
    type: 'royal',
    description: 'The beloved Queen of the moonlit kingdom, cherished and celebrated in every tale.',
    personality: 'Loves being cherished, enjoys magical romantic storytelling, wants a calming end to the day.',
  },
  {
    id: 'pranav',
    name: 'Pranav',
    title: 'The Prince',
    emoji: '🤴',
    type: 'royal',
    description: 'The devoted Prince and Story Weaver, crafting tender bedtime moments.',
    personality: 'Creates tender moments, loves premium smooth experiences, enjoys seeing Pratima happy.',
  },
  {
    id: 'lanka',
    name: 'Lanka',
    title: 'The Fog-Ogre Knight',
    emoji: '🐲',
    type: 'chaotic',
    description: 'An overconfident fog-ogre who thinks he\'s God\'s gift to the kingdom.',
    personality: 'Overconfident, dramatic, thinks highly of himself.',
  },
  {
    id: 'jinal',
    name: 'Jinal',
    title: 'The Parrot Witch',
    emoji: '🦜',
    type: 'chaotic',
    description: 'A parrot witch of gossip, loud, dramatic, and wonderfully nonsensical.',
    personality: 'Loud, dramatic, screeches nonsense gossip, loves drama.',
  },
  {
    id: 'pavani',
    name: 'Pavani',
    title: 'The Weeping Willow Spirit',
    emoji: '🌧️',
    type: 'chaotic',
    description: 'A weeping willow spirit who cries dramatically over absolutely everything.',
    personality: 'Overly emotional, cries dramatically, sensitive to everything.',
  },
  {
    id: 'ramaya',
    name: 'Ramaya',
    title: 'The Scholar',
    emoji: '📜',
    type: 'chaotic',
    description: 'A scholar proudly waving a useless magical degree scroll.',
    personality: 'Academic, proud of useless qualifications, quotes obscure magical texts.',
  },
];
