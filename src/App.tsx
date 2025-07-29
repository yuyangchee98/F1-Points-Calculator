import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { initializeUiState, setMobileView } from './store/slices/uiSlice';
import { RootState } from './store';
import { calculateResults } from './store/slices/resultsSlice';
import { moveDriver } from './store/slices/gridSlice';
import { parseNaturalLanguage } from './api/naturalLanguage';
import useRaceResults from './hooks/useRaceResults';
import { useAutoSave } from './hooks/useAutoSave';
import { useLoadPredictions } from './hooks/useLoadPredictions';
import Layout from './components/layout/Layout';
import StandingsSidebar from './components/standings/StandingsSidebar';
import RaceGrid from './components/grid/RaceGrid';
import ActionsBar from './components/common/ActionsBar';
import InfoBanner from './components/common/InfoBanner';
import IntroductionSection from './components/common/IntroductionSection';
import ToastContainer from './components/common/ToastContainer';
import SaveStatus from './components/common/SaveStatus';
import DriverSelection from './components/drivers/DriverSelection';
import HorizontalScrollBar from './components/common/HorizontalScrollBar';
import FAQ from './components/common/FAQ';
import useAppDispatch from './hooks/useAppDispatch';
import useWindowSize from './hooks/useWindowSize';
import { trackBuyCoffeeClick, trackFeedbackClick } from './utils/analytics';
import { CURRENT_SEASON } from './utils/constants';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  // Call useRaceResults but don't use the loading state
  useRaceResults();
  // Enable auto-save
  useAutoSave();
  // Load saved predictions only after fingerprint is initialized
  const { isLoading: isLoadingPredictions } = useLoadPredictions();
  const mobileView = useSelector((state: RootState) => state.ui.mobileView);
  const selectedPointsSystem = useSelector((state: RootState) => state.ui.selectedPointsSystem);
  const { isMobile } = useWindowSize();
  const raceGridScrollRef = React.useRef<HTMLDivElement>(null);

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
        <SaveStatus />
        
        <Layout
          sidebar={<StandingsSidebar />}
          content={
            <div className="px-4 py-6 max-w-5xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800 flex flex-wrap sm:flex-nowrap items-center">
                <span className="whitespace-nowrap">
                  <span className="bg-red-600 text-white px-3 py-1 mr-3 rounded-md">F1</span>
                  Championship Calculator
                </span>
                <span className="text-base sm:text-lg text-gray-500 ml-0 sm:ml-3 font-normal">{CURRENT_SEASON} Season Predictor</span>
              </h1>
              
              {/* Buy me a coffee link at top */}
              <div className="mb-8 flex flex-wrap gap-4">
                <a 
                  href="https://buymeacoffee.com/yaang" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block py-2 sm:py-3 px-4 sm:px-6 bg-red-600 text-white font-bold rounded-md shadow-lg hover:bg-red-700 transition-colors duration-200"
                  onClick={trackBuyCoffeeClick}
                >
                  <span className="mr-2">🔴</span> Buy Chyuang a soft tyre
                </a>
                
                <a 
                  href="https://github.com/yuyangchee98/F1-Points-Calculator/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block py-2 sm:py-3 px-4 sm:px-6 bg-gray-700 text-white font-bold rounded-md shadow-lg hover:bg-gray-800 transition-colors duration-200"
                  onClick={trackFeedbackClick}
                >
                  <span className="mr-2">💬</span> Feature Requests / Report Bugs
                </a>
              </div>
              
              <ActionsBar />
              
              {/* Show loading state if predictions are being loaded */}
              {isLoadingPredictions && (
                <div className="text-center py-4 text-gray-600">
                  <span className="animate-pulse">Loading your saved predictions...</span>
                </div>
              )}
              
              {/* Always show driver selection and grid when in grid view */}
              <div className={`${(mobileView === 'grid' || !isMobile) ? 'block' : 'hidden'}`}>
                <DriverSelection />
                
                {/* Natural Language Placement Input */}
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Natural Language Predictions (Experimental)</h3>
                  <textarea
                    id="nl-input"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder='Try: "Put Max in P1 at Vegas, Hamilton P2, Leclerc P3"'
                    rows={3}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                      onClick={async () => {
                        const textarea = document.getElementById('nl-input') as HTMLTextAreaElement;
                        const text = textarea.value.trim();
                        
                        if (!text) return;
                        
                        try {
                          const response = await parseNaturalLanguage(text);
                          
                          if (response.placements && Array.isArray(response.placements)) {
                            response.placements.forEach(p => {
                              dispatch(moveDriver({
                                driverId: p.driverId,
                                toRaceId: p.toRaceId,
                                toPosition: p.toPosition
                              }));
                            });
                            dispatch(calculateResults());
                            textarea.value = '';
                          }
                        } catch (err) {
                          console.error('Error parsing natural language:', err);
                          alert('Failed to understand the input. Try something like: "Max P1 at Vegas"');
                        }
                      }}
                    >
                      Apply Predictions
                    </button>
                    <span className="text-xs text-gray-600">Powered by AI</span>
                  </div>
                </div>
                
                <HorizontalScrollBar scrollContainerRef={raceGridScrollRef} />
                <RaceGrid scrollRef={raceGridScrollRef} />
              </div>
              
              <InfoBanner />
              
              <IntroductionSection />
              
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