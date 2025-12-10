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

// Character image prompts for realistic, romantic fairytale style
const CHARACTER_PROMPTS: Record<string, string> = {
  pratima: `A beautiful Indian queen with warm brown skin, elegant long black hair adorned with delicate gold jewelry and a jeweled tiara. She has kind, expressive dark eyes with a gentle smile. Wearing a royal lavender and gold saree with intricate embroidery. Soft moonlit lighting, dreamy romantic atmosphere, portrait style, ethereal and magical, fantasy art, digital painting, highly detailed, soft focus background with sparkles`,

  pranav: `A handsome Indian prince with warm brown skin, well-groomed dark hair, and gentle brown eyes full of love. He wears a royal purple sherwani with gold embroidery and a small crown. Soft moonlit lighting, dreamy romantic atmosphere, portrait style, ethereal and magical, fantasy art, digital painting, highly detailed, soft focus background with sparkles`,

  lanka: `A comedic fantasy fog-ogre knight with greenish-gray skin, wearing comically oversized ornate armor. He has a proud, overconfident expression despite looking slightly ridiculous. Misty fog swirls around him. Whimsical fantasy art style, humorous character portrait, soft magical lighting, digital painting`,

  jinal: `A mystical parrot witch with vibrant green and red feathers, wearing a tiny witch hat and small spectacles. She has an expressive, dramatic look with feathers ruffled in mid-gossip. Perched on a magical crystal ball. Whimsical fantasy art, colorful, magical atmosphere, digital painting, humorous character portrait`,

  pavani: `A beautiful weeping willow spirit - a translucent feminine figure made of flowing willow branches and leaves, with glowing tear-drop shaped lights around her. Her expression is dramatically sad but in a comedic, over-the-top way. Ethereal forest setting, magical atmosphere, fantasy digital art, soft green and blue lighting`,

  ramaya: `A scholarly character - an elderly figure with wise but comically proud expression, wearing academic robes covered in useless magical symbols. Holding a glowing scroll that says nothing important. Surrounded by floating books. Fantasy library setting, warm candlelight, whimsical academic style, digital painting`,
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

  // If custom prompt is provided but doesn't have style info, add it
  if (customPrompt && !customPrompt.includes('fantasy art')) {
    prompt = `${customPrompt}. Soft moonlit lighting, dreamy romantic atmosphere, portrait style, ethereal and magical, fantasy art, digital painting, highly detailed`;
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
