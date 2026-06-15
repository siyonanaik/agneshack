import { useState, useEffect } from 'react';
import { generateRoadmapData, getStatusColor } from '../utils/roadmapGenerator';

// SVG Node component for the mindmap
function MindmapNode({ node, x, y, onToggle, isExpanded }) {
  const isRoot = node.type === 'root';
  const isStatus = node.type === 'status';
  const isAction = node.type === 'action';
  const isTimeline = node.type === 'timeline';
  const isLifestyle = node.type === 'lifestyle';
  const isFinding = node.type === 'finding';
  const isMilestone = node.type === 'milestone';
  const isTask = node.type === 'task';
  const isActionItem = node.type === 'action-item';
  const isQuestion = node.type === 'question';
  const isLifestyleArea = node.type === 'lifestyle-area';
  const isGeneral = node.type === 'general';

  let bgColor = 'bg-white';
  let borderColor = 'border-gray-300';
  let textColor = 'text-gray-800';
  let radius = 'rounded-xl';
  let padding = 'px-4 py-3';
  let shadow = 'shadow-md';

  if (isRoot) {
    bgColor = 'bg-gradient-to-br from-blue-500 to-indigo-600';
    borderColor = 'border-blue-600';
    textColor = 'text-white';
    radius = 'rounded-2xl';
    padding = 'px-6 py-4';
    shadow = 'shadow-lg';
  } else if (isStatus) {
    bgColor = 'bg-white';
    borderColor = 'border-purple-400';
    textColor = 'text-gray-800';
    radius = 'rounded-xl';
  } else if (isAction) {
    bgColor = 'bg-white';
    borderColor = 'border-emerald-400';
    textColor = 'text-gray-800';
    radius = 'rounded-xl';
  } else if (isTimeline) {
    bgColor = 'bg-white';
    borderColor = 'border-amber-400';
    textColor = 'text-gray-800';
    radius = 'rounded-xl';
  } else if (isLifestyle) {
    bgColor = 'bg-white';
    borderColor = 'border-green-400';
    textColor = 'text-gray-800';
    radius = 'rounded-xl';
  } else if (isFinding) {
    const color = getStatusColor(node.status);
    bgColor = node.status === 'NORMAL' ? 'bg-emerald-50' : 
               node.status === 'BORDERLINE' ? 'bg-amber-50' : 
               node.status === 'HIGH' ? 'bg-red-50' : 'bg-blue-50';
    borderColor = `border-${node.status === 'NORMAL' ? 'emerald' : node.status === 'BORDERLINE' ? 'amber' : node.status === 'HIGH' ? 'red' : 'blue'}-300`;
    textColor = 'text-gray-800';
  } else if (isMilestone) {
    const colorMap = { red: 'bg-red-50 border-red-300', amber: 'bg-amber-50 border-amber-300', blue: 'bg-blue-50 border-blue-300', green: 'bg-green-50 border-green-300' };
    bgColor = colorMap[node.color] || 'bg-gray-50 border-gray-300';
    borderColor = node.color === 'red' ? 'border-red-300' : node.color === 'amber' ? 'border-amber-300' : node.color === 'blue' ? 'border-blue-300' : 'border-green-300';
  } else if (isLifestyleArea) {
    bgColor = 'bg-green-50';
    borderColor = 'border-green-300';
  } else if (isTask || isGeneral) {
    bgColor = 'bg-gray-50';
    borderColor = 'border-gray-200';
    padding = 'px-3 py-2';
  } else if (isActionItem) {
    const priorityColor = node.priority === 'high' ? 'bg-red-50 border-red-300' : 
                          node.priority === 'medium' ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200';
    bgColor = priorityColor;
    borderColor = node.priority === 'high' ? 'border-red-300' : node.priority === 'medium' ? 'border-amber-300' : 'border-gray-200';
  }

  const hasChildren = node.children && node.children.length > 0;

  return (
    <g className="cursor-pointer" onClick={() => hasChildren && onToggle(node.id)}>
      {/* Node rectangle */}
      <rect
        x={x - 80}
        y={y - 20}
        width={160}
        height={isFinding ? 50 : isTask || isGeneral ? 36 : 40}
        rx={isRoot ? 16 : 12}
        className={`${bgColor} ${shadow} transition-all duration-200`}
        style={{ stroke: isRoot ? 'rgba(255,255,255,0.3)' : undefined, strokeWidth: isRoot ? 0 : 1.5 }}
      />
      
      {/* Node text */}
      <text
        x={x}
        y={y - 3}
        textAnchor="middle"
        className={`${textColor} ${isRoot ? 'font-bold' : 'font-semibold'}`}
        fontSize={isRoot ? 13 : isTask || isGeneral ? 10 : 11}
        fill={isRoot ? 'white' : undefined}
      >
        {node.label.length > (isRoot ? 18 : isTask || isGeneral ? 22 : 28) 
          ? node.label.substring(0, isRoot ? 18 : isTask || isGeneral ? 22 : 28) + '...' 
          : node.label}
      </text>

      {/* Sublabel for findings */}
      {isFinding && node.sublabel && (
        <text
          x={x}
          y={y + 12}
          textAnchor="middle"
          fontSize={9}
          fill={node.status === 'HIGH' ? '#dc2626' : node.status === 'BORDERLINE' ? '#d97706' : '#059669'}
          className="font-medium"
        >
          {node.sublabel.length > 30 ? node.sublabel.substring(0, 30) + '...' : node.sublabel}
        </text>
      )}

      {/* Status indicator dot for findings */}
      {isFinding && (
        <circle
          cx={x + 65}
          cy={y - 12}
          r={4}
          fill={getStatusColor(node.status)}
        />
      )}

      {/* Priority indicator for action items */}
      {isActionItem && node.priority === 'high' && (
        <circle
          cx={x + 65}
          cy={y - 12}
          r={4}
          fill="#ef4444"
        />
      )}

      {/* Expand/collapse indicator */}
      {hasChildren && (
        <>
          <circle
            cx={x + 80}
            cy={y - 20}
            r={8}
            fill={isRoot ? 'rgba(255,255,255,0.2)' : '#f3f4f6'}
            stroke={isRoot ? 'rgba(255,255,255,0.4)' : '#d1d5db'}
            strokeWidth={1}
          />
          <text
            x={x + 80}
            y={y - 16}
            textAnchor="middle"
            fontSize={10}
            fill={isRoot ? 'white' : '#6b7280'}
            fontWeight="bold"
          >
            {isExpanded ? '−' : '+'}
          </text>
        </>
      )}
    </g>
  );
}

