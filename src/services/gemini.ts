// 🌙 Moonlit Tales - Image Generation Service (using OpenAI DALL-E)
import axios from 'axios';
import { getOpenAIKey } from './openai';

// Legacy Gemini key support (for backwards compatibility)
let GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export const setGeminiKey = (key: string) => {
  GEMINI_API_KEY = key;
};

export const getGeminiKey = () => GEMINI_API_KEY;

export interface ImageGenerationResult {
  imageUrl: string;
  success: boolean;
  error?: string;
}

// Character image prompts - Anime/Manga style
// Pratima & Pranav are the heroes (romantic couple)
// Lanka, Jinal, Pavani, Ramaya are the chaotic court villains/antagonists
const CHARACTER_PROMPTS: Record<string, string> = {
  // HEROES - The Royal Couple
  pratima: `Beautiful Indian princess anime girl, long flowing black hair open and free, big expressive dark eyes with sparkles, cute modern outfit with traditional Indian jewelry accents, a tiny adorable cat companion sitting near her shoulder, soft blue-tinted dreamy background with sparkles and stars, Japanese manga art style, highly detailed anime illustration, soft shading, beautiful lighting, shoujo manga aesthetic, romantic and ethereal mood, Studio Ghibli inspired, protagonist heroine vibes`,

  pranav: `Handsome Indian prince anime boy, charming smile, well-styled dark hair, warm brown eyes full of love, wearing a stylish royal outfit with gold accents, confident and gentle expression, soft pink-tinted dreamy background with sparkles and hearts, Japanese manga art style, highly detailed anime illustration, soft shading, beautiful lighting, shoujo manga aesthetic, romantic and dreamy mood, bishounen style, heroic prince protagonist`,

  // VILLAINS - The Chaotic Court
  lanka: `Villainous fog-ogre knight anime antagonist, greenish-gray skin with sinister grin, wearing dark menacing samurai-style armor with spikes, proud overconfident evil expression, glowing red eyes, dark misty fog and shadows swirling around him, dramatic villain pose, Japanese manga art style, anime illustration, dark fantasy villain aesthetic, intimidating but comedic villain design, purple and black color scheme background`,

  jinal: `Mischievous parrot witch anime villain, anthropomorphic parrot girl with wild vibrant green and red feather hair, wearing a dark witch hat with a sinister smile, scheming gossipy expression with narrowed eyes, perched near a glowing crystal ball showing dark magic, colorful but ominous magical sparkles, Japanese manga art style, anime illustration, dark magical girl villain aesthetic, cunning and dramatic villain design`,

  pavani: `Ghostly weeping willow spirit anime villain, pale translucent ethereal figure with flowing dark green hair like willow branches, haunting glowing tear-drop lights floating around her, dramatically melancholic but menacing expression, eerie forest spirit aesthetic with dark undertones, Japanese manga art style, anime illustration, soft green and ghostly blue ethereal lighting, dark fantasy anime aesthetic, beautiful but sinister yokai villain`,

  ramaya: `Sinister scholarly wizard anime villain, elderly figure with cunning proud expression, wearing dark elaborate academic robes covered in forbidden magical symbols, holding a glowing scroll with dark magic, surrounded by floating ancient tomes and shadows, dim candlelit library with ominous lighting, Japanese manga art style, anime illustration, dark academic villain aesthetic, wise but evil sorcerer design`,
};

// Cache for generated images
const imageCache: Record<string, string> = {};

// Helper to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate image using OpenAI DALL-E
const generateWithOpenAI = async (prompt: string): Promise<ImageGenerationResult | null> => {
  const apiKey = getOpenAIKey();

  if (!apiKey) {
    console.log('[ImageGen] No OpenAI API key configured');
    return null;
  }

  try {
    console.log('[ImageGen] Generating image with OpenAI DALL-E...');

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: `Create an anime-style character portrait: ${prompt}`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 120000, // 2 minute timeout for DALL-E
      }
    );

    if (response.data?.data?.[0]?.b64_json) {
      const base64Image = response.data.data[0].b64_json;
      const imageUrl = `data:image/png;base64,${base64Image}`;

      console.log('[ImageGen] SUCCESS - Image generated with DALL-E!');
      return {
        imageUrl,
        success: true,
      };
    }

    console.log('[ImageGen] DALL-E returned no image data');
    return null;

  } catch (error: any) {
    console.error('[ImageGen] DALL-E error:', error.response?.status, error.response?.data || error.message);

    if (error.response?.status === 429) {
      return {
        imageUrl: '',
        success: false,
        error: 'Rate limit exceeded. Please wait a moment and try again.',
      };
    }

    if (error.response?.status === 400) {
      return {
        imageUrl: '',
        success: false,
        error: 'Image generation was blocked. The prompt may have been flagged.',
      };
    }

    return null;
  }
};

export const generateCharacterImage = async (
  characterId: string,
  forceRegenerate: boolean = false,
  customPrompt?: string
): Promise<ImageGenerationResult> => {
  console.log('[ImageGen] generateCharacterImage called for:', characterId);

  // Check cache first
  if (!forceRegenerate && imageCache[characterId]) {
    console.log('[ImageGen] Returning cached image for:', characterId);
    return {
      imageUrl: imageCache[characterId],
      success: true,
    };
  }

  const openaiKey = getOpenAIKey();

  if (!openaiKey) {
    console.log('[ImageGen] ERROR: No OpenAI API key configured');
    return {
      imageUrl: '',
      success: false,
      error: 'OpenAI API key not configured. Please set your API key in Settings to generate character portraits.',
    };
  }

  // Use custom prompt if provided, otherwise look up in CHARACTER_PROMPTS
  let prompt = customPrompt || CHARACTER_PROMPTS[characterId];

  // If custom prompt is provided but doesn't have style info, add anime style
  if (customPrompt && !customPrompt.includes('anime') && !customPrompt.includes('manga')) {
    prompt = `${customPrompt}. Japanese manga art style, anime illustration, soft shading, beautiful lighting, dreamy romantic atmosphere, highly detailed anime character design`;
  }

  if (!prompt) {
    console.log('[ImageGen] ERROR: No prompt found for character:', characterId);
    return {
      imageUrl: '',
      success: false,
      error: `No image prompt configured for character: ${characterId}`,
    };
  }

  // Generate with OpenAI DALL-E
  const result = await generateWithOpenAI(prompt);

  if (result && result.success) {
    // Cache the successful result
    imageCache[characterId] = result.imageUrl;
    return result;
  }

  // Return error from result or generic error
  return result || {
    imageUrl: '',
    success: false,
    error: 'Image generation failed. Please try again.',
  };
};

// Generate all character images with proper spacing to avoid rate limits
export const generateAllCharacterImages = async (
  characterIds: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Record<string, ImageGenerationResult>> => {
  const results: Record<string, ImageGenerationResult> = {};

  for (let i = 0; i < characterIds.length; i++) {
    const characterId = characterIds[i];
    results[characterId] = await generateCharacterImage(characterId);
    onProgress?.(i + 1, characterIds.length);

    // Delay between requests to avoid rate limiting (2 seconds for DALL-E)
    if (i < characterIds.length - 1) {
      await delay(2000);
    }
  }

  return results;
};

// Clear image cache
export const clearImageCache = () => {
  Object.keys(imageCache).forEach(key => {
    delete imageCache[key];
  });
};

// Get cached image if available
export const getCachedImage = (characterId: string): string | null => {
  return imageCache[characterId] || null;
};
