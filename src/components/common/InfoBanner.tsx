import React, { useState, useEffect } from 'react';

const InfoBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('infoBannerExpanded');
    if (savedState === 'true') {
      setIsExpanded(true);
    }
  }, []);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('infoBannerExpanded', newState.toString());
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm mb-6 transition-all duration-300">
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-100 transition-colors rounded-lg"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse how to use" : "Expand how to use"}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <h3 className="text-lg font-semibold text-gray-800">How to Use</h3>
          {!isExpanded && (
            <span className="text-sm text-gray-600 ml-2">Click and drag drivers to predict race results...</span>
          )}
        </div>
        <svg 
          className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4">
          <ul className="list-disc ml-5 space-y-2 text-gray-700">
            <li>
              Click and drag drivers from the list to place them
              in their predicted finishing positions and get live points calculation.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;