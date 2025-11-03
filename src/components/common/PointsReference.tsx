import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { POINTS_SYSTEMS } from '../../data/pointsSystems';

const PointsReference: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedSystemId = useSelector((state: RootState) => state.ui.selectedPointsSystem);
  const selectedSystem = POINTS_SYSTEMS[selectedSystemId];

  // Always show regular points (sprint race selection was never implemented)
  const pointsToShow = selectedSystem.regular;
  
  // Get positions that actually have points
  const scoringPositions = pointsToShow ? Object.entries(pointsToShow)
    .filter(([, points]) => points > 0)
    .map(([position, points]) => ({ position: parseInt(position), points })) : [];

  return (
    <div className="points-reference mb-4">
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>Points Reference</span>
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {scoringPositions.map(({ position, points }) => (
              <div key={position} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <span className="font-medium text-gray-700">P{position}</span>
                <span className="text-sm text-gray-600">{points} pts</span>
              </div>
            ))}
          </div>
          {scoringPositions.length < 20 && (
            <div className="mt-2 text-xs text-gray-500">
              Positions {scoringPositions.length + 1}-20: 0 points
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PointsReference;