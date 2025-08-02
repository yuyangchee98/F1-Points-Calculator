import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { initializeUiState, setMobileView } from './store/slices/uiSlice';
import { RootState, store } from './store';
import { calculateResults } from './store/slices/resultsSlice';
import { moveDriver } from './store/slices/gridSlice';
import { parseNaturalLanguage } from './api/naturalLanguage';
import { createCheckoutSession, createPortalSession } from './api/subscription';
import useRaceResults from './hooks/useRaceResults';
import { useAutoSave } from './hooks/useAutoSave';
import { useLoadPredictions } from './hooks/useLoadPredictions';
import { useSubscription } from './hooks/useSubscription';
import { useUserEmail } from './hooks/useUserEmail';
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
import TypingAnimation from './components/common/TypingAnimation';
import SubscriptionModal from './components/common/SubscriptionModal';
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
  const { isSubscribed } = useSubscription();
  const { email, saveEmail } = useUserEmail();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Example commands for typing animation
  const exampleCommands = [
    "Max wins at Monza",
    "Hamilton P1 next 3 races",
    "Verstappen wins all remaining races",
    "Norris podium at Silverstone",
    "Ferrari 1-2 at Italian GP",
    "Russell P5 at Hungary",
    "Championship leader wins Monaco",
    "Alonso points at Spanish GP",
    "Red Bull 1-2 next sprint",
    "Mercedes double podium Vegas",
    "Leclerc pole to win at home",
    "Top 3 stays same at Suzuka",
    "McLaren outscores Ferrari today",
    "Sainz beats teammate next race",
    "Rookie scores first points"
  ];

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
                <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 relative">
                  {isSubscribed && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h3 className="text-2xl font-bold">SMART INPUT</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <p className="text-sm text-gray-600 mt-2 sm:mt-0">
                          Type commands like "Max P1 at Monza" or "Hamilton wins next 3 races" and they'll be placed on the grid instantly
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {isSubscribed ? (
                    email ? (
                      <>
                        <textarea
                          id="nl-input"
                          className="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                    transition duration-150 ease-in-out text-sm hover:border-gray-400"
                          placeholder='Try: "Max wins next 3 races" or "Championship leader P1 for all remaining races"'
                          rows={3}
                        />
                        <div className="mt-4">
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow transition font-semibold"
                            onClick={async () => {
                            const textarea = document.getElementById('nl-input') as HTMLTextAreaElement;
                            const text = textarea.value.trim();
                            
                            if (!text) return;
                            
                            try {
                              // Gather context from Redux store
                              const state = store.getState();
                              
                              // Build race context
                              const races = state.races.list.map(race => ({
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
                              
                              // Get driver teams
                              const driverTeams = state.drivers.driverTeams;
                              
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
                              }
                            } catch (err) {
                              console.error('Error parsing natural language:', err);
                              if (err instanceof Error && err.message === 'SUBSCRIPTION_REQUIRED') {
                                // User needs to subscribe
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
                      <p className="text-sm text-gray-500">Your subscription is tied to your email address</p>
                    </div>
                  )
                  ) : (
                    <div className="bg-white rounded-md p-6 border border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                        {/* Left side - Description */}
                        <div className="flex-1 mb-6 md:mb-0 text-center md:text-left">
                          <h4 className="text-xl font-bold mb-3">What is Smart Input?</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Type natural commands like "Max wins at Monza" or "Hamilton P1 next 3 races" 
                            and watch as drivers are instantly placed on the grid. No more clicking through 
                            hundreds of positions - just type what you want and it happens.
                          </p>
                          <div className="flex justify-center md:justify-start">
                            <TypingAnimation examples={exampleCommands} />
                          </div>
                        </div>
                        
                        {/* Right side - CTA */}
                        <div className="text-center">
                          {/* Desktop view */}
                          <div className="hidden md:block">
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md shadow-lg transition font-semibold text-lg"
                              onClick={() => setShowSubscriptionModal(true)}
                            >
                              Try Now
                            </button>
                            <p className="text-xs text-gray-500 mt-2">$4.99/month • Cancel anytime</p>
                          </div>
                          
                          {/* Mobile view - keep the original inline flow */}
                          <div className="md:hidden">
                            <h4 className="text-xl font-bold mb-2">Unlock Smart Input</h4>
                            <p className="text-4xl font-bold text-red-600 mb-1">$4.99</p>
                            <p className="text-sm text-gray-600 mb-4">per month</p>
                            
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
                                
                                try {
                                  const session = await createCheckoutSession(email);
                                  window.location.href = session.url;
                                } catch (error) {
                                  console.error('Error creating checkout session:', error);
                                  alert('Failed to start checkout process. Please try again.');
                                }
                              }}
                            >
                              Subscribe Now
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
        
        {/* Subscription Modal */}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          email={email}
          onEmailChange={saveEmail}
        />
        
        {/* Manage Subscription Link - only show if subscribed */}
        {isSubscribed && email && (
          <div className="fixed bottom-4 right-4 z-40">
            <button
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={async () => {
                try {
                  const session = await createPortalSession(email);
                  window.location.href = session.url;
                } catch (error) {
                  console.error('Error creating portal session:', error);
                  alert('Failed to open subscription management. Please try again.');
                }
              }}
            >
              Manage subscription
            </button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default App;