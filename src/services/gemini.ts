// 🌙 Moonlit Tales - Gemini Image Generation Service
import axios from 'axios';

// API configuration
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

export const generateCharacterImage = async (
  characterId: string,
  forceRegenerate: boolean = false,
  customPrompt?: string
): Promise<ImageGenerationResult> => {
  console.log('[Gemini] generateCharacterImage called for:', characterId);
  console.log('[Gemini] API Key present:', !!GEMINI_API_KEY);
  console.log('[Gemini] Custom prompt provided:', !!customPrompt);

  // Check cache first
  if (!forceRegenerate && imageCache[characterId]) {
    console.log('[Gemini] Returning cached image for:', characterId);
    return {
      imageUrl: imageCache[characterId],
      success: true,
    };
  }

  if (!GEMINI_API_KEY) {
    console.log('[Gemini] ERROR: No API key configured');
    return {
      imageUrl: '',
      success: false,
      error: 'Gemini API key not configured. Please set your API key in Settings.',
    };
  }

  // Use custom prompt if provided, otherwise look up in CHARACTER_PROMPTS
  let prompt = customPrompt || CHARACTER_PROMPTS[characterId];

  // If custom prompt is provided but doesn't have style info, add anime style
  if (customPrompt && !customPrompt.includes('anime') && !customPrompt.includes('manga')) {
    prompt = `${customPrompt}. Japanese manga art style, anime illustration, soft shading, beautiful lighting, dreamy romantic atmosphere, highly detailed anime character design`;
  }

  if (!prompt) {
    console.log('[Gemini] ERROR: No prompt found for character:', characterId);
    return {
      imageUrl: '',
      success: false,
      error: `No image prompt configured for character: ${characterId}`,
    };
  }

  try {
    console.log('[Gemini] Making API request for image generation...');

    // Using Gemini's Imagen API (imagen-3.0-generate-002)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
      {
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          safetyFilterLevel: 'block_some',
          personGeneration: 'allow_adult',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[Gemini] API response received');

    if (response.data?.predictions?.[0]?.bytesBase64Encoded) {
      const base64Image = response.data.predictions[0].bytesBase64Encoded;
      const imageUrl = `data:image/png;base64,${base64Image}`;

      // Cache the result
      imageCache[characterId] = imageUrl;

      console.log('[Gemini] SUCCESS - Image generated for:', characterId);
      return {
        imageUrl,
        success: true,
      };
    } else {
      console.log('[Gemini] ERROR: Unexpected response format');
      return {
        imageUrl: '',
        success: false,
        error: 'Unexpected response format from Gemini API',
      };
    }
  } catch (error: any) {
    console.error('[Gemini] ERROR:', error.response?.status, error.response?.data || error.message);

    // Check for specific error types
    if (error.response?.status === 400) {
      return {
        imageUrl: '',
        success: false,
        error: 'Invalid request. The image could not be generated.',
      };
    } else if (error.response?.status === 403) {
      return {
        imageUrl: '',
        success: false,
        error: 'API key does not have access to Imagen. Please check your Gemini API permissions.',
      };
    } else if (error.response?.status === 429) {
      return {
        imageUrl: '',
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }

    return {
      imageUrl: '',
      success: false,
      error: error.response?.data?.error?.message || 'Failed to generate image. Please try again.',
    };
  }
};

// Generate all character images
export const generateAllCharacterImages = async (
  characterIds: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Record<string, ImageGenerationResult>> => {
  const results: Record<string, ImageGenerationResult> = {};

  for (let i = 0; i < characterIds.length; i++) {
    const characterId = characterIds[i];
    results[characterId] = await generateCharacterImage(characterId);
    onProgress?.(i + 1, characterIds.length);

    // Small delay between requests to avoid rate limiting
    if (i < characterIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
