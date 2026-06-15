import { useState, useEffect } from 'react';
import { createVideoTask, pollForVideoCompletion } from '../utils/videoApi';
import { t } from '../utils/translations';

function VideoExplanation({ findings, language = 'English' }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState(null);

  const hasFindings = findings && findings.length > 0;

  const generateComprehensivePrompt = () => {
    if (!findings || findings.length === 0) return '';

    const conditions = findings.map(f => {
      const name = f.item || 'Unknown condition';
      const status = f.status || 'unknown';
      const explanation = f.explanation || '';
      return `- ${name} (${status}): ${explanation}`;
    }).join('. ');

    return `Create a clear, professional medical education video for patients.

Topic: Explain these health conditions and what the patient needs to know: ${conditions}.

Please cover in order:
1. What each condition means in simple, everyday language
2. What causes each condition
3. What lifestyle changes and diet recommendations are important
4. When to see a doctor immediately
5. Important warning signs to watch for

Style requirements:
- Use clean, professional medical illustrations and diagrams
- Include clear text overlays with key information
- Use a calm, reassuring visual style
- Do NOT use disturbing or abstract art
- Keep visuals relevant and connected to the medical content
- Use simple icons and diagrams to explain medical concepts
- Include a summary at the end

Video should be informative, easy to understand, and visually clean and professional.`;
  };

  const handleGenerateVideo = async () => {
    if (!hasFindings || generating) return;

    setGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setVideoUrl(null);
    setVideoId(null);

    try {
      const prompt = generateComprehensivePrompt();

      if (!prompt) {
        throw new Error('No findings available for video generation.');
      }

      const response = await createVideoTask({
        prompt,
        language,
        finding: findings.map(f => f.item).join(', ')
      });

      const apiVideoId = response.video_id || response.id || response.task_id;

      if (!apiVideoId) {
        throw new Error('No video ID received from API.');
      }

      setVideoId(apiVideoId);
      setGenerationProgress(10);

      const result = await pollForVideoCompletion(apiVideoId, 90, 3000);

      setGenerationProgress(90);

      const url = result.remixed_from_video_id || result.video_url || result.url;

      if (url) {
        setVideoUrl(url);
        setGenerationProgress(100);
      } else {
        throw new Error('Video generation completed but no URL was returned.');
      }
    } catch (err) {
      console.error('Video generation failed:', err);
      setError(err.message || 'Failed to generate video. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    setVideoUrl(null);
    setVideoId(null);
    setGenerationProgress(0);
    setError(null);
  }, [findings]);

  if (!hasFindings) {
    return null;
  }

  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const borderlineCount = findings.filter(f => f.severity === 'BORDERLINE').length;
  const normalCount = findings.filter(f => f.severity === 'NORMAL').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{t(language, 'videoExplanation')}</h3>
            <p className="text-sm text-white/80">{t(language, 'aiGeneratedSummary')} in {language}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Conditions Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{t(language, 'yourConditions')}</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {highCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {highCount} {t(language, 'highPriority')}
              </span>
            )}
            {borderlineCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {borderlineCount} {t(language, 'borderline')}
              </span>
            )}
            {normalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {normalCount} {t(language, 'normal')}
              </span>
            )}
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{findings.length} {t(language, 'conditionsDetected')}</span>{' '}
              {findings.map(f => f.item).join(', ')}
            </p>
          </div>
        </div>

        {/* Video Player or Generate Button */}
        {videoUrl ? (
          /* Video is ready */
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-black">
            <div style={{ paddingTop: '56.25%', position: 'relative' }}>
              <video
                controls
                autoPlay
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={videoUrl}
              >
                Your browser does not support video playback.
              </video>
            </div>
            <div className="p-4 bg-gray-900 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t(language, 'yourHealthExplanation')}</h4>
                  <p className="text-sm text-gray-400">{t(language, 'aiGeneratedSummary')} in {language}</p>
                </div>
                <button
                  onClick={handleGenerateVideo}
                  className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t(language, 'regenerate')}
                </button>
              </div>
            </div>
          </div>
        ) : error ? (
          /* Error state */
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium mb-2">{t(language, 'videoGenerationFailed')}</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={handleGenerateVideo}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : generating ? (
          /* Generating - show animated progress */
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div style={{ paddingTop: '56.25%', position: 'relative', background: 'linear-gradient(to bottom right, #f5f3ff, #eef2ff, #faf5ff)' }}>
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{t(language, 'generatingVideo')}</h4>
                <p className="text-sm text-gray-600 mb-4 max-w-sm">
                  {t(language, 'aiGeneratedSummary')} covering all {findings.length} {t(language, 'conditionsDetected').replace('condition(s) detected:', '').trim()} in {language}
                </p>
                <div className="w-full max-w-xs bg-white/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {generationProgress < 30 ? t(language, 'analyzingConditions') :
                   generationProgress < 60 ? t(language, 'creatingVisuals') :
                   generationProgress < 90 ? t(language, 'renderingVideo') : t(language, 'almostDone')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Ready to generate - show preview */
          <div className="rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
            <div style={{ paddingTop: '56.25%', position: 'relative', background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{t(language, 'videoExplanation')}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  {t(language, 'getPersonalizedVideo')}
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  {t(language, 'conditionsDetected')} {language}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm w-full">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t(language, 'conditionExplanations')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t(language, 'lifestyleTips')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t(language, 'dietRecommendations')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t(language, 'whenToSeeDoctor')}
                  </div>
                </div>
                <button
                  onClick={handleGenerateVideo}
                  className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t(language, 'generateVideo')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoExplanation;