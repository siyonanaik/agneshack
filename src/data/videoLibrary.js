// Educational video library for common medical conditions
// Videos are organized by condition category for easy matching with AI analysis findings

export const VIDEO_LIBRARY = [
  // Diabetes
  {
    id: 'diabetes-overview',
    title: 'Understanding Diabetes',
    description: 'Learn what diabetes is, how it affects your body, and what you can do to manage it.',
    category: 'Diabetes',
    keywords: ['diabetes', 'sugar', 'glucose', 'hba1c', 'blood sugar'],
    duration: '5:30',
    language: 'English',
    url: 'https://www.youtube.com/embed/ok-M1c67Ylk', // Placeholder - replace with actual video URL
    thumbnail: null,
    severity: ['HIGH', 'BORDERLINE'],
  },
  {
    id: 'diabetes-bengali',
    title: 'মধুমেহ সম্পর্কে জানুন (Understanding Diabetes - Bengali)',
    description: 'ডায়াবেটিস কী এবং এটি কীভাবে আপনার শরীরকে প্রভাবিত করে।',
    category: 'Diabetes',
    keywords: ['diabetes', 'sugar', 'glucose', 'hba1c', 'blood sugar', 'মধুমেহ', 'ডায়াবেটিস'],
    duration: '6:00',
    language: 'Bengali',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },
  {
    id: 'diabetes-tamil',
    title: 'சர்க்கரை நோயை புரிந்து கொள்ளுங்கள் (Understanding Diabetes - Tamil)',
    description: 'சர்க்கரை நோய் என்பது என்ன மற்றும் இது உங்கள் உடலை எவ்வாறு பாதிக்கிறது.',
    category: 'Diabetes',
    keywords: ['diabetes', 'sugar', 'glucose', 'hba1c', 'blood sugar'],
    duration: '5:45',
    language: 'Tamil',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },

  // Hypertension
  {
    id: 'hypertension-overview',
    title: 'Understanding High Blood Pressure',
    description: 'Learn about hypertension, its risks, and lifestyle changes to help control it.',
    category: 'Hypertension',
    keywords: ['blood pressure', 'hypertension', 'bp', 'systolic', 'diastolic', 'pressure'],
    duration: '4:45',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },

  // Cholesterol
  {
    id: 'cholesterol-overview',
    title: 'Understanding Cholesterol Levels',
    description: 'What is cholesterol? Learn about HDL, LDL, and how to keep your levels healthy.',
    category: 'Cholesterol',
    keywords: ['cholesterol', 'hdl', 'ldl', 'lipid', 'fat', 'triglyceride'],
    duration: '5:00',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },

  // Anemia
  {
    id: 'anemia-overview',
    title: 'Understanding Anemia',
    description: 'What causes anemia, its symptoms, and how to improve your iron levels through diet.',
    category: 'Anemia',
    keywords: ['anemia', 'iron', 'hemoglobin', 'hb', 'blood count'],
    duration: '4:30',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },

  // Thyroid
  {
    id: 'thyroid-overview',
    title: 'Understanding Thyroid Function',
    description: 'Learn about TSH, thyroid hormones, and how thyroid affects your overall health.',
    category: 'Thyroid',
    keywords: ['thyroid', 'tsh', 't3', 't4', 'hormone'],
    duration: '5:15',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },

  // Asthma
  {
    id: 'asthma-overview',
    title: 'Managing Asthma Daily',
    description: 'Understanding asthma triggers, using inhalers correctly, and staying active.',
    category: 'Asthma',
    keywords: ['asthma', 'breathing', 'inhaler', 'lungs', 'respiratory'],
    duration: '4:50',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },

  // Liver
  {
    id: 'liver-overview',
    title: 'Understanding Liver Function Tests',
    description: 'What your liver enzymes tell you and how to keep your liver healthy.',
    category: 'Liver',
    keywords: ['liver', 'enzyme', 'alt', 'ast', 'bilirubin', 'hepatitis'],
    duration: '5:30',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },

  // Kidney
  {
    id: 'kidney-overview',
    title: 'Understanding Kidney Function',
    description: 'What creatinine and urea levels mean and how to protect your kidney health.',
    category: 'Kidney',
    keywords: ['kidney', 'creatinine', 'urea', 'urine', 'renal', 'egfr'],
    duration: '5:00',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['HIGH', 'BORDERLINE'],
  },

  // General Health
  {
    id: 'general-health-tips',
    title: 'Basic Health & Hygiene Tips',
    description: 'Simple daily habits to improve your health, stay clean, and prevent illness.',
    category: 'General Health',
    keywords: ['health', 'hygiene', 'clean', 'wellness', 'prevent', 'diet', 'exercise'],
    duration: '6:00',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['NORMAL', 'BORDERLINE', 'HIGH'],
  },
  {
    id: 'nutrition-basics',
    title: 'Nutrition Basics for Workers',
    description: 'Affordable and nutritious food choices to stay healthy and energetic at work.',
    category: 'Nutrition',
    keywords: ['nutrition', 'food', 'diet', 'protein', 'vitamin', 'iron', 'healthy'],
    duration: '5:30',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['NORMAL', 'BORDERLINE', 'HIGH'],
  },
  {
    id: 'mental-wellness',
    title: 'Mental Wellness & Stress Management',
    description: 'Simple techniques to manage stress, sleep better, and stay mentally healthy.',
    category: 'Mental Health',
    keywords: ['stress', 'mental', 'sleep', 'anxiety', 'wellness', 'depression'],
    duration: '5:00',
    language: 'English',
    url: 'https://www.youtube.com/embed/example',
    severity: ['NORMAL', 'BORDERLINE', 'HIGH'],
  },
];

// Default fallback video when no specific match is found
export const DEFAULT_VIDEO = {
  id: 'general-health-tips',
  title: 'Basic Health & Hygiene Tips',
  description: 'Simple daily habits to improve your health, stay clean, and prevent illness.',
  url: 'https://www.youtube.com/embed/example',
};

/**
 * Match videos to findings based on keywords
 * @param {Array} findings - Array of finding objects from AI analysis
 * @param {String} preferredLanguage - User's preferred language
 * @returns {Array} - Matching video objects
 */
export function matchVideosToFindings(findings, preferredLanguage = 'English') {
  if (!findings || findings.length === 0) {
    return [DEFAULT_VIDEO];
  }

  // Collect all keywords from findings
  const findingKeywords = new Set();
  findings.forEach(finding => {
    const text = `${finding.item} ${finding.explanation || ''}`.toLowerCase();
    const words = text.split(/\s+/);
    words.forEach(w => findingKeywords.add(w));
  });

  // Score each video by keyword matches
  const scored = VIDEO_LIBRARY.map(video => {
    let score = 0;
    video.keywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      if (findingKeywords.has(lowerKeyword)) {
        score += 2;
      }
      // Partial match
      findingKeywords.forEach(fk => {
        if (fk.includes(lowerKeyword) || lowerKeyword.includes(fk)) {
          score += 1;
        }
      });
    });

    // Boost score for language match
    if (video.language === preferredLanguage || video.language === 'English') {
      score += 1;
    }

    return { ...video, score };
  });

  // Filter and sort
  const matched = scored
    .filter(v => v.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4); // Top 4 matches

  return matched.length > 0 ? matched : [DEFAULT_VIDEO];
}

/**
 * Get videos by category
 */
export function getVideosByCategory(category) {
  return VIDEO_LIBRARY.filter(v => v.category === category);
}

/**
 * Get videos by language
 */
export function getVideosByLanguage(language) {
  return VIDEO_LIBRARY.filter(v => v.language === language || v.language === 'English');
}