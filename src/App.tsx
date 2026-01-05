import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import LazyDndProvider from './components/common/LazyDndProvider';
import { initializeUiState, setMobileView, toggleOfficialResults as toggleOfficialResultsUI } from './store/slices/uiSlice';
import { RootState } from './store';
import { moveDriver, resetGrid, toggleOfficialResults } from './store/slices/gridSlice';
import { fetchLockedPredictions, unlockPrediction } from './store/slices/lockedPredictionsSlice';
import { loadPrediction } from './api/predictions';
import useRaceResults from './hooks/useRaceResults';
import { useAutoSave } from './hooks/useAutoSave';
import { useDayAccess } from './hooks/useSubscription';
import { useUserEmail } from './hooks/useUserEmail';
import Layout from './components/layout/Layout';
import StandingsSidebar from './components/standings/StandingsSidebar';
import RaceGrid from './components/grid/RaceGrid';
import ToastContainer from './components/common/ToastContainer';
import HorizontalScrollBar from './components/common/HorizontalScrollBar';
import SubscriptionModal from './components/common/SubscriptionModal';
import VersionHistory from './components/common/VersionHistory';
import ExportModal from './components/common/ExportModal';
import DrawLineRacingPromo from './components/common/DrawLineRacingPromo';
import GridSkeleton from './components/common/GridSkeleton';
import DriverSelectionSkeleton from './components/common/DriverSelectionSkeleton';
import DriverSelection from './components/drivers/DriverSelection';
import SeasonSelector from './components/common/SeasonSelector';
import SmartBanner from './components/predictions/SmartBanner';
import LockConfirmationModal from './components/predictions/LockConfirmationModal';
import MyPredictionsPanel from './components/predictions/MyPredictionsPanel';
import { useAppDispatch } from './store';
import useWindowSize from './hooks/useWindowSize';
import { trackBuyCoffeeClick, trackFeedbackClick, GA_EVENTS, trackEvent, trackVersionHistoryAction, trackExportAction } from './utils/analytics';
import { CURRENT_SEASON } from './utils/constants';
import { Race } from './types';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { year } = useParams<{ year?: string }>();

  const activeSeason = year ? parseInt(year, 10) : CURRENT_SEASON;

  useEffect(() => {
    if (year) {
      (window as any).INITIAL_YEAR = parseInt(year, 10);
    } else {
      delete (window as any).INITIAL_YEAR;
    }
  }, [year]);
  useRaceResults(activeSeason);
  useAutoSave();
  const mobileView = useSelector((state: RootState) => state.ui.mobileView);
  const showOfficialResults = useSelector((state: RootState) => state.ui.showOfficialResults);
  const pastResults = useSelector((state: RootState) => state.seasonData.pastResults);
  const isLoading = useSelector((state: RootState) => state.seasonData.isLoading);
  const { fingerprint } = useSelector((state: RootState) => state.predictions);
  const { isMobile } = useWindowSize();
  const raceGridScrollRef = React.useRef<HTMLDivElement>(null);
  const { statusMessage } = useDayAccess();
  const { email, saveEmail } = useUserEmail();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [raceToLock, setRaceToLock] = useState<Race | null>(null);
  const races = useSelector((state: RootState) => state.seasonData.races);

  // Fetch locked predictions when fingerprint is available
  useEffect(() => {
    if (fingerprint) {
      dispatch(fetchLockedPredictions({ fingerprint, season: activeSeason }));
    }
  }, [fingerprint, activeSeason, dispatch]);

  const handleLockRace = (raceId: string) => {
    const race = races.find(r => r.id === raceId);
    if (race) {
      setRaceToLock(race);
    }
  };

  const handleUnlockRace = (raceId: string) => {
    if (!fingerprint) return;
    if (window.confirm('Are you sure you want to unlock this prediction?')) {
      dispatch(unlockPrediction({ fingerprint, season: activeSeason, raceId }));
    }
  };

  const handleViewLockedRace = (_raceId: string) => {
    setShowPredictions(true);
  };

  const handleSeeBreakdown = (_raceId: string) => {
    setShowPredictions(true);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your predictions?')) {
      dispatch(resetGrid());
      trackEvent(GA_EVENTS.GRID_ACTIONS.RESET_PREDICTIONS, 'Grid Actions');
    }
  };

  const handleToggleOfficialResults = () => {
    const newValue = !showOfficialResults;
    dispatch(toggleOfficialResultsUI(newValue));
    dispatch(toggleOfficialResults({ show: newValue, pastResults }));
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

        setShowHistory(false);
      }
    } catch (error) {
    }
  };


  useEffect(() => {
    dispatch(initializeUiState());
  }, [dispatch]);

  useEffect(() => {
    if (!isMobile) {
      if (mobileView !== 'grid') {
        dispatch(setMobileView('grid'));
      }
    }
  }, [isMobile, mobileView, dispatch]);

  return (
    <LazyDndProvider>
      <div className="app min-h-screen">
        <ToastContainer />

        <Layout
          sidebar={<StandingsSidebar />}
          content={
            <div className="px-4 py-6 max-w-5xl mx-auto">
              <div className="mb-3">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-800 flex items-center mb-2 sm:mb-3">
                  <span className="bg-red-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 mr-2 sm:mr-3 rounded-md text-base sm:text-xl">F1</span>
                  <span>Points Calculator</span>
                  <Link
                    to="/about"
                    className="ml-2 sm:ml-3 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 flex-shrink-0"
                    aria-label="About and FAQ"
                    title="About & FAQ"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </Link>
                </h1>

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

                  <DrawLineRacingPromo className="w-full sm:w-auto sm:ml-auto" />
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
                    <DriverSelectionSkeleton />
                    <div className="w-full py-2 px-4 hidden sm:block">
                      <div className="bg-white rounded-md p-2 shadow-sm border border-gray-200">
                        <div className="relative w-full h-2.5 bg-gray-200 rounded-full">
                          <div className="absolute top-0 h-full w-1/4 bg-gray-300 rounded-full" style={{ left: '0%' }} />
                        </div>
                      </div>
                    </div>
                    <GridSkeleton />
                  </>
                ) : (
                  <>
                {/* TODO: Smart Input feature disabled for now - just show DriverSelection */}
                <DriverSelection />

                  <SmartBanner
                    onLockClick={handleLockRace}
                    onViewClick={handleViewLockedRace}
                    onUnlockClick={handleUnlockRace}
                    onSeeBreakdownClick={handleSeeBreakdown}
                  />

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
                    onOpenPredictions={() => setShowPredictions(true)}
                    showOfficialResults={showOfficialResults}
                  />
                </>
              )}
              </div>
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

        {raceToLock && (
          <LockConfirmationModal
            race={raceToLock}
            onClose={() => setRaceToLock(null)}
            onSuccess={() => setRaceToLock(null)}
          />
        )}

        {showPredictions && (
          <MyPredictionsPanel
            onClose={() => setShowPredictions(false)}
            onLockRace={(raceId) => {
              setShowPredictions(false);
              handleLockRace(raceId);
            }}
          />
        )}

      </div>
    </LazyDndProvider>
  );
};

export default App;