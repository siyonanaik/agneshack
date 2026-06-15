import { useState, useEffect } from 'react';
import { generateRoadmapData, getStatusColor } from '../utils/roadmapGenerator';
import { t } from '../utils/translations';

function RoadmapView({ aiResponse, profile, language = 'English' }) {
  const [roadmapData, setRoadmapData] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    const data = generateRoadmapData(aiResponse, profile, language);
    if (data) setRoadmapData(data);
  }, [aiResponse, profile, language]);

  if (!roadmapData) {
    return null;
  }

  const { nodes } = roadmapData;
  const statusNode = nodes.children?.[0];
  const timelineNode = nodes.children?.[2];
  const lifestyleNode = nodes.children?.[3];

  // Tab configurations with icons and colors
  const tabs = [
    {
      id: 'timeline',
      label: t(language, 'followUpTimeline'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      activeGradient: 'from-amber-500 to-orange-500',
      activeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      inactiveBg: 'bg-white',
      borderColor: 'border-amber-500',
      headerBg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      headerBorder: 'border-amber-100',
      headerText: 'text-amber-700',
      cardBg: 'bg-amber-50/50',
    },
    {
      id: 'lifestyle',
      label: t(language, 'lifestyleRecommendations'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      activeGradient: 'from-emerald-500 to-green-500',
      activeBg: 'bg-gradient-to-r from-emerald-500 to-green-500',
      inactiveBg: 'bg-white',
      borderColor: 'border-emerald-500',
      headerBg: 'bg-gradient-to-r from-emerald-50 to-green-50',
      headerBorder: 'border-emerald-100',
      headerText: 'text-emerald-700',
      cardBg: 'bg-emerald-50/50',
    },
  ];

  // Render Timeline content
  const renderTimeline = () => {
    if (!timelineNode?.children || timelineNode.children.length === 0) return null;

    return (
      <div className="space-y-4">
        {timelineNode.children.map((milestone, idx) => (
          <div key={milestone.id} className="relative pl-8 pb-6 last:pb-0">
            {/* Vertical line */}
            {idx < timelineNode.children.length - 1 && (
              <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 to-orange-200" />
            )}
            
            {/* Dot */}
            <div className={`absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 ${
              milestone.color === 'red' ? 'bg-red-500 border-red-500 shadow-red-200 shadow-lg' :
              milestone.color === 'amber' ? 'bg-amber-500 border-amber-500 shadow-amber-200 shadow-lg' :
              milestone.color === 'blue' ? 'bg-blue-500 border-blue-500 shadow-blue-200 shadow-lg' :
              'bg-emerald-500 border-emerald-500 shadow-emerald-200 shadow-lg'
            } shadow-md`} />

            {/* Milestone label */}
            <h5 className="text-sm font-bold text-gray-800 mb-2">{milestone.label}</h5>
            
            {/* Tasks */}
            <div className="space-y-2">
              {milestone.children.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2.5 bg-white rounded-xl px-4 py-3 border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm text-gray-700">{task.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render Lifestyle content
  const renderLifestyle = () => {
    if (!lifestyleNode?.children || lifestyleNode.children.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lifestyleNode.children.map((area) => (
          <div
            key={area.id}
            className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Card header */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h5 className="text-sm font-semibold text-emerald-800">{area.label}</h5>
              </div>
            </div>
            
            {/* Card body */}
            <div className="p-4 space-y-2.5">
              {area.children.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{task.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 px-6 py-5 border-b border-teal-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{t(language, 'healthRoadmap')}</h3>
              <p className="text-sm text-gray-500">{t(language, 'personalizedHealthPlan')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 p-1.5 bg-gray-100/80 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? `${tab.activeBg} text-white shadow-lg ${tab.activeGradient.replace('from-', 'shadow-').replace(' ', '').replace('500', '200')}`
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
            }`}
          >
            <span className={`${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab Header Bar */}
        <div className={`${tabs.find(t => t.id === activeTab)?.headerBg} px-6 py-3 border-b ${tabs.find(t => t.id === activeTab)?.headerBorder}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${tabs.find(t => t.id === activeTab)?.activeBg}`} />
            <h4 className={`text-sm font-semibold ${tabs.find(t => t.id === activeTab)?.headerText}`}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h4>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'timeline' ? renderTimeline() : renderLifestyle()}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-4 flex-wrap mt-4">
        <span className="text-xs text-gray-500 font-medium">{t(language, 'priorityLegend')}</span>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full bg-emerald-500" /> {t(language, 'normal')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500" /> {t(language, 'borderline')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500" /> {t(language, 'highPriority')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500" /> {t(language, 'low')}
        </span>
      </div>
    </div>
  );
}

export default RoadmapView;