// Draw connection line between nodes
function ConnectionLine({ x1, y1, x2, y2 }) {
  const midY = (y1 + y2) / 2;
  return (
    <path
      d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
      fill="none"
      stroke="#d1d5db"
      strokeWidth={1.5}
      strokeDasharray="4,4"
    />
  );
}

function RoadmapView({ aiResponse, profile }) {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [viewMode, setViewMode] = useState('mindmap'); // 'mindmap' or 'timeline'
  const [roadmapData, setRoadmapData] = useState(null);

  // Generate roadmap data when props change
  useEffect(() => {
    const data = generateRoadmapData(aiResponse, profile);
    if (data) setRoadmapData(data);
  }, [aiResponse, profile]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const isNodeExpanded = (nodeId) => expandedNodes[nodeId] !== false;

  if (!roadmapData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <p className="text-gray-400 text-sm">Upload a medical report to see your health roadmap</p>
      </div>
    );
  }

  // Render mindmap view
  const renderMindmap = () => {
    const { nodes } = roadmapData;
    const rootNode = nodes;
    const statusExpanded = isNodeExpanded('status');
    const actionsExpanded = isNodeExpanded('actions');
    const timelineExpanded = isNodeExpanded('timeline');
    const lifestyleExpanded = isNodeExpanded('lifestyle');

    return (
      <div className="overflow-x-auto">
        <svg width={900} height={700} className="mx-auto">
          {/* Root node */}
          <MindmapNode node={rootNode} x={450} y={50} onToggle={toggleNode} isExpanded={true} />

          {/* Status branch */}
          <ConnectionLine x1={450} y1={90} x2={200} y2={180} />
          <MindmapNode 
            node={rootNode.children[0]} 
            x={200} 
            y={180} 
            onToggle={toggleNode} 
            isExpanded={statusExpanded} 
          />
          
          {statusExpanded && rootNode.children[0]?.children?.map((child, idx) => (
            <g key={child.id}>
              <ConnectionLine x1={200} y1={220} x2={100 + idx * 100} y2={300} />
              <MindmapNode node={child} x={100 + idx * 100} y={300} onToggle={toggleNode} isExpanded={isNodeExpanded(child.id)} />
            </g>
          ))}

          {/* Actions branch */}
          <ConnectionLine x1={450} y1={90} x2={700} y2={180} />
          <MindmapNode 
            node={rootNode.children[1]} 
            x={700} 
            y={180} 
            onToggle={toggleNode} 
            isExpanded={actionsExpanded} 
          />
          
          {actionsExpanded && rootNode.children[1]?.children?.slice(0, 6).map((child, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            return (
              <g key={child.id}>
                <ConnectionLine x1={700} y1={220} x2={580 + col * 120} y2={300 + row * 50} />
                <MindmapNode node={child} x={580 + col * 120} y={300 + row * 50} onToggle={toggleNode} isExpanded={isNodeExpanded(child.id)} />
              </g>
            );
          })}

          {/* Timeline branch */}
          <ConnectionLine x1={450} y1={90} x2={200} y2={420} />
          <MindmapNode 
            node={rootNode.children[2]} 
            x={200} 
            y={420} 
            onToggle={toggleNode} 
            isExpanded={timelineExpanded} 
          />
          
          {timelineExpanded && rootNode.children[2]?.children?.map((child, idx) => (
            <g key={child.id}>
              <ConnectionLine x1={200} y1={460} x2={100 + idx * 100} y2={540} />
              <MindmapNode node={child} x={100 + idx * 100} y={540} onToggle={toggleNode} isExpanded={isNodeExpanded(child.id)} />
              {isNodeExpanded(child.id) && child.children?.map((task, tIdx) => (
                <g key={task.id}>
                  <ConnectionLine x1={100 + idx * 100} y1={576} x2={80 + idx * 120} y2={620} />
                  <MindmapNode node={task} x={80 + idx * 120} y={620} onToggle={toggleNode} isExpanded={isNodeExpanded(task.id)} />
                </g>
              ))}
            </g>
          ))}

          {/* Lifestyle branch */}
          <ConnectionLine x1={450} y1={90} x2={700} y2={420} />
          <MindmapNode 
            node={rootNode.children[3]} 
            x={700} 
            y={420} 
            onToggle={toggleNode} 
            isExpanded={lifestyleExpanded} 
          />
          
          {lifestyleExpanded && rootNode.children[3]?.children?.map((child, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            return (
              <g key={child.id}>
                <ConnectionLine x1={700} y1={460} x2={580 + col * 120} y2={540 + row * 50} />
                <MindmapNode node={child} x={580 + col * 120} y={540 + row * 50} onToggle={toggleNode} isExpanded={isNodeExpanded(child.id)} />
                {isNodeExpanded(child.id) && child.children?.slice(0, 3).map((task, tIdx) => (
                  <g key={task.id}>
                    <ConnectionLine x1={580 + col * 120} y1={580 + row * 50} x2={560 + col * 120 + tIdx * 40} y2={640 + row * 50} />
                    <MindmapNode node={task} x={560 + col * 120 + tIdx * 40} y={640 + row * 50} onToggle={toggleNode} isExpanded={isNodeExpanded(task.id)} />
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render timeline view
  const renderTimeline = () => {
    const timelineNode = roadmapData.nodes.children[2];
    if (!timelineNode) return null;

    return (
      <div className="space-y-6">
        {timelineNode.children.map((milestone) => (
          <div key={milestone.id} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 ${
                milestone.color === 'red' ? 'bg-red-500 border-red-500' :
                milestone.color === 'amber' ? 'bg-amber-500 border-amber-500' :
                milestone.color === 'blue' ? 'bg-blue-500 border-blue-500' :
                'bg-green-500 border-green-500'
              }`} />
              <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-6">
              <h4 className="text-sm font-semibold text-gray-800">{milestone.label}</h4>
              <div className="mt-2 space-y-2">
                {milestone.children.map((task) => (
                  <div key={task.id} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    );
  };

  // Render lifestyle view
  const renderLifestyle = () => {
    const lifestyleNode = roadmapData.nodes.children[3];
    if (!lifestyleNode) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lifestyleNode.children.map((area) => (
          <div key={area.id} className="bg-green-50 rounded-xl border border-green-200 p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-3">{area.label}</h4>
            <div className="space-y-2">
              {area.children.map((task) => (
                <div key={task.id} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-green-700">{task.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-5 py-3 border-b border-teal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Health Roadmap</h3>
              <p className="text-xs text-gray-400">Your personalized health improvement plan</p>
            </div>
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setViewMode('mindmap')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'mindmap' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Mind Map
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'timeline' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('lifestyle')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'lifestyle' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Lifestyle
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'mindmap' && renderMindmap()}
        {viewMode === 'timeline' && renderTimeline()}
        {viewMode === 'lifestyle' && renderLifestyle()}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-4 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Legend:</span>
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