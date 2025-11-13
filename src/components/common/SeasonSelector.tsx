import React, { useState, useRef, useEffect } from 'react';
import { getActiveSeason, CURRENT_SEASON } from '../../utils/constants';

interface Season {
  year: number;
  label: string;
  isHistorical: boolean;
}

const SEASONS: Season[] = [
  { year: 2025, label: '2025 Season', isHistorical: false },
  { year: 2024, label: '2024 Season', isHistorical: true }
];

const SeasonSelector: React.FC = () => {
  const activeSeason = getActiveSeason();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSeason = SEASONS.find(s => s.year === activeSeason) || SEASONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSeasonUrl = (year: number): string => {
    return year === CURRENT_SEASON ? '/' : `/${year}`;
  };

  return (
    <div className="season-selector relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentSeason.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl"
             style={{
               width: '16rem',
               right: 0
             }}>
          <div className="py-1">
            {SEASONS.map(season => (
              <a
                key={season.year}
                href={getSeasonUrl(season.year)}
                className={`block w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  season.year === activeSeason ? 'bg-red-50' : ''
                }`}
                aria-current={season.year === activeSeason ? 'page' : undefined}
              >
                <div className="font-medium text-gray-900 flex items-center justify-between">
                  <span>{season.label}</span>
                  <div className="flex items-center gap-2">
                    {season.isHistorical && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                        Historical
                      </span>
                    )}
                    {season.year === activeSeason && (
                      <span className="text-xs text-red-600">(Current)</span>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {season.isHistorical
                    ? 'View completed season results and explore what-if scenarios'
                    : 'Active season - predict upcoming race outcomes'}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonSelector;
