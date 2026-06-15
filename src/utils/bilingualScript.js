/**
 * Bilingual Script Generator for "Prepare for Clinic" feature
 * Translates common symptom phrases into supported languages
 */

// Common symptom phrases and their translations
const SYMPTOM_PHRASES = {
  // Pain-related
  'I have chest pain when working.': {
    'Bengali': 'আমি কাজ করার সময় বুকে ব্যথা অনুভব করি।',
    'Tamil': 'பணி செய்யும்போது எனக்கு மார்பில் வலி உள்ளது.',
    'Mandarin': '我工作时胸口痛。',
    'Thai': 'ฉันเจ็บหน้าอกตอนทำงาน',
  },
  'The pain started 3 days ago.': {
    'Bengali': 'ব্যথা শুরু হয়েছে ৩ দিন আগে।',
    'Tamil': 'வலி 3 நாட்களுக்கு முன் தொடங்கியது.',
    'Mandarin': '疼痛是3天前开始的。',
    'Thai': 'ปวดมา3วันแล้ว',
  },
  'I feel dizzy sometimes.': {
    'Bengali': 'কখনও কখনও আমার চक्কার হয়।',
    'Tamil': 'சில சமயங்களில் எனக்கு தலைச்சுற்று ஏற்படுகிறது.',
    'Mandarin': '我有时会感到头晕。',
    'Thai': 'บางครั้งรู้สึกวิงเวียน',
  },
  'I have a headache.': {
    'Bengali': 'মাথাব্যথা হচ্ছে।',
    'Tamil': 'எனக்கு தலைவலி உள்ளது.',
    'Mandarin': '我头痛。',
    'Thai': 'ฉันปวดหัว',
  },
  'I have back pain.': {
    'Bengali': 'পিঠ ব্যথা করছে।',
    'Tamil': 'எனக்கு முதுகு வலி உள்ளது.',
    'Mandarin': '我背痛。',
    'Thai': 'ฉันปวดหลัง',
  },
  'I have stomach pain.': {
    'Bengali': 'পেটে ব্যথা হচ্ছে।',
    'Tamil': 'எனக்கு வயிற்று வலி உள்ளது.',
    'Mandarin': '我胃痛。',
    'Thai': 'ฉันปวดท้อง',
  },
  // Fatigue-related
  'I have been feeling very tired lately.': {
    'Bengali': 'আমি সাম্প্রতিক খুব ক্লান্ত বোধ করছি।',
    'Tamil': 'சமீபமாக நான் மிகவும் சோர்வு அடைகிறேன்.',
    'Mandarin': '我最近一直感到很累。',
    'Thai': 'ฉันรู้สึกเหนื่อยมาก lately',
  },
  'I can\'t sleep well at night.': {
    'Bengali': 'রাতে আমি ভালো ঘুমোতে পারি না।',
    'Tamil': 'இரவில் நன்றாக உறங்க முடியாது.',
    'Mandarin': '我晚上睡不好。',
    'Thai': 'ฉันนอนไม่หลับตอนกลางคืน',
  },
  // Breathing-related
  'I have difficulty breathing.': {
    'Bengali': 'আমার শ্বাস নিতে সমস্যা হচ্ছে।',
    'Tamil': 'எனக்கு சுவாசிக்க கடினமாக உள்ளது.',
    'Mandarin': '我呼吸困难。',
    'Thai': 'ฉันหายใจลำบาก',
  },
  'I have a cough.': {
    'Bengali': 'আমার কাশি হচ্ছে।',
    'Tamil': 'எனக்கு இருமல் உள்ளது.',
    'Mandarin': '我咳嗽。',
    'Thai': 'ฉันไอ',
  },
  // Other common symptoms
  'I have a fever.': {
    'Bengali': 'আমার জ্বর হয়েছে।',
    'Tamil': 'எனக்கு காய்ச்சல் உள்ளது.',
    'Mandarin': '我发烧了。',
    'Thai': 'ฉันมีไข้',
  },
  'My blood pressure has been high.': {
    'Bengali': 'আমার রক্তচাপ বেশি হচ্ছে।',
    'Tamil': 'எனது இரத்த அழுத்தம் அதிகமாக உள்ளது.',
    'Mandarin': '我的血压很高。',
    'Thai': 'ความดันเลือดของฉันสูง',
  },
  'I have joint pain.': {
    'Bengali': 'আমার জয়েন্ট ব্যথা করছে।',
    'Tamil': 'எனக்கு மூட்டு வலி உள்ளது.',
    'Mandarin': '我关节痛。',
    'Thai': 'ฉันปวดข้อ',
  },
  'I feel anxious sometimes.': {
    'Bengali': 'কখনও কখনও আমি উদ্বিগ্ন বোধ করি।',
    'Tamil': 'சில சமயங்களில் நான் கவலை அடைகிறேன்.',
    'Mandarin': '我有时感到焦虑。',
    'Thai': 'บางครั้งรู้สึกกังวล',
  },
  'I have nausea.': {
    'Bengali': 'আমার বমি বমি ভাব হচ্ছে।',
    'Tamil': 'எனக்கு வாந்தி எடுக்கிறது.',
    'Mandarin': '我感到恶心。',
    'Thai': 'ฉันรู้สึกคลื่นไส้',
  },
};

/**
 * Check if two strings are similar using word overlap
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0-1)
 */
function calculateSimilarity(str1, str2) {
  const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  for (const word of words1) {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matches++;
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

/**
 * Generate bilingual script from user's health concerns
 * @param {string[]} healthConcerns - Array of user's health concern statements
 * @param {string} language - Target language for translation
 * @returns {object[]} - Array of {english, translated} objects
 */
export function generateBilingualScript(healthConcerns, language) {
  if (!healthConcerns || !Array.isArray(healthConcerns) || healthConcerns.length === 0) {
    return [];
  }

  const script = healthConcerns.map(concern => {
    // Try to find exact match first
    const exactMatch = SYMPTOM_PHRASES[concern];
    if (exactMatch && exactMatch[language]) {
      return {
        english: concern,
        translated: exactMatch[language],
        language: language,
      };
    }

    // Try partial match with word-level similarity (only if score > 0.5)
    let bestMatch = null;
    let bestScore = 0;

    for (const [phrase, translations] of Object.entries(SYMPTOM_PHRASES)) {
      const score = calculateSimilarity(concern, phrase);
      if (score > bestScore && score > 0.4) {
        bestScore = score;
        bestMatch = translations;
      }
    }

    if (bestMatch) {
      return {
        english: concern,
        translated: bestMatch[language] || concern,
        language: language,
      };
    }

    // If no match found, return the original text
    return {
      english: concern,
      translated: concern,
      language: language,
      notTranslated: true,
    };
  });

  return script;
}

/**
 * Get all supported target languages
 * @returns {string[]} - Array of language names
 */
export function getSupportedLanguages() {
  return ['Bengali', 'Tamil', 'Mandarin', 'Thai'];
}

/**
 * Get sample phrases for user reference
 * @returns {object[]} - Array of sample phrases
 */
export function getSamplePhrases() {
  return Object.keys(SYMPTOM_PHRASES).slice(0, 6);
}

export default generateBilingualScript;