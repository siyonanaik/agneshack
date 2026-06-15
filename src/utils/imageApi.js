// Agnes AI Image Generation API
// Generates medical visualization images via Agnes AI

const BASE_URL = import.meta.env.VITE_AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const API_KEY = import.meta.env.VITE_AGNES_API_KEY;
const IMAGE_MODEL = import.meta.env.VITE_IMAGE_MODEL || 'agnes-image-2.1-flash';

/**
 * Generates an image via Agnes AI
 * @param {Object} params - Image generation parameters
 * @param {string} params.prompt - Description of the image to generate
 * @param {string} params.size - Output image size (e.g., "1024x1024")
 * @returns {Promise<Object>} - Response containing image URL
 */
async function generateImage(params) {
  const { prompt, size = '1024x1024' } = params;

  if (!API_KEY) {
    throw new Error('Agnes AI API key is not configured. Please set VITE_AGNES_API_KEY in your environment variables.');
  }

  if (!prompt) {
    throw new Error('Image prompt is required.');
  }

  try {
    const response = await fetch(`${BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        model: IMAGE_MODEL,
        size: size
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Image API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse image API response.');
    }
    throw error;
  }
}

/**
 * Generates a medical visualization image for a specific finding
 * @param {Object} finding - A medical finding object
 * @param {string} language - Language for the prompt context
 * @returns {Promise<Object>} - Image URL and metadata
 */
async function generateMedicalImage(finding, language = 'English') {
  const findingName = finding?.item || 'medical condition';
  const findingStatus = finding?.status || 'unknown';
  const findingExplanation = finding?.explanation || '';

  const prompt = `Generate a clear, educational medical illustration showing: ${findingName}. ${findingExplanation} This should be a simple, informative medical diagram suitable for patient education. Status: ${findingStatus}.`;

  return generateImage({ prompt, size: '1024x1024' });
}

export {
  generateImage,
  generateMedicalImage
};