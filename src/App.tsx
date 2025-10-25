import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { initializeUiState, setMobileView } from './store/slices/uiSlice';
import { RootState, store } from './store';
import { calculateResults } from './store/slices/resultsSlice';
import { moveDriver } from './store/slices/gridSlice';
import { selectDriverTeamsMap } from './store/selectors/dataSelectors';
import { parseNaturalLanguage } from './api/naturalLanguage';
import { createCheckoutSession } from './api/subscription';
import useRaceResults from './hooks/useRaceResults';
import { useAutoSave } from './hooks/useAutoSave';
import { useLoadPredictions } from './hooks/useLoadPredictions';
import { useDayAccess } from './hooks/useSubscription';
import { useUserEmail } from './hooks/useUserEmail';
import Layout from './components/layout/Layout';
import StandingsSidebar from './components/standings/StandingsSidebar';
import RaceGrid from './components/grid/RaceGrid';
import ActionsBar from './components/common/ActionsBar';
import InfoBanner from './components/common/InfoBanner';
import IntroductionSection from './components/common/IntroductionSection';
import ToastContainer from './components/common/ToastContainer';
import SaveStatus from './components/common/SaveStatus';
import HorizontalScrollBar from './components/common/HorizontalScrollBar';
import FAQ from './components/common/FAQ';
import SubscriptionModal from './components/common/SubscriptionModal';
import InputSections from './components/common/InputSections';
import RacendoPromo from './components/common/RacendoPromo';
const SmartInputDemo = React.lazy(() => import('./components/common/SmartInputDemo'));
import useAppDispatch from './hooks/useAppDispatch';
import useWindowSize from './hooks/useWindowSize';
import { trackBuyCoffeeClick, trackFeedbackClick, trackSmartInputAction, trackSmartInputCommand } from './utils/analytics';
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
  const { hasAccess, statusMessage } = useDayAccess();
  const { email, saveEmail } = useUserEmail();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [smartInputFirst, setSmartInputFirst] = useState(() => {
    return localStorage.getItem('f1_input_order') === 'smart-first';
  });

  const handleSwapInputs = () => {
    const newValue = !smartInputFirst;
    setSmartInputFirst(newValue);
    localStorage.setItem('f1_input_order', newValue ? 'smart-first' : 'drivers-first');
  };


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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex flex-wrap sm:flex-nowrap items-center">
                  <span className="whitespace-nowrap">
                    <span className="bg-red-600 text-white px-3 py-1 mr-3 rounded-md">F1</span>
                    Championship Calculator
                  </span>
                  <span className="text-base sm:text-lg text-gray-500 ml-0 sm:ml-3 font-normal">{CURRENT_SEASON} Season Predictor</span>
                </h1>
                <RacendoPromo className="self-start sm:self-center" />
              </div>
              
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
              
              {/* Show status message */}
              {statusMessage && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-center text-blue-700 font-medium">
                    {statusMessage}
                  </p>
                </div>
              )}
              
              {/* Always show driver selection and grid when in grid view */}
              <div className={`${(mobileView === 'grid' || !isMobile) ? 'block' : 'hidden'}`}>
                <InputSections 
                  smartInputFirst={smartInputFirst}
                  onSwap={handleSwapInputs}
                  smartInputContent={
                    <>
                  {hasAccess && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h3 className="text-2xl font-bold">SMART INPUT</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <p className="text-sm text-gray-600 mt-2 sm:mt-0">
                          Type commands like {'"'}Max P1 at Monza{'"'} or {'"'}Hamilton wins next 3 races{'"'} and they{"'"}ll be placed on the grid instantly
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {hasAccess ? (
                    email ? (
                      <>
                        <textarea
                          id="nl-input"
                          className="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                    transition duration-150 ease-in-out text-sm hover:border-gray-400"
                          placeholder='"Max wins next 3 races" or "Championship leader P1 for all remaining races"'
                          rows={3}
                        />
                        <div className="mt-4">
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow transition font-semibold"
                            onClick={async () => {
                            const textarea = document.getElementById('nl-input') as HTMLTextAreaElement;
                            const text = textarea.value.trim();
                            
                            if (!text) return;
                            
                            trackSmartInputAction('USE_COMMAND', text.substring(0, 50));
                            
                            try {
                              // Gather context from Redux store
                              const state = store.getState();
                              
                              // Build race context
                              const races = state.seasonData.races.map(race => ({
                                raceId: race.id,
                                completed: race.completed,
                                order: race.order,
                                isSprint: race.isSprint
                              }));
                              
                              // Build predictions map (only user predictions, not official results)
                              const predictions: Record<string, Record<string, string>> = {};
                              state.grid.positions.forEach(pos => {
                                if (pos.driverId && !pos.isOfficialResult) {
                                  if (!predictions[pos.raceId]) {
                                    predictions[pos.raceId] = {};
                                  }
                                  predictions[pos.raceId][pos.position.toString()] = pos.driverId;
                                }
                              });
                              
                              // Get standings
                              const standings = {
                                drivers: state.results.driverStandings,
                                teams: state.results.teamStandings
                              };

                              // Get driver teams using selector
                              const driverTeams = selectDriverTeamsMap(state);

                              const context = {
                                races,
                                predictions,
                                standings,
                                driverTeams
                              };
                              
                              const response = await parseNaturalLanguage(text, email || '', context);
                              
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
                                trackSmartInputCommand(text, true, response.placements.length);
                              }
                            } catch (err) {
                              console.error('Error parsing natural language:', err);
                              trackSmartInputCommand(text, false);
                              if (err instanceof Error && err.message === 'ACCESS_REQUIRED') {
                                // User needs to get access
                                setShowSubscriptionModal(true);
                              } else {
                                alert('Failed to understand the input. Try something like: "Max P1 at Vegas"');
                              }
                            }
                          }}
                        >
                          Apply Predictions
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-2">⚠️ Email required for Smart Input</p>
                      <p className="text-sm text-gray-500">Your 24-hour access is tied to your email address</p>
                    </div>
                  )
                  ) : (
                    <div className="bg-white rounded-md p-6 border border-red-300 shadow-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                        {/* Left side - Description */}
                        <div className="flex-1 mb-6 md:mb-0 text-center">
                          <h4 className="text-xl font-bold mb-3">Try Smart Input: <span className="font-normal text-sm text-gray-600">Type what you want to happen and watch the grid update instantly. <span className="text-xs text-gray-500">Watch demo ↓</span></span></h4>
                          
                          {/* Interactive Demo */}
                          <div className="mb-4">
                            <React.Suspense fallback={
                              <div style={{ width: '380px', maxWidth: '100%', margin: '0 auto' }}>
                                <div style={{ height: '38px', marginBottom: '15px' }}></div>
                                <div style={{ height: '150px' }}></div>
                              </div>
                            }>
                              <SmartInputDemo />
                            </React.Suspense>
                          </div>
                        </div>
                        
                        {/* Vertical divider - only on desktop */}
                        <div className="hidden md:block w-px bg-gray-200 self-stretch mx-4"></div>
                        
                        {/* Right side - CTA */}
                        <div className="text-center">
                          {/* Desktop view */}
                          <div className="hidden md:block">
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md shadow-lg transition font-semibold text-lg"
                              onClick={() => {
                                trackSmartInputAction('CLICK_TRY_NOW');
                                setShowSubscriptionModal(true);
                              }}
                            >
                              Try Now
                            </button>
                            <p className="text-xs text-gray-500 mt-2">
                              $0.99 • One-time payment • Exactly 24 hours
                            </p>
                          </div>
                          
                          {/* Mobile view - keep the original inline flow */}
                          <div className="md:hidden">
                            <h4 className="text-xl font-bold mb-2">Get 24-Hour Access</h4>
                            <p className="text-4xl font-bold text-red-600 mb-1">$0.99</p>
                            <p className="text-sm text-gray-600 mb-4">One-time payment • Exactly 24 hours</p>
                            
                            {!email && (
                              <div className="mb-4">
                                <input
                                  type="email"
                                  placeholder="Enter your email"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const input = e.target as HTMLInputElement;
                                      if (input.value && input.value.includes('@')) {
                                        trackSmartInputAction('ENTER_EMAIL', input.value);
                                        saveEmail(input.value);
                                      }
                                    }
                                  }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter email to continue</p>
                              </div>
                            )}
                            
                            <button 
                              className={`px-8 py-3 rounded-md shadow-lg transition font-semibold text-lg ${
                                email 
                                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              disabled={!email}
                              onClick={async () => {
                                if (!email) {
                                  alert('Please enter your email first');
                                  return;
                                }
                                
                                trackSmartInputAction('CLICK_SUBSCRIBE', email);
                                
                                try {
                                  const session = await createCheckoutSession(email);
                                  window.location.href = session.url;
                                } catch (error) {
                                  console.error('Error creating checkout session:', error);
                                  alert('Failed to start checkout process. Please try again.');
                                }
                              }}
                            >
                              Get Access
                            </button>
                            
                            {email && (
                              <button
                                className="block mx-auto mt-2 text-xs text-gray-500 hover:text-gray-700"
                                onClick={() => {
                                  if (window.confirm('Change email address?')) {
                                    saveEmail('');
                                  }
                                }}
                              >
                                Not {email}?
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    </>
                  }
                />
                
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
        
        {/* Subscription Modal */}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          email={email}
          onEmailChange={saveEmail}
        />
      </div>
    </DndProvider>
  );
};

export default App;