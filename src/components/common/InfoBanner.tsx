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
          in their predicted finishing positions and get live points calculation. 
        </li>
      </ul>
    </div>
  );
};

export default InfoBanner;