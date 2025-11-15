import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { initializeUiState, setMobileView, toggleOfficialResults as toggleOfficialResultsUI } from './store/slices/uiSlice';
import { RootState, store } from './store';
import { calculateResults } from './store/slices/resultsSlice';
import { moveDriver, resetGrid, toggleOfficialResults } from './store/slices/gridSlice';
import { selectDriverTeamsMap } from './store/selectors/dataSelectors';
import { parseNaturalLanguage } from './api/naturalLanguage';
import { createCheckoutSession } from './api/subscription';
import { loadPrediction } from './api/predictions';
import useRaceResults from './hooks/useRaceResults';
import { useAutoSave } from './hooks/useAutoSave';
import { useDayAccess } from './hooks/useSubscription';
import { useUserEmail } from './hooks/useUserEmail';
import Layout from './components/layout/Layout';
import StandingsSidebar from './components/standings/StandingsSidebar';
import RaceGrid from './components/grid/RaceGrid';
import InfoBanner from './components/common/InfoBanner';
import IntroductionSection from './components/common/IntroductionSection';
import ToastContainer from './components/common/ToastContainer';
import HorizontalScrollBar from './components/common/HorizontalScrollBar';
import FAQ from './components/common/FAQ';
import SubscriptionModal from './components/common/SubscriptionModal';
import VersionHistory from './components/common/VersionHistory';
import ExportModal from './components/common/ExportModal';
import InputSections from './components/common/InputSections';
import RacendoPromo from './components/common/RacendoPromo';
import GridSkeleton from './components/common/GridSkeleton';
import DriverSelectionSkeleton from './components/common/DriverSelectionSkeleton';
import SmartInputSkeleton from './components/common/SmartInputSkeleton';
import DriverSelection from './components/drivers/DriverSelection';
import SeasonSelector from './components/common/SeasonSelector';
const SmartInputDemo = React.lazy(() => import('./components/common/SmartInputDemo'));
import { useAppDispatch } from './store';
import useWindowSize from './hooks/useWindowSize';
import { trackBuyCoffeeClick, trackFeedbackClick, trackSmartInputAction, trackSmartInputCommand, GA_EVENTS, trackEvent, trackVersionHistoryAction, trackExportAction } from './utils/analytics';
import { getActiveSeason, CURRENT_SEASON } from './utils/constants';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeSeason = getActiveSeason();
  const isHistoricalSeason = activeSeason < CURRENT_SEASON;
  useRaceResults();
  useAutoSave();
  const mobileView = useSelector((state: RootState) => state.ui.mobileView);
  const selectedPointsSystem = useSelector((state: RootState) => state.ui.selectedPointsSystem);
  const showOfficialResults = useSelector((state: RootState) => state.ui.showOfficialResults);
  const pastResults = useSelector((state: RootState) => state.seasonData.pastResults);
  const isLoading = useSelector((state: RootState) => state.seasonData.isLoading);
  const { fingerprint } = useSelector((state: RootState) => state.predictions);
  const { isMobile } = useWindowSize();
  const raceGridScrollRef = React.useRef<HTMLDivElement>(null);
  const { hasAccess, statusMessage } = useDayAccess();
  const { email, saveEmail } = useUserEmail();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [smartInputFirst, setSmartInputFirst] = useState(() => {
    return localStorage.getItem('f1_input_order') === 'smart-first';
  });

  const handleSwapInputs = () => {
    const newValue = !smartInputFirst;
    setSmartInputFirst(newValue);
    localStorage.setItem('f1_input_order', newValue ? 'smart-first' : 'drivers-first');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your predictions?')) {
      dispatch(resetGrid());
      dispatch(calculateResults());
      trackEvent(GA_EVENTS.GRID_ACTIONS.RESET_PREDICTIONS, 'Grid Actions');
    }
  };

  const handleToggleOfficialResults = () => {
    const newValue = !showOfficialResults;
    dispatch(toggleOfficialResultsUI(newValue));
    dispatch(toggleOfficialResults({ show: newValue, pastResults }));
    dispatch(calculateResults());
    trackEvent(
      GA_EVENTS.GRID_ACTIONS.TOGGLE_OFFICIAL,
      'Grid Actions',
      newValue ? 'show' : 'hide'
    );
  };

  const handleLoadVersion = async (version: string) => {
    if (!fingerprint) return;

    try {
      const prediction = await loadPrediction(fingerprint, version, activeSeason);
      if (prediction && prediction.grid) {
        dispatch(resetGrid());

        prediction.grid.forEach(pos => {
          if (pos.driverId && !pos.isOfficialResult) {
            dispatch(moveDriver({
              driverId: pos.driverId,
              toRaceId: pos.raceId,
              toPosition: pos.position
            }));
          }
        });

        dispatch(calculateResults());

        setShowHistory(false);
      }
    } catch (error) {
    }
  };


  useEffect(() => {
    dispatch(initializeUiState());

    dispatch(calculateResults());
  }, [dispatch]);

  useEffect(() => {
    dispatch(calculateResults());
  }, [dispatch, selectedPointsSystem]);

  useEffect(() => {
    if (!isMobile) {
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
              <div className="mb-3">
                {/* Row 1: Title */}
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-800 flex items-center mb-2 sm:mb-3">
                  <span className="bg-red-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 mr-2 sm:mr-3 rounded-md text-base sm:text-xl">F1</span>
                  <span>Points Calculator</span>
                </h1>

                {/* Row 2: Buttons + Season Selector + Racendo */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://buymeacoffee.com/yaang"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center py-1.5 px-2.5 sm:py-3 sm:px-6 bg-red-600 text-white font-bold rounded-md shadow-lg hover:bg-red-700 transition-colors duration-200 text-xs sm:text-base whitespace-nowrap"
                    onClick={trackBuyCoffeeClick}
                  >
                    <span className="mr-1 sm:mr-2">🔴</span>
                    <span className="sm:hidden">Support</span>
                    <span className="hidden sm:inline">Buy Chyuang a soft tyre</span>
                  </a>

                  <a
                    href="https://github.com/yuyangchee98/F1-Points-Calculator/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center py-1.5 px-2.5 sm:py-3 sm:px-6 bg-gray-700 text-white font-bold rounded-md shadow-lg hover:bg-gray-800 transition-colors duration-200 text-xs sm:text-base whitespace-nowrap"
                    onClick={trackFeedbackClick}
                  >
                    <span className="mr-1 sm:mr-2">💬</span>
                    <span className="sm:hidden">Feedback</span>
                    <span className="hidden sm:inline">Feature Requests / Report Bugs</span>
                  </a>

                  <SeasonSelector />

                  <RacendoPromo className="hidden sm:block ml-auto" />
                </div>
              </div>

              <div className={`mb-6 transition-all duration-300 ${statusMessage ? 'p-4 bg-blue-50 border border-blue-200 rounded-lg' : 'h-0 overflow-hidden'}`}>
                {statusMessage && (
                  <p className="text-center text-blue-700 font-medium">
                    {statusMessage}
                  </p>
                )}
              </div>

              <div className={`${(mobileView === 'grid' || !isMobile) ? 'block' : 'hidden'}`}>
                {isLoading ? (
                  <>
                    <SmartInputSkeleton />
                    <DriverSelectionSkeleton />
                    <GridSkeleton />
                  </>
                ) : (
                  <>
                {isHistoricalSeason ? (
                  <DriverSelection />
                ) : (
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
                              const state = store.getState();

                              const races = state.seasonData.races.map(race => ({
                                raceId: race.id,
                                completed: race.completed,
                                order: race.order,
                                isSprint: race.isSprint
                              }));

                              const predictions: Record<string, Record<string, string>> = {};
                              state.grid.positions.forEach(pos => {
                                if (pos.driverId && !pos.isOfficialResult) {
                                  if (!predictions[pos.raceId]) {
                                    predictions[pos.raceId] = {};
                                  }
                                  predictions[pos.raceId][pos.position.toString()] = pos.driverId;
                                }
                              });

                              const standings = {
                                drivers: state.results.driverStandings,
                                teams: state.results.teamStandings
                              };

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
                              trackSmartInputCommand(text, false);
                              if (err instanceof Error && err.message === 'ACCESS_REQUIRED') {
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
                        <div className="flex-1 mb-6 md:mb-0 text-center">
                          <h4 className="text-xl font-bold mb-3">Try Smart Input: <span className="font-normal text-sm text-gray-600">Type what you want to happen and watch the grid update instantly. <span className="text-xs text-gray-500">Watch demo ↓</span></span></h4>

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

                        <div className="hidden md:block w-px bg-gray-200 self-stretch mx-4"></div>

                        <div className="text-center">
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
                )}

                  <HorizontalScrollBar scrollContainerRef={raceGridScrollRef} />
                  <RaceGrid
                    scrollRef={raceGridScrollRef}
                    onReset={handleReset}
                    onToggleOfficialResults={handleToggleOfficialResults}
                    onOpenHistory={() => {
                      setShowHistory(true);
                      trackVersionHistoryAction('OPEN_HISTORY');
                    }}
                    onOpenExport={() => {
                      trackExportAction('OPEN_MODAL');
                      setShowExport(true);
                    }}
                    showOfficialResults={showOfficialResults}
                  />
                </>
              )}
              </div>
              
              <InfoBanner />

              <IntroductionSection />

              <FAQ />
            </div>
          }
        />

        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          email={email}
          onEmailChange={saveEmail}
        />

        {showHistory && (
          <VersionHistory
            onClose={() => setShowHistory(false)}
            onLoadVersion={handleLoadVersion}
          />
        )}

        <ExportModal
          isOpen={showExport}
          onClose={() => setShowExport(false)}
        />
      </div>
    </DndProvider>
  );
};

export default App;