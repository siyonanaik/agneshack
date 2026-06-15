import { useState, useCallback, useEffect, useRef } from 'react';
import UploadZone from './components/UploadZone';
import ResultsDisplay from './components/ResultsDisplay';
import ProfileSettings from './components/ProfileSettings';
import PatientHistory from './components/PatientHistory';
import CameraScanner from './components/CameraScanner';
import VideoExplanation from './components/VideoExplanation';
import RoadmapView from './components/RoadmapView';
import PrepareForClinic from './components/PrepareForClinic';
import sendToAgnes from './utils/agnesApi';
import { saveToHistory, getSavedLanguage, saveLanguage, clearHistory } from './utils/storage';
import { getProfile } from './utils/profile';
import { t } from './utils/translations';

// Supported languages for MediClear
const SUPPORTED_LANGUAGES = [
  { value: 'English', label: 'English', flag: '🇬🇧' },
  { value: 'Mandarin', label: 'Mandarin', flag: '🇨🇳' },
  { value: 'Bengali', label: 'Bengali', flag: '🇧🇩' },
  { value: 'Tamil', label: 'Tamil', flag: '🇮🇳' },
  { value: 'Thai', label: 'Thai', flag: '🇹🇭' },
];

// Generate a simple unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Format date nicely
const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

function App() {
  const [appState, setAppState] = useState('idle');
  const [extractedText, setExtractedText] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [language, setLanguage] = useState(() => getSavedLanguage());
  const [healthConcerns, setHealthConcerns] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [patientHistoryOpen, setPatientHistoryOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const exportCardRef = useRef(null);

  // Load profile on mount
  useEffect(() => {
    const savedProfile = getProfile();
    if (savedProfile) {
      setProfileData(savedProfile);
    }
  }, []);

  // Persist language to localStorage whenever it changes
  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  // Handle when text is extracted from upload zone or camera
  const handleTextExtracted = useCallback((text, name) => {
    setExtractedText(text);
    setFileName(name || 'Camera Capture');
    setAiResponse(null);
    setErrorMessage(null);
    setAppState('analyzing');

    // Send to Agnes with health concerns context
    sendToAgnes(text, language, { healthConcerns })
      .then((response) => {
        if (!response || typeof response !== 'object') {
          setAppState('error');
          setErrorMessage('Received an invalid response from Agnes AI. Please try again.');
          return;
        }

        setAiResponse(response);
        setAppState('success');

        saveToHistory({
          id: generateId(),
          fileName: name || 'Camera Capture',
          date: new Date().toISOString(),
          resultPreview: response.summary?.substring(0, 150) + (response.summary?.length > 150 ? '...' : '') || 'Analysis complete',
          fullResponse: response,
          language,
        });
      })
      .catch((err) => {
        console.error('API error:', err);
        setAppState('error');
        if (err.message && err.message.includes('API key')) {
          setErrorMessage('Configuration error: Agnes AI API key is not set. Please check your environment variables.');
        } else if (err.message && err.message.includes('empty response')) {
          setErrorMessage('Received an empty response from Agnes AI. Please try again.');
        } else if (err.message && err.message.includes('JSON')) {
          setErrorMessage('Invalid response format from Agnes AI. The AI returned malformed JSON. Please try again.');
        } else if (err.message && err.message.includes('Missing')) {
          setErrorMessage('Incomplete response from Agnes AI. Some required fields are missing. Please try again.');
        } else {
          setErrorMessage(err.message || 'Unable to connect to Agnes AI. Please check your connection and try again.');
        }
      });
  }, [language]);

  // Handle reset to start a new scan
  const handleReset = useCallback(() => {
    setAppState('idle');
    setExtractedText(null);
    setAiResponse(null);
    setErrorMessage(null);
    setFileName(null);
    setHealthConcerns([]);
  }, []);

  // Handle selecting a history entry
  const handleHistorySelect = useCallback((entry) => {
    if (typeof entry.fullResponse === 'object' && entry.fullResponse !== null) {
      setAiResponse(entry.fullResponse);
    } else if (typeof entry.result === 'object' && entry.result !== null) {
      setAiResponse(entry.result);
    } else {
      setAiResponse({
        summary: entry.fullResponse || entry.result || '',
        findings: [],
        questions: [],
        disclaimer: 'This is a historical record. Please re-analyze for a fresh report.',
      });
    }
    setFileName(entry.fileName);
    setLanguage(entry.language || 'English');
    setAppState('success');
    setExtractedText(null);
    setPatientHistoryOpen(false);
  }, []);

  // Handle clear all history
  const handleClearHistory = useCallback(() => {
    clearHistory();
  }, []);

  // Handle profile save
  const handleProfileSave = useCallback((profile) => {
    setProfileData(profile);
  }, []);

  // Handle download to PNG
  const handleDownloadPNG = useCallback(async () => {
    try {
      const element = exportCardRef.current;
      if (!element) return;

      // Use html2canvas if available, otherwise fall back to window.print
      if (typeof window.html2canvas === 'function') {
        const canvas = await window.html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `MediClear-${fileName || 'report'}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = pngUrl;
        link.click();
      } else {
        // Fallback: open print dialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head><title>MediClear Export</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; }
              .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; }
              .brand { color: #2563eb; font-weight: 700; font-size: 18px; }
              .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
              .text { color: #374151; font-size: 14px; line-height: 1.6; }
              .meta { color: #9ca3af; font-size: 12px; }
            </style>
            </head>
            <body>
              <div class="card">${element.innerHTML}</div>
              <script>window.onload = () => { window.print(); window.close(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (err) {
      console.error('PNG export failed:', err);
    }
  }, [fileName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Profile Settings Modal */}
      <ProfileSettings
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSave={handleProfileSave}
        profileData={profileData}
      />

      {/* Patient History Panel */}
      <PatientHistory
        isOpen={patientHistoryOpen}
        onClose={() => setPatientHistoryOpen(false)}
        onSelectEntry={handleHistorySelect}
      />

      {/* Camera Scanner Full Screen */}
      {cameraOpen && (
        <CameraScanner
          onTextExtracted={(text, name) => {
            setCameraOpen(false);
            handleTextExtracted(text, name);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="transition-all duration-200">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 tracking-tight">{t(language, 'appName')}</h1>
                <p className="text-xs text-gray-400 -mt-0.5">{t(language, 'appSubtitle')}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Camera Button */}
              <button
                onClick={() => setCameraOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 text-xs font-medium shadow-sm"
                title="Scan documents with camera"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">{t(language, 'scan')}</span>
              </button>

              {/* Profile Button */}
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                title="Patient Profile"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">{t(language, 'profile')}</span>
              </button>

              {/* History Button */}
              <button
                onClick={() => setPatientHistoryOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                title="View History"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">{t(language, 'history')}</span>
              </button>

              {/* Language Toggle */}
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.52 18.52 0 0112 13a18.52 18.52 0 01-3.048.5" />
                </svg>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-xs text-gray-600 font-medium outline-none cursor-pointer"
                  disabled={appState === 'extracting' || appState === 'analyzing'}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Mobile Language Selector */}
          <div className="sm:hidden mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t(language, 'responseLanguage')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              disabled={appState === 'extracting' || appState === 'analyzing'}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* State: Idle - Show Upload Zone */}
          {appState === 'idle' && (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="text-center max-w-lg mx-auto">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {t(language, 'poweredByAgnes')}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {t(language, 'uploadTitle')}
                </h2>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  {t(language, 'uploadSubtitle')}
                </p>
              </div>

              {/* Health Concerns Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <h3 className="text-sm font-semibold text-indigo-700">{t(language, 'healthConcerns')}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4">{t(language, 'healthConcernsSubtitle')}</p>
                  <PrepareForClinic
                    healthConcerns={healthConcerns}
                    setHealthConcerns={setHealthConcerns}
                    language={language}
                    aiResponse={aiResponse}
                  />
                </div>
              </div>

              {/* Upload Zone */}
              <UploadZone onTextExtracted={handleTextExtracted} />
            </div>
          )}

          {/* State: Extracting / Analyzing - Show Loading */}
          {(appState === 'extracting' || appState === 'analyzing') && (
            <div className="space-y-6">
              {fileName && (
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
                    <p className="text-xs text-gray-400">
                      {appState === 'extracting' ? t(language, 'extractingText') + '...' : t(language, 'processingData')}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    title="Cancel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Loading Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  {appState === 'extracting' ? (
                    <>
                      <div className="relative w-16 h-16 mb-5">
                        <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <p className="text-base font-semibold text-gray-700 mb-1">Extracting Text</p>
                      <p className="text-sm text-gray-400 max-w-xs">Reading your medical report...</p>
                    </>
                  ) : (
                    <>
                      <div className="relative w-16 h-16 mb-5">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-ping opacity-20"></div>
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-base font-semibold text-gray-700 mb-1">Analyzing Report</p>
                      <p className="text-sm text-gray-400 max-w-xs">Agnes AI is processing your medical data...</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* State: Success - Show Results */}
          {appState === 'success' && aiResponse && (
            <div className="space-y-6">
              <ResultsDisplay
                aiResponse={aiResponse}
                fileName={fileName}
                language={language}
                onReset={handleReset}
                onCopy={() => {}}
                onDownloadPNG={handleDownloadPNG}
                exportCardRef={exportCardRef}
              />

              {/* Questions for Your Doctor - Displayed separately */}
              {aiResponse.questions && aiResponse.questions.length > 0 && (
                <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3 border-b border-indigo-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <h3 className="text-sm font-semibold text-indigo-700">{t(language, 'questionsForDoctor')}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <ol className="space-y-3">
                      {aiResponse.questions.map((question, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-sm text-gray-700 leading-relaxed">{question}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
              
              {/* Video Explanations */}
              <VideoExplanation 
                findings={aiResponse.findings || []} 
                language={language}
              />
              
              {/* Health Roadmap - Lifestyle, Timeline, Actions */}
              <RoadmapView 
                aiResponse={aiResponse} 
                profile={profileData}
                language={language}
              />
            </div>
          )}

          {/* State: Error - Show Error State */}
          {appState === 'error' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                <div className="bg-red-50 px-5 py-3 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                      Analysis Failed
                    </h3>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-red-700 mb-1">Unable to Complete Analysis</p>
                    <p className="text-sm text-red-600 max-w-md mb-6 leading-relaxed">
                      {errorMessage || 'An unexpected error occurred while analyzing your report.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleReset}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        Try Again
                      </button>
                      {extractedText && (
                        <button
                          onClick={() => {
                            setExtractedText(null);
                            setAiResponse(null);
                            setErrorMessage(null);
                            setAppState('analyzing');
                            sendToAgnes(extractedText, language, { healthConcerns })
                              .then((response) => {
                                setAiResponse(response);
                                setAppState('success');
                                saveToHistory({
                                  id: generateId(),
                                  fileName,
                                  date: new Date().toISOString(),
                                  resultPreview: response.summary?.substring(0, 150) || 'Analysis complete',
                                  fullResponse: response,
                                  language,
                                });
                              })
                              .catch((err) => {
                                setAppState('error');
                                setErrorMessage(err.message || 'API error occurred.');
                              });
                          }}
                          className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Retry Analysis
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="border-t border-gray-200/60 pt-6 text-center">
            <p className="text-xs text-gray-400">
              {t(language, 'footerText')}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;