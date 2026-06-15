// Agnes AI Video Generation API
// Creates educational video tasks and retrieves results
// Model: agnes-video-v2.0

const BASE_URL = import.meta.env.VITE_AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const API_KEY = import.meta.env.VITE_AGNES_API_KEY;
const VIDEO_MODEL = import.meta.env.VITE_VIDEO_MODEL || 'agnes-video-v2.0';

/**
 * Creates a video generation task via Agnes AI
 * @param {Object} params - Video generation parameters
 * @param {string} params.prompt - Description of the video content to generate
 * @param {string} params.language - Language for the video narration/text
 * @param {string} params.finding - The medical finding context
 * @returns {Promise<Object>} - Response containing video_id and status
 */
async function createVideoTask(params) {
  const { prompt, language = 'English', finding = '' } = params;

  if (!API_KEY) {
    throw new Error('Agnes AI API key is not configured. Please set VITE_AGNES_API_KEY in your environment variables.');
  }

  if (!prompt) {
    throw new Error('Video prompt is required.');
  }

  try {
    const response = await fetch(`${BASE_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: VIDEO_MODEL,
        prompt: prompt,
        height: 540,
        width: 960,
        num_frames: 81,
        frame_rate: 15
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Video API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse video API response.');
    }
    throw error;
  }
}

/**
 * Retrieves video result using video_id (recommended method)
 * @param {string} videoId - The ID of the generated video
 * @param {string} modelName - Optional model name override
 * @returns {Promise<Object>} - Video URL and metadata
 */
async function getVideoResult(videoId, modelName) {
  if (!videoId) {
    throw new Error('video_id is required.');
  }

  let url = `https://apihub.agnes-ai.com/agnesapi?video_id=${videoId}`;
  if (modelName) {
    url += `&model_name=${modelName}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Video retrieval failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves video result using task_id (legacy method)
 * @param {string} taskId - The ID of the video task
 * @returns {Promise<Object>} - Video URL and metadata
 */
async function getVideoResultLegacy(taskId) {
  if (!taskId) {
    throw new Error('task_id is required.');
  }

  try {
    const response = await fetch(`${BASE_URL}/videos/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Video retrieval failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Polls for video completion until ready or timeout
 * @param {string} videoId - The ID of the generated video
 * @param {number} maxAttempts - Maximum number of polling attempts
 * @param {number} interval - Milliseconds between polls
 * @returns {Promise<Object>} - Final video result
 */
async function pollForVideoCompletion(videoId, maxAttempts = 60, interval = 2000) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const result = await getVideoResult(videoId);

      // Check if video is completed - URL field is remixed_from_video_id
      if (result.status === 'completed') {
        return result;
      }

      // Check if video is still processing
      if (result.status === 'in_progress' || result.status === 'queued') {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, interval));
        continue;
      }

      // Check if video failed
      if (result.status === 'failed') {
        const errorMsg = result.error?.message || result.error?.detail || 'Video generation failed.';
        throw new Error(errorMsg);
      }

      // If we have a URL directly (remixed_from_video_id is the video URL)
      if (result.remixed_from_video_id) {
        return result;
      }

      // If we get data but aren't sure of status, keep polling
      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      if (error.message?.includes('Video generation failed') || error.message?.includes('API key')) {
        throw error;
      }
      // Network errors during polling - retry
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('Video generation timed out after maximum attempts. Please try again.');
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error('Video generation timed out after maximum attempts. Please try again.');
}

export {
  createVideoTask,
  getVideoResult,
  getVideoResultLegacy,
  pollForVideoCompletion
};