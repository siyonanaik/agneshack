import { useState, useEffect } from 'react';
import { getHistory } from '../utils/storage';
import { getProfile } from '../utils/profile';

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

function getStatusColor(status) {
  switch (status) {
    case 'NORMAL': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'BORDERLINE': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
    case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'NORMAL':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'HIGH':
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
    default:
      return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }
}

function SeverityTrend({ findings }) {
  if (!findings || findings.length === 0) return null;
  const statuses = findings.map(f => f.status);
  const hasHigh = statuses.includes('HIGH');
  const hasNormal = statuses.includes('NORMAL');

  if (hasHigh) return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor('HIGH')}`}>High Priority</span>;
  if (hasNormal && !statuses.includes('BORDERLINE')) return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor('NORMAL')}`}>All Normal</span>;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor('BORDERLINE')}`}>Some Borderline</span>;
}

function HistoryTimelineEntry({ entry, onClick }) {
  const findings = entry.fullResponse?.findings || entry.result?.findings || [];
  const summary = entry.fullResponse?.summary || entry.result?.summary || entry.resultPreview || 'Analysis complete';
  const trend = <SeverityTrend findings={findings} />;

  return (
    <div
      onClick={() => onClick && onClick(entry)}
      className="group relative pl-8 pb-8 border-l-2 border-gray-200 last:pb-0 last:border-l-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
    >
      {/* Timeline dot */}
      <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
        findings.some(f => f.status === 'HIGH') ? 'bg-red-500' :
        findings.some(f => f.status === 'BORDERLINE') ? 'bg-amber-500' :
        'bg-emerald-500'
      }`} />

      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-gray-800 truncate">{entry.fileName || 'Unnamed report'}</h4>
              {trend}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.date)}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {entry.language && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-medium">
                {entry.language}
              </span>
            )}
            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{summary}</p>

        {findings.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {findings.slice(0, 3).map((finding, idx) => (
              <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getStatusColor(finding.status)}`}>
                {getStatusIcon(finding.status)}
                {finding.item}
              </span>
            ))}
            {findings.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 border border-gray-200">
                +{findings.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientHistory({ isOpen, onClose, onSelectEntry }) {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
      const p = getProfile();
      setProfile(p);
    }
  }, [isOpen]);

  const filteredHistory = history.filter(entry => {
    const matchesSearch = !searchQuery || 
      (entry.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.resultPreview || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const findings = entry.fullResponse?.findings || entry.result?.findings || [];
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'HIGH' && findings.some(f => f.status === 'HIGH')) ||
      (filterStatus === 'NORMAL' && findings.every(f => f.status === 'NORMAL') && findings.length > 0);
    
    return matchesSearch && matchesStatus;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Patient History</h2>
            {profile?.fullName && <p className="text-xs text-blue-100">{profile.fullName}'s records</p>}
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="ALL">All</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 text-sm font-medium">No records found</p>
              <p className="text-gray-300 text-xs mt-1">
                {searchQuery ? 'Try adjusting your search or filters' : 'Upload a medical report to get started'}
              </p>
            </div>
          ) : (
            <div className="relative">
              {filteredHistory.map((entry) => (
                <HistoryTimelineEntry
                  key={entry.id}
                  entry={entry}
                  onClick={onSelectEntry}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-gray-500">{filteredHistory.length} of {history.length} records</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
              <div className="w-2 h-2 rounded-full bg-amber-500" /> Borderline
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-red-600">
              <div className="w-2 h-2 rounded-full bg-red-500" /> High
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientHistory;