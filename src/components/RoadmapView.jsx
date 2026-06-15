import { useState, useEffect } from 'react';
import { generateRoadmapData, getStatusColor } from '../utils/roadmapGenerator';

function RoadmapView({ aiResponse, profile, language = 'English' }) {
  const [roadmapData, setRoadmapData] = useState(null);

  useEffect(() => {
    const data = generateRoadmapData(aiResponse, profile, language);
    if (data) setRoadmapData(data);
  }, [aiResponse, profile, language]);

  if (!roadmapData) {
    return null;
  }

  const { nodes } = roadmapData;
  const statusNode = nodes.children?.[0];
  const actionsNode = nodes.children?.[1];
  const timelineNode = nodes.children?.[2];
  const lifestyleNode = nodes.children?.[3];

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-teal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700">Health Roadmap</h3>
              <p className="text-sm text-gray-400">Your personalized health improvement plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Actions */}
      {actionsNode?.children && actionsNode.children.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-3 border-b border-red-100">
            <h4 className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Immediate Actions Required
            </h4>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {actionsNode.children.slice(0, 6).map((action) => (
                <div key={action.id} className="flex items-start gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm text-red-700 font-medium">{action.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {timelineNode?.children && timelineNode.children.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-3 border-b border-amber-100">
            <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Follow-Up Timeline
            </h4>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {timelineNode.children.map((milestone) => (
                <div key={milestone.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      milestone.color === 'red' ? 'bg-red-500 border-red-500' :
                      milestone.color === 'amber' ? 'bg-amber-500 border-amber-500' :
                      milestone.color === 'blue' ? 'bg-blue-500 border-blue-500' :
                      'bg-green-500 border-green-500'
                    }`} />
                    {milestone.id !== timelineNode.children[timelineNode.children.length - 1]?.id && (
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <h5 className="text-sm font-semibold text-gray-800">{milestone.label}</h5>
                    <div className="mt-2 space-y-1.5">
                      {milestone.children.map((task) => (
                        <div key={task.id} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="text-xs text-gray-600">{task.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lifestyle Recommendations */}
      {lifestyleNode?.children && lifestyleNode.children.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-b border-green-100">
            <h4 className="text-sm font-semibold text-green-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Lifestyle Recommendations
            </h4>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lifestyleNode.children.map((area) => (
                <div key={area.id} className="bg-green-50 rounded-xl border border-green-200 p-4">
                  <h5 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {area.label}
                  </h5>
                  <div className="space-y-2">
                    {area.children.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-start gap-2">
                        <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-xs text-green-700">{task.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-4 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Priority Legend:</span>
        <span className="inline-flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded-full bg-emerald-500" /> Normal
        </span>
        <span className="inline-flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500" /> Borderline
        </span>
        <span className="inline-flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500" /> High Priority
        </span>
        <span className="inline-flex items-center gap-1 text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500" /> Low / Info
        </span>
      </div>
    </div>
  );
}

export default RoadmapView;