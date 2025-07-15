import React, { useState, useEffect } from 'react';
import { CURRENT_SEASON } from '../../utils/constants';

const IntroductionSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    // Check if user has a saved preference
    const savedState = localStorage.getItem('introExpanded');
    if (savedState === 'true') {
      setIsExpanded(true);
    }
  }, []);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('introExpanded', newState.toString());
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="text-gray-700 leading-relaxed">
        <p>
          Welcome to the F1 Points Calculator {CURRENT_SEASON} - your ultimate tool for predicting Formula 1 championship outcomes.
          {!isExpanded && (
            <>
              {' '}
              <button
                onClick={toggleExpanded}
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                aria-label="Read more about the F1 calculator"
              >
                Read more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </>
          )}
        </p>
        
        <div 
          className={`transition-all duration-500 overflow-hidden ${
            isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}
        >
          <p className="text-gray-700 leading-relaxed">
            This interactive calculator allows you to simulate race results for the entire {CURRENT_SEASON} F1 season by simply dragging 
            and dropping drivers into their finishing positions. Watch as the championship standings update in real-time, 
            helping you analyze different scenarios and predict who might become the next F1 World Champion.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Perfect for F1 fans who want to explore &ldquo;what-if&rdquo; scenarios, track their favorite drivers&apos; championship chances, 
            or make predictions for upcoming races. The calculator uses the official F1 points system (25-18-15-12-10-8-6-4-2-1) 
            and includes all drivers and teams from the {CURRENT_SEASON} Formula 1 season.
          </p>
          <button
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-800 font-medium mt-3 inline-flex items-center gap-1"
            aria-label="Show less"
          >
            Show less
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionSection;