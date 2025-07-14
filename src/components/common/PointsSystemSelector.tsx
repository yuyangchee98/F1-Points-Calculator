import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { selectPointsSystem } from '../../store/slices/uiSlice';
import { POINTS_SYSTEMS } from '../../data/pointsSystems';
import { trackPointsSystemChange } from '../../utils/analytics';
import { BREAKPOINTS } from '../../utils/constants';

const PointsSystemSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selectedSystem = useSelector((state: RootState) => state.ui.selectedPointsSystem);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentSystem = POINTS_SYSTEMS[selectedSystem];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectSystem = (systemId: string) => {
    dispatch(selectPointsSystem(systemId));
    setIsOpen(false);
    setSearchQuery('');
    trackPointsSystemChange(systemId);
  };

  // Categorize systems
  const categorizedSystems = {
    'F1 Historical': ['current', '2003-2009', '1991-2002', '1960s-1980s', '1950s'],
    'Other Motorsports': ['motogp', 'indycar', 'formula-e'],
    'Mathematical': ['linear', 'exponential', 'fibonacci', 'square-root', 'progressive'],
    'Creative': ['winner-takes-all', 'top-heavy', 'olympic', 'reliability', 'underdog', 'win-bonus']
  };

  // Filter systems based on search
  const filteredSystems = Object.values(POINTS_SYSTEMS).filter(system => {
    const query = searchQuery.toLowerCase();
    return system.name.toLowerCase().includes(query) || 
           system.description.toLowerCase().includes(query);
  });

  // Enhanced descriptions for each system
  const getDetailedDescription = (systemId: string) => {
    switch (systemId) {
      case 'current':
        return 'The modern F1 points system rewards the top 10 finishers. Winner gets 25 points, with a significant drop to 18 for second place. Sprint races have special reduced points: 8-7-6-5-4-3-2-1 for top 8 positions only. Used since 2010.';
      case '2003-2009':
        return 'Classic F1 scoring where only the top 8 finishers earned points. Winner received 10 points, second place 8 points. This system emphasized consistency in top positions. Note: Sprint races use the same points as regular races.';
      case '1991-2002':
        return 'Traditional F1 scoring rewarding only the top 6 finishers. Winner got 10 points, but the gap to second (6 points) was larger, making wins more valuable than consistency. Note: Sprint races use the same points as regular races.';
      case '1960s-1980s':
        return 'The classic F1 era where every point was precious. Only top 6 scored: 9-6-4-3-2-1. Small point totals meant every position mattered immensely. Championships were often decided by single points.';
      case '1950s':
        return 'The original F1 points system from the championship\'s inception. Only top 5 finishers scored: 8-6-4-3-2. In this era, reliability was poor and just finishing was an achievement.';
      case 'linear':
        return 'Every position scores points, decreasing by 1 each place. Winner gets 20 points down to 1 point for 20th. This system rewards all finishers and values consistency throughout the field. Sprint races use the same points as regular races.';
      case 'winner-takes-all':
        return 'Only the race winner scores points (100 for races). This extreme system makes winning everything - no points for any other position. Pure victory or nothing. Sprint races also award 100 points to winner only.';
      case 'top-heavy':
        return 'Heavily rewards podium finishes with 50-30-20 points for top 3. Points drop sharply after that. This system makes podium positions extremely valuable compared to mid-field finishes. Sprint races use the same points as regular races.';
      case 'motogp':
        return 'Borrowed from motorcycle racing where more positions score points. Top 15 finishers get points with a 25-20-16-13-11... distribution. Rewards consistency and gives midfield teams more to fight for.';
      case 'indycar':
        return 'American open-wheel style where everyone scores. All 20 positions get points, starting from 50 and decreasing gradually. Makes every position worth fighting for and rewards finishing races.';
      case 'formula-e':
        return 'Electric racing series system. Same as current F1 (25-18-15...) with additional bonus points in the real series. Clean, modern scoring for sustainable racing.';
      case 'exponential':
        return 'Mathematical system where points halve each position: 32-16-8-4-2-1... Creates massive gaps between positions. Winning is hugely valuable, but even small improvements matter.';
      case 'olympic':
        return 'Medal-based system where only the podium matters. Gold (P1) gets 5 points, Silver (P2) gets 3, Bronze (P3) gets 1. No points for P4 onwards. Pure podium focus.';
      case 'progressive':
        return 'Gentle linear decrease rewarding consistency. Starting at 30 points for P1, decreasing by 2 each position down to P15. Makes mid-pack battles meaningful and values reliability.';
      case 'fibonacci':
        return 'Mathematical elegance using Fibonacci sequence: 34-21-13-8-5-3-2-1-1-1. Natural progression that heavily rewards top positions while still valuing top 10 finishes.';
      case 'square-root':
        return 'Points based on the square root of (21-position). Creates a smooth curve: 4.47-4.24-4-3.74... down to 1.41 for P10. Rewards improvement at any position level.';
      case 'reliability':
        return 'Rewards finishing races with 5-point bonus for all finishers. Winner gets 30, P2 gets 23, but everyone P11-P20 gets 5 points just for finishing. Values reliability over pure speed.';
      case 'underdog':
        return 'Complete chaos mode! Last place (P20) gets 20 points, first place gets just 1 point. Inverse scoring that would create absolute mayhem in championships. For fun only!';
      case 'win-bonus':
        return 'Current F1 system but winning pays extra. P1 gets 35 points (+10 bonus), all other positions stay the same. Bernie Ecclestone once proposed this to encourage attacking for wins.';
      default:
        return POINTS_SYSTEMS[systemId]?.description || '';
    }
  };

  // Get filtered systems by category
  const getFilteredSystemsByCategory = () => {
    const result: Record<string, typeof filteredSystems> = {};
    
    Object.entries(categorizedSystems).forEach(([category, systemIds]) => {
      const categoryFiltered = filteredSystems.filter(system => 
        systemIds.includes(system.id)
      );
      if (categoryFiltered.length > 0) {
        result[category] = categoryFiltered;
      }
    });
    
    return result;
  };

  const filteredCategories = getFilteredSystemsByCategory();
  const hasResults = filteredSystems.length > 0;

  return (
    <div className="points-system-selector relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentSystem.name}</span>
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
               width: 'min(24rem, calc(100vw - 2rem))',
               maxWidth: '100vw',
               right: window.innerWidth < BREAKPOINTS.mobile ? '50%' : 'auto',
               transform: window.innerWidth < BREAKPOINTS.mobile ? 'translateX(50%)' : 'none'
             }}>
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search points systems..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto">
            {hasResults ? (
              <div className="py-1">
                {Object.entries(filteredCategories).map(([category, systems]) => (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {category}
                    </div>
                    {systems.map(system => (
                      <button
                        key={system.id}
                        onClick={() => handleSelectSystem(system.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          system.id === selectedSystem ? 'bg-red-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {system.name}
                          {system.id === selectedSystem && (
                            <span className="ml-2 text-xs text-red-600">(Current)</span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-600 leading-relaxed">
                          {getDetailedDescription(system.id)}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Top 3: {system.regular[1]}-{system.regular[2]}-{system.regular[3]} pts
                          {system.regular[10] > 0 && ` • Points to P${Object.values(system.regular).filter(p => p > 0).length}`}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No points systems match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsSystemSelector;