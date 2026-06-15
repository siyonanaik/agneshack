import { useState, useRef } from 'react';
import { t } from '../utils/translations';

// Status badge color mapping
const statusConfig = {
  NORMAL: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  BORDERLINE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z' },
  HIGH: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  LOW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.NORMAL;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
      </svg>
      {status}
    </span>
  );
}

function FindingsCard({ findings, language = 'English' }) {
  if (!findings || findings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {t(language, 'keyFindings')}
        </h3>
        <p className="text-sm text-gray-400 italic">No findings available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        {t(language, 'keyFindings')}
      </h3>
      <div className="space-y-3">
        {findings.map((finding, index) => {
          const config = statusConfig[finding.status] || statusConfig.NORMAL;
          return (
            <div key={index} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h4 className="text-sm font-semibold text-gray-800">{finding.item}</h4>
                <StatusBadge status={finding.status} />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{finding.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionsCard({ questions, language = 'English' }) {
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t(language, 'questionsForDoctor')}
        </h3>
        <p className="text-sm text-gray-400 italic">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t(language, 'questionsForDoctor')}
      </h3>
      <ol className="space-y-2.5">
        {questions.map((question, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center mt-0.5">
              {index + 1}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">{question}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// MediClear branded export card
function ExportCard({ aiResponse, fileName, language, analysisDate, exportCardRef }) {
  const summary = aiResponse.summary || '';
  const findings = aiResponse.findings || [];
  const questions = aiResponse.questions || [];
  const disclaimer = aiResponse.disclaimer || '';

  return (
    <div
      ref={exportCardRef}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">MediClear</h3>
            <p className="text-xs text-blue-100">AI Medical Report Analysis</p>
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            File: <span className="font-medium text-gray-700">{fileName || 'Unknown'}</span>
          </span>
          <span className="text-gray-500">
            Date: <span className="font-medium text-gray-700">{analysisDate}</span>
          </span>
          <span className="text-gray-500">
            Language: <span className="font-medium text-gray-700">{language}</span>
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Summary</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
      </div>

      {/* Findings */}
      {findings.length > 0 && (
        <div className="px-5 py-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Key Findings</h4>
          <div className="space-y-2">
            {findings.map((finding, index) => (
              <div key={index} className="flex items-start gap-2">
                <StatusBadge status={finding.status} />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-700">{finding.item}</span>
                  <span className="text-xs text-gray-400 mx-2">—</span>
                  <span className="text-xs text-gray-600">{finding.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="px-5 py-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Questions for Your Doctor</h4>
          <ul className="space-y-1.5">
            {questions.map((q, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <div className="px-5 py-3 bg-amber-50/50">
          <p className="text-xs text-gray-500 leading-relaxed">{disclaimer}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">Generated by MediClear</span>
        <span className="text-xs text-gray-400">Powered by Agnes AI</span>
      </div>
    </div>
  );
}

function ResultsDisplay({ aiResponse, fileName, language, onReset, onCopy, onDownloadPNG, exportCardRef }) {
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);

  if (!aiResponse) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">Your AI-powered medical report analysis will appear here</p>
        </div>
      </div>
    );
  }

  const summary = aiResponse.summary || '';
  const findings = aiResponse.findings || [];
  const questions = aiResponse.questions || [];
  const disclaimer = aiResponse.disclaimer || 'This analysis is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice. Always consult your healthcare provider.';

  const analysisDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCopy = async () => {
    try {
      let copyText = `MediClear Medical Report Analysis\nFile: ${fileName || 'Unknown'}\nDate: ${analysisDate}\nLanguage: ${language || 'English'}\n\n`;
      copyText += `SUMMARY\n${summary}\n\n`;
      copyText += `KEY FINDINGS\n`;
      findings.forEach((f, i) => {
        copyText += `${i + 1}. ${f.item} (${f.status})\n   ${f.explanation}\n`;
      });
      copyText += `\nQUESTIONS FOR YOUR DOCTOR\n`;
      questions.forEach((q, i) => {
        copyText += `${i + 1}. ${q}\n`;
      });
      copyText += `\nDISCLAIMER\n${disclaimer}\n`;

      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = `Medical Report Analysis - ${fileName || 'Unknown'}\n\n${summary}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {fileName || 'Medical Report'}
            </p>
            <p className="text-xs text-gray-400">Analysis complete • {language}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowExport(!showExport)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              copied
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Scan
          </button>
        </div>
      </div>

      {/* Export Card (shown when export is toggled) */}
      {showExport && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Export Summary</h3>
            <button
              onClick={onDownloadPNG}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PNG
            </button>
          </div>
          <ExportCard
            aiResponse={aiResponse}
            fileName={fileName}
            language={language}
            analysisDate={analysisDate}
            exportCardRef={exportCardRef}
          />
        </div>
      )}

      {/* Quick Results Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Agnes AI Analysis
            </h3>
          </div>
        </div>
        <div className="p-5">
          {/* Summary */}
          {summary && (
            <div className="mb-5 pb-5 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Summary</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Findings */}
          <FindingsCard findings={findings} language={language} />

          {/* Questions */}
          <div className="mt-4">
            <QuestionsCard questions={questions} language={language} />
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-2 py-2">
        <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-gray-400 leading-relaxed">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}

export default ResultsDisplay;