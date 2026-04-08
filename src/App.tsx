import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import LazyDndProvider from './components/common/LazyDndProvider';
import { initializeUiState, setMobileView, toggleOfficialResults as toggleOfficialResultsUI } from './store/slices/uiSlice';
import type { RootState } from './store';
import { moveDriver, resetGrid, toggleOfficialResults } from './store/slices/gridSlice';
import { fetchLockedPredictions } from './store/slices/lockedPredictionsSlice';
import { loadPrediction, type UserIdentifier } from './api/predictions';
import useRaceResults from './hooks/useRaceResults';
import { useAutoSave } from './hooks/useAutoSave';
import { useDayAccess } from './hooks/useSubscription';
import { useUserEmail } from './hooks/useUserEmail';
import Layout from './components/layout/Layout';
import StandingsSidebar from './components/standings/StandingsSidebar';
import RaceGrid from './components/grid/RaceGrid';
import MobileRaceCardView from './components/grid/MobileRaceCardView';
import ToastContainer from './components/common/ToastContainer';
import HorizontalScrollBar from './components/common/HorizontalScrollBar';
import SubscriptionModal from './components/common/SubscriptionModal';
import VersionHistory from './components/common/VersionHistory';
import ExportModal from './components/common/ExportModal';
import DrawLineRacingPromo from './components/common/DrawLineRacingPromo';
import HeaderMenu from './components/common/HeaderMenu';
import CalculatorDropdown from './components/common/CalculatorDropdown';
import GridSkeleton from './components/common/GridSkeleton';
import DriverSelectionSkeleton from './components/common/DriverSelectionSkeleton';
import DriverSelection from './components/drivers/DriverSelection';
import SeasonSelector from './components/common/SeasonSelector';
import UserMenu from './components/auth/UserMenu';
import { SandboxGridProvider } from './contexts/GridContext';
import { useAppDispatch } from './store';
import useWindowSize from './hooks/useWindowSize';
import { GA_EVENTS, trackEvent, trackVersionHistoryAction, trackExportAction } from './utils/analytics';
import { openCustomerPortal } from './api/subscription';
import { CURRENT_SEASON } from './utils/constants';


const App: React.FC<{ year?: string }> = ({ year }) => {
  const dispatch = useAppDispatch();

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
  const { user } = useSelector((state: RootState) => state.auth);
  const { isMobile } = useWindowSize();

  // Get identifier - prefer userId if logged in, fallback to fingerprint
  const getIdentifier = (): UserIdentifier | null => {
    if (user?.id) return { userId: user.id };
    if (fingerprint) return { fingerprint };
    return null;
  };
  const raceGridScrollRef = React.useRef<HTMLDivElement>(null);
  const { hasAccess: hasConsensusAccess, tier: consensusTier, expiresAt: consensusExpiresAt, statusMessage } = useDayAccess();
  const { email, saveEmail } = useUserEmail();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  // Fetch locked predictions when identifier is available
  useEffect(() => {
    const identifier = getIdentifier();
    if (identifier) {
      dispatch(fetchLockedPredictions({ identifier, season: activeSeason }));
    }
  }, [fingerprint, user, activeSeason, dispatch]);

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
    const identifier = getIdentifier();
    if (!identifier) return;

    try {
      const prediction = await loadPrediction(identifier, version, activeSeason);
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
      <div className="app">
        <ToastContainer />

        <Layout
          sidebar={<StandingsSidebar />}
          content={
            <div className="flex-1 min-h-0 flex flex-col px-2 sm:px-3 lg:px-4 pt-2 sm:pt-3 lg:pt-4 pb-16 sm:pb-0 max-w-5xl mx-auto w-full">
              <div className="mb-2 shrink-0">
                {/* Single header row — responsive, never wraps */}
                <div className="flex items-center gap-1 lg:gap-2 flex-nowrap">
                  <h1 className="text-sm sm:text-base md:text-lg lg:text-2xl font-bold text-gray-800 flex items-center min-w-0 shrink">
                    <CalculatorDropdown />
                    <span className="truncate">Points Calculator</span>
                  </h1>

                  {/* Right-side controls — push to right with ml-auto */}
                  <div className="flex items-center gap-1 lg:gap-2 ml-auto shrink-0">
                    <SeasonSelector activeSeason={activeSeason} />

                    {/* Promo only visible at lg+ where there's room */}
                    <div className="hidden lg:inline-flex">
                      <DrawLineRacingPromo />
                    </div>

                    <HeaderMenu
                      hasConsensusAccess={hasConsensusAccess}
                      onOpenSubscription={async () => {
                        if (hasConsensusAccess && email) {
                          try {
                            await openCustomerPortal(email);
                          } catch (error) {
                            alert('Failed to open subscription management.');
                          }
                        } else {
                          setShowSubscriptionModal(true);
                        }
                      }}
                    />

                    <UserMenu />
                  </div>
                </div>
              </div>

              <div className={`mb-2 shrink-0 transition-all duration-300 ${statusMessage ? 'p-4 bg-blue-50 border border-blue-200 rounded-lg' : 'h-0 overflow-hidden'}`}>
                {statusMessage && (
                  <p className="text-center text-blue-700 font-medium">
                    {statusMessage}
                  </p>
                )}
              </div>

              <div className={`flex-1 min-h-0 flex flex-col ${(mobileView === 'grid' || !isMobile) ? '' : 'hidden'}`}>
                {isLoading ? (
                  <>
                    <div className="shrink-0"><DriverSelectionSkeleton /></div>
                    <div className="shrink-0 w-full py-2 px-4 hidden sm:block">
                      <div className="bg-white rounded-md p-2 shadow-sm border border-gray-200">
                        <div className="relative w-full h-2.5 bg-gray-200 rounded-full">
                          <div className="absolute top-0 h-full w-1/4 bg-gray-300 rounded-full" style={{ left: '0%' }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden"><GridSkeleton /></div>
                  </>
                ) : (
                  <>
                <SandboxGridProvider>
                {!isMobile && <div className="shrink-0"><DriverSelection /></div>}

                  {isMobile ? (
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <MobileRaceCardView
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
                        hasConsensusAccess={hasConsensusAccess}
                        onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="shrink-0"><HorizontalScrollBar scrollContainerRef={raceGridScrollRef} /></div>
                      <div className="flex-1 min-h-0 overflow-hidden">
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
                          hasConsensusAccess={hasConsensusAccess}
                          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
                        />
                      </div>
                    </>
                  )}
                </SandboxGridProvider>
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
          hasAccess={hasConsensusAccess}
          currentTier={consensusTier}
          expiresAt={consensusExpiresAt}
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
    </LazyDndProvider>
  );
};

export default App;