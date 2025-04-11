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
import { NotificationManager } from './components/Notification';
import useAppDispatch from './hooks/useAppDispatch';
import useWindowSize from './hooks/useWindowSize';
import { checkUrlForPrediction } from './store/thunks/predictionThunks';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  // Call useRaceResults but don't use the loading state
  useRaceResults();
  const mobileView = useSelector((state: RootState) => state.ui.mobileView);
  const { isMobile } = useWindowSize();

  useEffect(() => {
    // Initialize UI state from localStorage/URL
    dispatch(initializeUiState());
    
    // Calculate initial results
    dispatch(calculateResults());
    
    // Check for prediction ID in URL
    dispatch(checkUrlForPrediction());
  }, [dispatch]);
  
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
        {/* Add notification manager */}
        <NotificationManager />
        
        <Layout
          sidebar={<StandingsSidebar />}
          content={
            <div className="px-4 py-6 max-w-5xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800 flex flex-wrap sm:flex-nowrap items-center">
                <a href="/" className="no-underline text-inherit whitespace-nowrap">
                  <span className="bg-red-600 text-white px-3 py-1 mr-3 rounded-md">F1</span>
                  POINTS CALCULATOR
                </a>
                <span className="text-base sm:text-lg text-gray-500 ml-0 sm:ml-3 font-normal">2025 Season</span>
              </h1>
              
              {/* Buy me a coffee link at top */}
              <div className="mb-8">
                <a 
                  href="https://buymeacoffee.com/yaang" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block py-2 sm:py-3 px-4 sm:px-6 bg-red-600 text-white font-bold rounded-md shadow-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <span className="mr-2">🔴</span> Buy Chyuang a soft tyre
                </a>
              </div>
              
              <InfoBanner />
              <ActionsBar />
              
              {/* Always show driver selection and grid when in grid view */}
              <div className={`${(mobileView === 'grid' || !isMobile) ? 'block' : 'hidden'}`}>
                <DriverSelection />
                <RaceGrid />
              </div>
            </div>
          }
        />
      </div>
    </DndProvider>
  );
};

export default App;