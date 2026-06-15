import { useState } from 'react';
import { generateBilingualScript, getSamplePhrases } from '../utils/bilingualScript';
import { t } from '../utils/translations';

function PrepareForClinic({ healthConcerns, setHealthConcerns, language, aiResponse }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Bengali');
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

  // If no health concerns, show a subtle prompt button
  if (!healthConcerns || healthConcerns.length === 0) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium shadow-sm flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        {t(language, 'prepareForClinic')}
      </button>
    );
  }

  // Show current concerns with option to open modal
  return (
    <>
      {/* Current Concerns Summary */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {t(language, 'prepareForClinic')}
          </h4>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {t(language, 'addConcern')}
          </button>
        </div>
        <div className="space-y-1.5">
          {healthConcerns.map((concern, index) => (
            <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-gray-700 flex-1">{concern}</span>
              <button
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
              <h3 className="text-lg font-bold text-white">{t(language, 'prepareForClinic')}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Description */}
              <p className="text-sm text-gray-600">
                {t(language, 'healthConcernsSubtitle')}
              </p>

              {/* Sample Phrases */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t(language, 'samplePhrases')}</h4>
                <div className="flex flex-wrap gap-2">
                  {getSamplePhrases().map((phrase, index) => (
                    <button
                      key={index}
                      onClick={() => addSamplePhrase(phrase)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      + {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t(language, 'orTypeYourOwn')}</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())}
                    placeholder="e.g., I have been feeling tired..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                  <button
                    onClick={addConcern}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    {t(language, 'addConcern')}
                  </button>
                </div>
              </div>

              {/* List of Added Concerns */}
              {healthConcerns.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t(language, 'healthConcerns')} ({healthConcerns.length})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {healthConcerns.map((concern, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-400 w-5 text-center">{index + 1}.</span>
                        <span className="text-sm text-gray-700 flex-1">{concern}</span>
                        <button
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

              {/* Generate Script Button */}
              {healthConcerns.length > 0 && (
                <>
                  {/* Language Selector */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Translate to:</h4>
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
                        <h4 className="text-sm font-medium text-gray-700">{t(language, 'clinicScriptGenerated')}</h4>
                        <button
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
                      <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3">
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
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                {t(language, 'close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PrepareForClinic;