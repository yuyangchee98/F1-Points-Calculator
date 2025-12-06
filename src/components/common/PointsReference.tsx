import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { POINTS_SYSTEMS } from '../../data/pointsSystems';
import { getSeasonRules, SPRINT_POINTS } from '../../data/seasonRules';
import { getActiveSeason } from '../../utils/constants';

const PointsReference: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedSystemId = useSelector((state: RootState) => state.ui.selectedPointsSystem);
  const selectedSystem = POINTS_SYSTEMS[selectedSystemId];

  const pointsToShow = selectedSystem.regular;
  const seasonRules = getSeasonRules(getActiveSeason());
  const sprintPoints = SPRINT_POINTS[seasonRules.sprintFormat];

  const scoringPositions = pointsToShow ? Object.entries(pointsToShow)
    .filter(([, points]) => points > 0)
    .map(([position, points]) => ({ position: parseInt(position), points })) : [];

  const sprintScoringPositions = Object.entries(sprintPoints)
    .filter(([, points]) => points > 0)
    .map(([position, points]) => ({ position: parseInt(position), points }));

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
        <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
          {/* Regular Race Points */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Regular Race</h4>
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

          {/* Sprint Points (if applicable for this season) */}
          {sprintScoringPositions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sprint Race</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {sprintScoringPositions.map(({ position, points }) => (
                  <div key={position} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <span className="font-medium text-gray-700">P{position}</span>
                    <span className="text-sm text-gray-600">{points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fastest Lap info */}
          {seasonRules.fastestLap && (
            <div className="text-xs text-gray-500">
              Fastest lap: +{seasonRules.fastestLap.points} point (if finishing P1-P{seasonRules.fastestLap.maxEligiblePosition})
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PointsReference;