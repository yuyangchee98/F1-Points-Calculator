import React from 'react';
import DriverSelection from '../drivers/DriverSelection';

interface InputSectionsProps {
  smartInputFirst: boolean;
  onSwap: () => void;
  smartInputContent: React.ReactNode;
}

const InputSections: React.FC<InputSectionsProps> = ({ 
  smartInputFirst, 
  onSwap,
  smartInputContent 
}) => {
  const driverSection = <DriverSelection key="drivers" />;
  const smartSection = (
    <div key="smart" className="mb-6 p-4 rounded-lg shadow-sm border border-gray-200 relative">
      {smartInputContent}
    </div>
  );

  const sections = smartInputFirst 
    ? [smartSection, driverSection] 
    : [driverSection, smartSection];

  return (
    <div className="relative">
      <div className={`transition-all duration-500 ease-in-out ${smartInputFirst ? 'translate-y-0' : ''}`}>
        {sections[0]}
      </div>

      <div className="flex items-center justify-center my-3">
        <div className="flex-1 h-px bg-gray-200 max-w-xs"></div>
        <button
          onClick={onSwap}
          className="group flex items-center gap-1.5 px-3 py-1.5 mx-3 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow hover:border-blue-400 transition-all duration-200"
          title="Swap input order"
        >
          <svg
            className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
          <span className="text-xs font-medium text-gray-500 group-hover:text-blue-500 transition-colors">
            Swap
          </span>
        </button>
        <div className="flex-1 h-px bg-gray-200 max-w-xs"></div>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${smartInputFirst ? '' : 'translate-y-0'}`}>
        {sections[1]}
      </div>
    </div>
  );
};

export default InputSections;