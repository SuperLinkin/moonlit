// 🌙 Moonlit Tales - OpenAI Story Generation Service
import axios from 'axios';
import { StoryMode, StorySettings } from '../types';

// API configuration - reads from env or can be set manually
let OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export const setOpenAIKey = (key: string) => {
  OPENAI_API_KEY = key;
};

export const getOpenAIKey = () => OPENAI_API_KEY;

// Story prompt templates based on the PRD
const PROMPT_TEMPLATES: Record<StoryMode, string> = {
  romance: `You are generating a soft, poetic, romantic bedtime story for Pratima.
Only two characters may appear: Princess Pratima and Prince Pranav.
Tone: dreamy, affectionate, warm, slow, moonlit.
No chaos, no loud moments.
Focus on emotional intimacy, beauty, and calm imagery.
Use atmospheric elements: moonlight, stars, whispers, lanterns, soft winds.
Always end with a peaceful paragraph that helps Pratima fall asleep feeling loved and safe.`,

  quest: `You are generating a fantasy adventure bedtime story with a romantic core.
Only two characters may appear: Princess Pratima and Prince Pranav.
The adventure should be plot-light but imagery-heavy.
Settings may include: enchanted forests, celestial gardens, glowing creatures, star rivers, moon-bridges.
Tone: Adventurous but calming.
Always end with closeness and gentle affection between the Prince and Princess.
The final paragraph should make Pratima feel peaceful and ready to sleep.`,

  sleepy: `You are generating a very short, calming micro bedtime story for Pratima.
Only two characters may appear: Princess Pratima and Prince Pranav.
Keep it brief: 60-120 seconds to read (about 150-300 words total).
No plot twists, very slow pacing.
Use sensory imagery: warm lanterns, soft winds, star reflections, quiet gardens.
The final line must feel like a lullaby - soft, gentle, and sleep-inducing.
Focus on comfort and peace above all else.`,

  custom: `You are generating a magical, romantic bedtime story for Pratima.
Only two characters may appear: Princess Pratima and Prince Pranav.
Maintain a romantic tone and magical universe feel.
The story should be dreamy, warm, and soothing.
Always end with a peaceful moment that helps Pratima fall asleep feeling loved.`,

  gossip: `Generate a humorous, light chaotic bedtime gossip tale set in a magical kingdom.
Characters allowed: Pratima, Pranav, Lanka, Jinal, Pavani, Ramaya.
Their personalities must match:
- Lanka: overconfident fog-ogre knight who thinks he's God's gift
- Jinal: parrot witch who screeches nonsense gossip, loud and dramatic
- Pavani: willow spirit who cries dramatically over everything
- Ramaya: scholar waving a useless magical degree scroll
The tone must be playful and silly, NOT stressful.
Create funny interactions and absurd situations.
IMPORTANT: End with Pranav turning to Pratima and comforting her in a romantic, calming moment so she sleeps peacefully.`,
};

// Length configurations
const LENGTH_CONFIGS = {
  short: { words: '200-350', paragraphs: '3-4' },
  medium: { words: '400-600', paragraphs: '5-7' },
  long: { words: '700-1000', paragraphs: '8-12' },
};

export interface StoryGenerationResult {
  title: string;
  content: string;
  success: boolean;
  error?: string;
}

export const generateStory = async (
  settings: StorySettings
): Promise<StoryGenerationResult> => {
  if (!OPENAI_API_KEY) {
    return {
      title: '',
      content: '',
      success: false,
      error: 'OpenAI API key not configured. Please set your API key in Settings.',
    };
  }

  const basePrompt = PROMPT_TEMPLATES[settings.mode];
  const lengthConfig = LENGTH_CONFIGS[settings.length];

  // Build the full prompt
  let fullPrompt = `${basePrompt}

Story length: ${lengthConfig.words} words, approximately ${lengthConfig.paragraphs} paragraphs.
Softness level: ${settings.toneSoftness}% (higher means softer, more gentle language).`;

  if (settings.lullabyEnding) {
    fullPrompt += `\nIMPORTANT: The ending must feel like a lullaby - extra soft, gentle, and sleep-inducing.`;
  }

  if (settings.customTheme && settings.mode === 'custom') {
    fullPrompt += `\nStory theme/setting requested: "${settings.customTheme}"
Incorporate this theme while keeping the romantic, magical atmosphere.`;
  }

  fullPrompt += `

Please generate:
1. A beautiful, poetic story title (short, evocative)
2. The story itself with proper paragraph breaks

Format your response as:
TITLE: [Your title here]
STORY:
[Your story here with paragraph breaks]`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a master storyteller who specializes in creating beautiful, romantic, magical bedtime stories. Your writing is poetic, warm, and evokes a sense of wonder and peace. You write stories that make people feel loved and help them drift peacefully to sleep.',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseText = response.data.choices[0].message.content;

    // Parse title and story from response
    const titleMatch = responseText.match(/TITLE:\s*(.+)/i);
    const storyMatch = responseText.match(/STORY:\s*([\s\S]+)/i);

    const title = titleMatch ? titleMatch[1].trim() : 'A Moonlit Tale';
    const content = storyMatch ? storyMatch[1].trim() : responseText;

    return {
      title,
      content,
      success: true,
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    return {
      title: '',
      content: '',
      success: false,
      error: error.response?.data?.error?.message || 'Failed to generate story. Please try again.',
    };
  }
};

// Convert story to SSML for better voice synthesis
export const convertToSSML = (text: string): string => {
  // Add pauses after paragraphs
  let ssml = text
    .split('\n\n')
    .map((paragraph) => {
      if (paragraph.trim()) {
        return `<p>${paragraph.trim()}</p><break time="800ms"/>`;
      }
      return '';
    })
    .join('\n');

  // Add prosody for softer speech
  ssml = `<speak>
    <prosody rate="slow" pitch="-2st" volume="soft">
      ${ssml}
    </prosody>
  </speak>`;

  return ssml;
};
