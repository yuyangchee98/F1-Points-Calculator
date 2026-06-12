import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { MobileView } from '../../types';
import { setMobileView } from '../../store/slices/uiSlice';
import { useAppDispatch } from '../../store';

const MobileNavigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentView = useSelector((state: RootState) => state.ui.mobileView);
  
  const handleViewChange = (view: MobileView) => {
    dispatch(setMobileView(view));
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-carbon-900 z-nav sm:hidden h-16">
      <div className="flex justify-around items-center h-full">
        <button
          className={`relative flex flex-col items-center justify-center w-1/2 h-full transition-colors ${
            currentView === 'grid' ? 'text-white' : 'text-carbon-400'
          }`}
          aria-current={currentView === 'grid' ? 'page' : undefined}
          onClick={() => handleViewChange('grid')}
        >
          {currentView === 'grid' && (
            <span className="absolute top-0 inset-x-6 h-0.5 bg-brand rounded-b-sm" aria-hidden="true" />
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="text-xs font-medium">Race Grid</span>
        </button>

        <button
          className={`relative flex flex-col items-center justify-center w-1/2 h-full transition-colors ${
            currentView === 'standings' ? 'text-white' : 'text-carbon-400'
          }`}
          aria-current={currentView === 'standings' ? 'page' : undefined}
          onClick={() => handleViewChange('standings')}
        >
          {currentView === 'standings' && (
            <span className="absolute top-0 inset-x-6 h-0.5 bg-brand rounded-b-sm" aria-hidden="true" />
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs font-medium">Standings</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;