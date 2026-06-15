import { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../utils/storage';

function formatDate(dateStr) {
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
}

function HistoryPanel({ isOpen, onToggle, onClearAll, onSelectEntry }) {
  const [history, setHistory] = useState(() => getHistory());

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
    if (onClearAll) onClearAll();
  };

  const handleDeleteOne = (id, e) => {
    e.stopPropagation();
    // Re-read history to remove the entry
    const updated = getHistory().filter((entry) => entry.id !== id);
    try {
      localStorage.setItem('mediclear_history', JSON.stringify(updated));
      setHistory(updated);
    } catch {
      // Silently fail
    }
  };

  const handleSelect = (entry) => {
    if (onSelectEntry) {
      onSelectEntry(entry);
    }
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full z-40">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`h-12 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-r-lg transition-all duration-200 ${
          isOpen ? 'ml-80' : 'ml-0'
        }`}
      >
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`h-full w-80 bg-white border-r border-gray-200 shadow-lg transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Scan History
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-16 px-4">
                <svg
                  className="w-12 h-12 mx-auto text-gray-200 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-400 text-sm font-medium">No scans yet</p>
                <p className="text-gray-300 text-xs mt-1">Your analysis history will appear here</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleSelect(entry)}
                    className="group w-full text-left bg-gray-50 hover:bg-blue-50 rounded-lg p-3 transition-colors cursor-pointer border border-transparent hover:border-blue-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">
                          {entry.fileName || 'Unnamed report'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {entry.date ? formatDate(entry.date) : 'Unknown date'}
                        </p>
                        {entry.resultPreview && (
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {entry.resultPreview}
                          </p>
                        )}
                        {entry.language && entry.language !== 'English' && (
                          <span className="inline-block mt-1.5 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                            {entry.language}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteOne(entry.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0 p-0.5"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {history.length > 0 && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={handleClearAll}
                className="w-full py-2 px-3 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;