import { useState } from 'react';
import { generateBilingualScript, getSamplePhrases } from '../utils/bilingualScript';
import { t } from '../utils/translations';

function PrepareForClinic({ healthConcerns, setHealthConcerns, language, aiResponse }) {
  // Map response language to translation target language
  const getDefaultTargetLang = () => {
    // If user selected Bengali response language, use Bengali translations
    // Otherwise default to Bengali as the fallback for migrant workers
    return 'Bengali';
  };
  const [selectedLanguage, setSelectedLanguage] = useState(getDefaultTargetLang());
  const [copied, setCopied] = useState(false);
  const [newConcern, setNewConcern] = useState('');

  // Generate bilingual script
  const script = healthConcerns && healthConcerns.length > 0
    ? generateBilingualScript(healthConcerns, selectedLanguage)
    : [];

  // Copy script to clipboard
  const handleCopy = () => {
    const scriptText = script.map(item => 
      `${item.english}\n${item.translated}${item.notTranslated ? ' (not translated)' : ''}`
    ).join('\n\n');

    navigator.clipboard.writeText(scriptText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Add a concern
  const addConcern = () => {
    if (newConcern.trim()) {
      setHealthConcerns([...(healthConcerns || []), newConcern.trim()]);
      setNewConcern('');
    }
  };

  // Remove a concern
  const removeConcern = (index) => {
    setHealthConcerns(healthConcerns.filter((_, i) => i !== index));
  };

  // Quick add sample phrase
  const addSamplePhrase = (phrase) => {
    if (!healthConcerns?.includes(phrase)) {
      setHealthConcerns([...(healthConcerns || []), phrase]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Description */}
      <p className="text-sm text-gray-600">
        {t(language, 'healthConcernsSubtitle')}
      </p>

      {/* Sample Phrases */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-2">{t(language, 'samplePhrases')}</h4>
        <div className="flex flex-wrap gap-2">
          {getSamplePhrases().map((phrase, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addSamplePhrase(phrase)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors border border-blue-200"
            >
              + {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input - Always visible */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-2">{t(language, 'orTypeYourOwn')}</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newConcern}
            onChange={(e) => setNewConcern(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addConcern();
              }
            }}
            placeholder="e.g., I have been feeling tired..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          <button
            type="button"
            onClick={addConcern}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            {t(language, 'addConcern')}
          </button>
        </div>
      </div>

      {/* List of Added Concerns */}
      {healthConcerns && healthConcerns.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            {t(language, 'healthConcerns')} ({healthConcerns.length})
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {healthConcerns.map((concern, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-400 w-5 text-center">{index + 1}.</span>
                <span className="text-sm text-gray-700 flex-1">{concern}</span>
                <button
                  type="button"
                  onClick={() => removeConcern(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Script Section */}
      {healthConcerns && healthConcerns.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* Language Selector */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">Translate to:</h4>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Mandarin">Mandarin (中文)</option>
              <option value="Thai">Thai (ไทย)</option>
            </select>
          </div>

          {/* Generated Script */}
          {script.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-gray-700">{t(language, 'clinicScriptGenerated')}</h4>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    copied
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {copied ? t(language, 'scriptCopied') : t(language, 'copyScript')}
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3">
                {script.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-2 border border-gray-100">
                    <p className="text-sm text-gray-800 font-medium">{item.english}</p>
                    <p className="text-sm text-blue-600 mt-0.5">{item.translated}</p>
                    {item.notTranslated && (
                      <p className="text-xs text-amber-500 mt-0.5">Not available in {selectedLanguage}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PrepareForClinic;