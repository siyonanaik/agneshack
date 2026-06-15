/**
 * Generate roadmap data from AI analysis findings
 * Creates structured data for visualization of health conditions and improvement plans
 */

export function generateRoadmapData(aiResponse, profile) {
  if (!aiResponse) return null;

  const findings = aiResponse.findings || [];
  const questions = aiResponse.questions || [];
  const summary = aiResponse.summary || '';
  const disclaimer = aiResponse.disclaimer || '';

  // Build the roadmap nodes
  const nodes = {
    id: 'root',
    label: 'Your Health Overview',
    type: 'root',
    children: []
  };

  // Add current status node
  const statusNode = {
    id: 'status',
    label: 'Current Health Status',
    type: 'status',
    children: []
  };

  // Add findings as branches
  findings.forEach(finding => {
    const statusColor = finding.status === 'NORMAL' ? 'green' : 
                       finding.status === 'BORDERLINE' ? 'amber' : 
                       finding.status === 'HIGH' ? 'red' : 'blue';
    
    statusNode.children.push({
      id: `finding-${finding.item}`,
      label: finding.item,
      sublabel: finding.explanation || '',
      status: finding.status,
      color: statusColor,
      type: 'finding'
    });
  });

  nodes.children.push(statusNode);

  // Add action items node
  const actionNode = {
    id: 'actions',
    label: 'Recommended Actions',
    type: 'action',
    children: []
  };

  // Generate actions from findings
  findings.forEach(finding => {
    if (finding.status !== 'NORMAL') {
      actionNode.children.push({
        id: `action-${finding.item}`,
        label: `Follow up on ${finding.item}`,
        priority: finding.status === 'HIGH' ? 'high' : 'medium',
        type: 'action-item'
      });
    }
  });

  // Add doctor questions as action items
  questions.forEach((q, idx) => {
    actionNode.children.push({
      id: `question-${idx}`,
      label: q,
      priority: 'medium',
      type: 'question'
    });
  });

  // Always add general health improvement actions
  actionNode.children.push({
    id: 'action-general',
    label: 'Maintain healthy diet and exercise regularly',
    priority: 'low',
    type: 'general'
  });

  actionNode.children.push({
    id: 'action-followup',
    label: 'Schedule regular check-ups with your doctor',
    priority: 'medium',
    type: 'general'
  });

  nodes.children.push(actionNode);

  // Add timeline node
  const timelineNode = {
    id: 'timeline',
    label: 'Health Improvement Timeline',
    type: 'timeline',
    children: [
      {
        id: 'timeline-immediate',
        label: 'This Week',
        type: 'milestone',
        color: 'red',
        children: [
          { id: 'tl-1', label: 'Review findings with doctor', type: 'task' },
          ...(questions.length > 0 ? [{ id: 'tl-2', label: `Prepare questions for doctor (${questions.length} questions)`, type: 'task' }] : [])
        ]
      },
      {
        id: 'timeline-short',
        label: '1-4 Weeks',
        type: 'milestone',
        color: 'amber',
        children: [
          { id: 'tl-3', label: 'Start recommended lifestyle changes', type: 'task' },
          { id: 'tl-4', label: 'Monitor symptoms and track progress', type: 'task' }
        ]
      },
      {
        id: 'timeline-mid',
        label: '1-3 Months',
        type: 'milestone',
        color: 'blue',
        children: [
          { id: 'tl-5', label: 'Follow-up appointment', type: 'task' },
          { id: 'tl-6', label: 'Re-test affected health indicators', type: 'task' }
        ]
      },
      {
        id: 'timeline-long',
        label: '3-6 Months',
        type: 'milestone',
        color: 'green',
        children: [
          { id: 'tl-7', label: 'Comprehensive health review', type: 'task' },
          { id: 'tl-8', label: 'Assess improvement and adjust plan', type: 'task' }
        ]
      }
    ]
  };

  nodes.children.push(timelineNode);

  // Add lifestyle node
  const lifestyleNode = {
    id: 'lifestyle',
    label: 'Lifestyle Improvements',
    type: 'lifestyle',
    children: [
      {
        id: 'ls-diet',
        label: 'Diet & Nutrition',
        type: 'lifestyle-area',
        color: 'green',
        children: [
          { id: 'ls-diet-1', label: 'Eat balanced meals with vegetables', type: 'task' },
          { id: 'ls-diet-2', label: 'Reduce sugar and salt intake', type: 'task' },
          { id: 'ls-diet-3', label: 'Stay hydrated - drink 8 glasses of water daily', type: 'task' }
        ]
      },
      {
        id: 'ls-exercise',
        label: 'Physical Activity',
        type: 'lifestyle-area',
        color: 'green',
        children: [
          { id: 'ls-ex-1', label: '30 minutes of walking daily', type: 'task' },
          { id: 'ls-ex-2', label: 'Include light stretching exercises', type: 'task' }
        ]
      },
      {
        id: 'ls-rest',
        label: 'Rest & Sleep',
        type: 'lifestyle-area',
        color: 'green',
        children: [
          { id: 'ls-rest-1', label: 'Get 7-8 hours of sleep nightly', type: 'task' },
          { id: 'ls-rest-2', label: 'Take short breaks during work', type: 'task' }
        ]
      },
      {
        id: 'ls-mental',
        label: 'Mental Wellness',
        type: 'lifestyle-area',
        color: 'green',
        children: [
          { id: 'ls-mental-1', label: 'Practice stress-reduction techniques', type: 'task' },
          { id: 'ls-mental-2', label: 'Stay connected with family and friends', type: 'task' }
        ]
      }
    ]
  };

  nodes.children.push(lifestyleNode);

  return {
    nodes,
    summary,
    disclaimer,
    profileInfo: profile ? {
      name: profile.fullName,
      age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null,
      nationality: profile.nationality,
      bloodType: profile.bloodType
    } : null,
    generatedAt: new Date().toISOString()
  };
}

function calculateAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Get color class for status
 */
export function getStatusColor(status) {
  switch (status) {
    case 'NORMAL': return '#10b981';
    case 'BORDERLINE': return '#f59e0b';
    case 'HIGH': return '#ef4444';
    case 'LOW': return '#3b82f6';
    default: return '#6b7280';
  }
}

/**
 * Get priority indicator
 */
export function getPriorityIndicator(priority) {
  switch (priority) {
    case 'high': return '!!!';
    case 'medium': return '!';
    case 'low': return '-';
    default: return '-';
  }
}