import React, { useState } from 'react';

const InfoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(
    localStorage.getItem('hideHowToUse') !== 'true'
  );

  const closeInfoBanner = () => {
    setIsVisible(false);
    localStorage.setItem('hideHowToUse', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">How to Use</h3>
        <button
          onClick={closeInfoBanner}
          className="text-2xl text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      
      <ul className="list-disc ml-5 mb-4">
        <li className="mb-2">
          Click and drag drivers from the list to place them
          in their predicted finishing positions. When you place a driver in a
          position that already has a driver, the existing driver will be replaced.
        </li>
        <li className="mb-2">
          Points are automatically calculated based on F1's
          official scoring system (25-18-15-12-10-8-6-4-2-1 for races,
          8-7-6-5-4-3-2-1 for sprint races)
        </li>
        <li className="mb-2">
          Use the reset button to clear your predictions
        </li>
        <li className="mb-2">
          Official results are marked with a checkmark (✓) and can be toggled on/off.
          You'll receive notifications when drivers are replaced or moved between positions.
        </li>
        <li className="mb-2">
          Sprint races are highlighted in amber and use a different points system.
          Fastest lap points (1 point) are only awarded in main races, not in sprints.
        </li>
      </ul>
      
      <p className="font-bold">
        <span className="font-bold">Note:</span> Constructors points are inaccurate right now due to the Yuki/Lawson swap. Fix coming soon!
      </p>
    </div>
  );
};

export default InfoBanner;