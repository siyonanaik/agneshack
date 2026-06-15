// Agnes AI Integration Utility
// Sends extracted medical report text to Agnes AI and returns parsed JSON analysis

const BASE_URL = import.meta.env.VITE_AGNES_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const API_KEY = import.meta.env.VITE_AGNES_API_KEY;
const MODEL = import.meta.env.VITE_AGNES_MODEL || 'agnes-2.0-flash';

/**
 * Medical translation system prompt.
 * Instructs the model to return a structured JSON response.
 */
function buildSystemPrompt(language) {
  return `You are a medical report analysis assistant. Analyze the provided medical report text and return a JSON object with the following structure. Respond in ${language}.

Return a JSON object with this exact structure:
{
  "summary": "A brief 2-3 sentence plain-language summary of the medical report.",
  "findings": [
    {
      "item": "Name of the finding or test result",
      "explanation": "Simple explanation of what this finding means in plain language.",
      "status": "NORMAL | BORDERLINE | HIGH | LOW"
    }
  ],
  "questions": [
    "Question 1 to ask the doctor",
    "Question 2 to ask the doctor",
    "Question 3 to ask the doctor"
  ],
  "disclaimer": "A brief disclaimer that this is AI-generated and not a substitute for professional medical advice."
}

Rules:
- The "summary" should be 2-3 sentences in plain language that a layperson can understand.
- The "findings" array should contain 3 to 5 key findings from the report. Each finding must have an "item", "explanation", and "status".
- The "status" field must be one of: "NORMAL", "BORDERLINE", "HIGH", or "LOW".
- The "questions" array should contain 3 to 5 relevant questions the patient should ask their doctor.
- The "disclaimer" should be a short sentence reminding the user to consult a healthcare professional.
- Return ONLY valid JSON. Do not include markdown fences, code blocks, or any extra text outside the JSON object.`;
}

/**
 * Sends extracted text to Agnes AI model for processing.
 * @param {string} extractedText - The text content to send to the model.
 * @param {string} language - The language for the model to respond in (e.g., "English", "Mandarin").
 * @param {object} options - Optional parameters.
 * @param {string[]} options.healthConcerns - User's self-reported health concerns/symptoms.
 * @returns {Promise<object>} - Parsed JSON response with summary, findings, questions, and disclaimer.
 */
async function sendToAgnes(extractedText, language, options = {}) {
  // Validate inputs
  if (!extractedText || typeof extractedText !== 'string') {
    throw new Error('extractedText must be a non-empty string.');
  }
  if (!language || typeof language !== 'string') {
    throw new Error('language must be a non-empty string.');
  }
  if (!API_KEY) {
    throw new Error('API key is not configured. Please set VITE_AGNES_API_KEY in your environment variables.');
  }

  const systemPrompt = buildSystemPrompt(language);

  // Build the request body using OpenAI-compatible chat completions format
  let userContent = extractedText;
  
  // Add health concerns context if provided
  const healthConcerns = options?.healthConcerns || [];
  if (healthConcerns && healthConcerns.length > 0) {
    userContent = `
PATIENT'S HEALTH CONCERNS & SYMPTOMS:
${healthConcerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

---

MEDICAL REPORT TEXT TO ANALYZE:
${extractedText}
`;
  }

  const requestBody = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    response_format: { type: 'json_object' }
  };

  try {
    const apiUrl = `${BASE_URL}/chat/completions`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    // Extract the assistant's reply text from the response
    const replyText = data?.choices?.[0]?.message?.content;
    if (!replyText || typeof replyText !== 'string' || replyText.trim().length === 0) {
      throw new Error('Received an empty response from Agnes AI.');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Try to find JSON in the response (in case model wraps it in markdown code blocks)
      let jsonContent = replyText.trim();
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
      parsedResponse = JSON.parse(jsonContent);
    } catch (parseError) {
      throw new Error('Received invalid JSON from Agnes AI. Response: ' + replyText.substring(0, 200));
    }

    // Validate expected structure
    const { summary, findings, questions, disclaimer } = parsedResponse;
    if (!summary) {
      throw new Error('Missing "summary" field in AI response.');
    }
    if (!Array.isArray(findings) || findings.length === 0) {
      throw new Error('Missing or empty "findings" array in AI response.');
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Missing or empty "questions" array in AI response.');
    }
    if (!disclaimer) {
      throw new Error('Missing "disclaimer" field in AI response.');
    }

    // Validate each finding has required fields
    const validStatuses = ['NORMAL', 'BORDERLINE', 'HIGH', 'LOW'];
    for (let i = 0; i < findings.length; i++) {
      const finding = findings[i];
      if (!finding.item || !finding.explanation || !finding.status) {
        throw new Error('Missing required field in finding ' + (i + 1) + '. Expected "item", "explanation", and "status".');
      }
      if (!validStatuses.includes(finding.status)) {
        throw new Error('Invalid status "' + finding.status + '" in finding ' + (i + 1) + '. Must be one of: ' + validStatuses.join(', '));
      }
    }

    return parsedResponse;
  } catch (error) {
    // Handle network or parsing errors
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse API response as JSON.');
    }
    // Re-throw our custom errors
    throw error;
  }
}

export default sendToAgnes;