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

// Primary model for image generation - gemini-2.0-flash-exp supports image output
const IMAGE_GENERATION_MODEL = 'gemini-2.0-flash-exp';

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

// Try to generate image with retry logic for rate limits
const tryGenerateWithRetry = async (
  prompt: string,
  maxRetries: number = 3
): Promise<ImageGenerationResult | null> => {
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt + 1}/${maxRetries} for image generation...`);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_GENERATION_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Generate an anime-style character portrait image: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 90000, // 90 second timeout for image generation
        }
      );

      console.log('[Gemini] Response received');

      // Parse the response - look for inline image data
      const candidates = response.data?.candidates;
      if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData?.mimeType?.startsWith('image/')) {
            const base64Image = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            const imageUrl = `data:${mimeType};base64,${base64Image}`;

            console.log('[Gemini] SUCCESS - Image generated!');
            return {
              imageUrl,
              success: true,
            };
          }
        }
      }

      // No image in response
      console.log('[Gemini] Response had no image data');
      return null;

    } catch (error: any) {
      lastError = error;
      const status = error.response?.status;

      console.log(`[Gemini] Request failed with status ${status}:`, error.message);

      // If rate limited, wait and retry with exponential backoff
      if (status === 429) {
        const waitTime = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
        console.log(`[Gemini] Rate limited. Waiting ${waitTime / 1000}s before retry...`);
        await delay(waitTime);
        continue;
      }

      // For other errors, don't retry
      break;
    }
  }

  // All retries failed
  const errorMessage = lastError?.response?.data?.error?.message || lastError?.message || 'Unknown error';
  console.log('[Gemini] All retries failed:', errorMessage);
  return null;
};

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

  // Try to generate with retries
  const result = await tryGenerateWithRetry(prompt);

  if (result && result.success) {
    // Cache the successful result
    imageCache[characterId] = result.imageUrl;
    return result;
  }

  // Generation failed
  console.log('[Gemini] Image generation failed for:', characterId);
  return {
    imageUrl: '',
    success: false,
    error: 'Image generation failed. The API may be rate limited or the model may not support image generation. Please try again in a moment.',
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

    // Longer delay between requests to avoid rate limiting (3 seconds)
    if (i < characterIds.length - 1) {
      await delay(3000);
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
