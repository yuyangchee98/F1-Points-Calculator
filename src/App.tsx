import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { initializeUiState, setMobileView } from './store/slices/uiSlice';
import { RootState } from './store';
import { calculateResults } from './store/slices/resultsSlice';
import useRaceResults from './hooks/useRaceResults';
import Layout from './components/layout/Layout';
import StandingsSidebar from './components/standings/StandingsSidebar';
import RaceGrid from './components/grid/RaceGrid';
import ActionsBar from './components/common/ActionsBar';
import InfoBanner from './components/common/InfoBanner';
import ToastContainer from './components/common/ToastContainer';
import DriverSelection from './components/drivers/DriverSelection';
import FAQ from './components/common/FAQ';
import useAppDispatch from './hooks/useAppDispatch';
import useWindowSize from './hooks/useWindowSize';
import { trackBuyCoffeeClick } from './utils/analytics';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  // Call useRaceResults but don't use the loading state
  useRaceResults();
  const mobileView = useSelector((state: RootState) => state.ui.mobileView);
  const selectedPointsSystem = useSelector((state: RootState) => state.ui.selectedPointsSystem);
  const { isMobile } = useWindowSize();

  useEffect(() => {
    // Initialize UI state from localStorage/URL
    dispatch(initializeUiState());
    
    // Calculate initial results
    dispatch(calculateResults());
  }, [dispatch]);
  
  // Recalculate results when points system changes
  useEffect(() => {
    dispatch(calculateResults());
  }, [dispatch, selectedPointsSystem]);
  
  // Auto-update layout when window is resized
  useEffect(() => {
    // When in tablet or desktop mode, ensure we render the grid view
    if (!isMobile) {
      // Only dispatch if needed to avoid unnecessary renders
      if (mobileView !== 'grid') {
        dispatch(setMobileView('grid'));
      }
    }
  }, [isMobile, mobileView, dispatch]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app min-h-screen">
        <ToastContainer />
        
        <Layout
          sidebar={<StandingsSidebar />}
          content={
            <div className="px-4 py-6 max-w-5xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800 flex flex-wrap sm:flex-nowrap items-center">
                <span className="whitespace-nowrap">
                  <span className="bg-red-600 text-white px-3 py-1 mr-3 rounded-md">F1</span>
                  Championship Calculator
                </span>
                <span className="text-base sm:text-lg text-gray-500 ml-0 sm:ml-3 font-normal">2025 Season Predictor</span>
              </h1>
              
              {/* Buy me a coffee link at top */}
              <div className="mb-8">
                <a 
                  href="https://buymeacoffee.com/yaang" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block py-2 sm:py-3 px-4 sm:px-6 bg-red-600 text-white font-bold rounded-md shadow-lg hover:bg-red-700 transition-colors duration-200"
                  onClick={trackBuyCoffeeClick}
                >
                  <span className="mr-2">🔴</span> Buy Chyuang a soft tyre
                </a>
              </div>
              
              <InfoBanner />
              
              {/* Introduction section for better word count and SEO */}
              <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                <p className="text-gray-700 leading-relaxed">
                  Welcome to the F1 Points Calculator 2025 - your ultimate tool for predicting Formula 1 championship outcomes. 
                  This interactive calculator allows you to simulate race results for the entire 2025 F1 season by simply dragging 
                  and dropping drivers into their finishing positions. Watch as the championship standings update in real-time, 
                  helping you analyze different scenarios and predict who might become the next F1 World Champion.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Perfect for F1 fans who want to explore "what-if" scenarios, track their favorite drivers' championship chances, 
                  or make predictions for upcoming races. The calculator uses the official F1 points system (25-18-15-12-10-8-6-4-2-1) 
                  and includes all drivers and teams from the 2025 Formula 1 season.
                </p>
              </div>
              
              <ActionsBar />
              
              {/* Always show driver selection and grid when in grid view */}
              <div className={`${(mobileView === 'grid' || !isMobile) ? 'block' : 'hidden'}`}>
                <DriverSelection />
                <RaceGrid />
              </div>
              
              {/* FAQ Section for SEO */}
              <FAQ />
            </div>
          }
        />
      </div>
    </DndProvider>
  );
};

export default App;