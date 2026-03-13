import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type RootState, useAppDispatch } from '../store';
import { MerchGridProvider, useGridContext } from '../contexts/GridContext';
import { fetchSeasonData } from '../store/slices/seasonDataSlice';
import { getBrowserFingerprint } from '../utils/fingerprint';
import { CURRENT_SEASON } from '../utils/constants';
import type { UserIdentifier } from '../api/predictions';
import { getMerchPosterPreview, getMockupPreview, createMerchCheckout } from '../api/merch';
import RaceGrid from '../components/grid/RaceGrid';
import LazyDndProvider from '../components/common/LazyDndProvider';
import DriverSelection from '../components/drivers/DriverSelection';
import ToastContainer, { toastService } from '../components/common/ToastContainer';

const POSTER_PRICE = '$24.99';

const MerchInner: React.FC = () => {
  const status = new URLSearchParams(window.location.search).get('status');
  const season = CURRENT_SEASON;

  const { positions } = useGridContext();
  const { user } = useSelector((state: RootState) => state.auth);
  const isLoaded = useSelector((state: RootState) => state.seasonData.isLoaded);

  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [mockupLoading, setMockupLoading] = useState(false);
  const [, setMockupError] = useState<string | null>(null);
  const [mockupGridHash, setMockupGridHash] = useState<string | null>(null);
  const [showMockupInModal, setShowMockupInModal] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevBlobUrlRef = useRef<string | null>(null);

  // Init fingerprint for checkout (no auto-save needed)
  useEffect(() => {
    getBrowserFingerprint().then(setFingerprint);
  }, []);

  function getIdentifier(): UserIdentifier | null {
    if (user?.id) return { userId: user.id };
    if (fingerprint) return { fingerprint };
    return null;
  }

  // Get non-empty grid entries for preview/checkout
  const gridEntries = useMemo(() => {
    return positions
      .filter(p => p.driverId && !p.isOfficialResult)
      .map(p => ({
        raceId: p.raceId,
        position: p.position,
        driverId: p.driverId!,
      }));
  }, [positions]);

  // Hash of current grid for mockup cache invalidation
  const gridHash = useMemo(
    () => JSON.stringify(gridEntries.map(e => `${e.raceId}:${e.position}:${e.driverId}`).sort()),
    [gridEntries]
  );

  // Invalidate cached mockup when predictions change
  useEffect(() => {
    if (mockupGridHash && gridHash !== mockupGridHash) {
      setMockupUrl(null);
      setMockupGridHash(null);
      setMockupError(null);
      setShowMockupInModal(false);
    }
  }, [gridHash, mockupGridHash]);

  // Debounced poster preview
  const fetchPreview = useCallback(async () => {
    if (gridEntries.length === 0) {
      setPreviewUrl(null);
      return;
    }

    setPreviewLoading(true);
    try {
      const blob = await getMerchPosterPreview(gridEntries, season);
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      prevBlobUrlRef.current = url;
      setPreviewUrl(url);
    } catch {
      // Preview generation failed silently
    } finally {
      setPreviewLoading(false);
    }
  }, [gridEntries, season]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(fetchPreview, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchPreview]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) URL.revokeObjectURL(prevBlobUrlRef.current);
    };
  }, []);

  // Close expanded preview on Escape
  useEffect(() => {
    if (!previewExpanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewExpanded(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [previewExpanded]);

  const handleBuyPoster = async () => {
    const identifier = getIdentifier();
    if (!identifier) {
      toastService.addToast('Please wait for initialization to complete', 'warning', 3000);
      return;
    }
    if (gridEntries.length === 0) {
      toastService.addToast('Fill in some predictions first!', 'warning', 3000);
      return;
    }

    setCheckoutLoading(true);
    try {
      const { url } = await createMerchCheckout(identifier, season, gridEntries);
      window.location.href = url;
    } catch {
      toastService.addToast('Failed to start checkout. Please try again.', 'warning', 3000, '#ef4444');
      setCheckoutLoading(false);
    }
  };

  const handleGenerateMockup = async () => {
    // If we already have a cached mockup for this grid, just open modal
    if (mockupUrl && mockupGridHash === gridHash) {
      setShowMockupInModal(true);
      setPreviewExpanded(true);
      return;
    }

    setMockupLoading(true);
    setMockupError(null);
    try {
      const { mockupUrl: url } = await getMockupPreview(gridEntries, season);
      setMockupUrl(url);
      setMockupGridHash(gridHash);
      setShowMockupInModal(true);
      setPreviewExpanded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mockup generation failed';
      setMockupError(message);
      toastService.addToast(message, 'warning', 5000, '#ef4444');
    } finally {
      setMockupLoading(false);
    }
  };

  return (
    <>
      {/* Status messages */}
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            Order confirmed! Your poster is being generated and will be shipped soon.
          </p>
        </div>
      )}
      {status === 'cancelled' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            Checkout was cancelled. You can try again whenever you're ready.
          </p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="lg:flex lg:gap-8">
        {/* Left: Prediction Grid */}
        <div className="lg:flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 lg:mb-0">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Your {season} Predictions
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop drivers to fill in your season predictions. The poster will update live as you make changes.
            </p>
            <LazyDndProvider>
              <DriverSelection />
              <RaceGrid
                toolbar={null}
                onReset={() => {}}
                onToggleOfficialResults={() => {}}
                onOpenHistory={() => {}}
                onOpenExport={() => {}}
                showOfficialResults={false}
                hasConsensusAccess={false}
                onOpenSubscriptionModal={() => {}}
              />
            </LazyDndProvider>
          </div>
        </div>

        {/* Right: Poster Preview + Buy */}
        <div className="lg:w-[400px] lg:flex-shrink-0">
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Poster Preview
              </h2>

              {/* Preview image */}
              <div
                className={`relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden mb-4 border border-gray-200 ${previewUrl ? 'cursor-pointer group' : ''}`}
                onClick={() => previewUrl && setPreviewExpanded(true)}
              >
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <span className="text-sm text-gray-500">Generating preview...</span>
                    </div>
                  </div>
                )}
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Poster preview"
                      className="w-full h-full object-contain"
                    />
                    {/* Expand hint overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        Click to enlarge
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Fill in predictions to see your poster</p>
                    </div>
                  </div>
                )}
              </div>

              {/* See on poster button */}
              {previewUrl && (
                <button
                  onClick={handleGenerateMockup}
                  disabled={mockupLoading}
                  className={`w-full mb-4 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    mockupLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : mockupUrl && mockupGridHash === gridHash
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {mockupLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      Generating realistic preview... (10-30s)
                    </>
                  ) : mockupUrl && mockupGridHash === gridHash ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      View realistic mockup
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      See on poster
                    </>
                  )}
                </button>
              )}

              {/* Product info */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900">{POSTER_PRICE}</span>
                  <span className="text-sm text-gray-500">18" x 24" premium matte</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Your full season predictions printed on a high-quality poster.
                  Free shipping included.
                </p>
              </div>

              {/* Buy button */}
              <button
                onClick={handleBuyPoster}
                disabled={checkoutLoading || gridEntries.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                  checkoutLoading || gridEntries.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                }`}
              >
                {checkoutLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Redirecting to checkout...
                  </span>
                ) : (
                  `Buy Poster - ${POSTER_PRICE}`
                )}
              </button>

              {gridEntries.length === 0 && isLoaded && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Add predictions to enable purchase
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen preview modal */}
      {previewExpanded && previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 cursor-pointer"
          onClick={() => { setPreviewExpanded(false); setShowMockupInModal(false); }}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            onClick={() => { setPreviewExpanded(false); setShowMockupInModal(false); }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Flat / Realistic toggle */}
          {mockupUrl && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex bg-white/10 backdrop-blur-sm rounded-full p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !showMockupInModal ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setShowMockupInModal(false)}
              >
                Flat design
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  showMockupInModal ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'
                }`}
                onClick={() => setShowMockupInModal(true)}
              >
                Realistic mockup
              </button>
            </div>
          )}

          {/* Image - flat or mockup */}
          <img
            src={showMockupInModal && mockupUrl ? mockupUrl : previewUrl}
            alt={showMockupInModal ? 'Realistic poster mockup' : 'Poster preview (full size)'}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

const Merch: React.FC = () => {
  const dispatch = useAppDispatch();
  const isLoading = useSelector((state: RootState) => state.seasonData.isLoading);
  const isLoaded = useSelector((state: RootState) => state.seasonData.isLoaded);

  useEffect(() => {
    dispatch(fetchSeasonData(CURRENT_SEASON));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back link */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Calculator
          </a>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 flex items-center flex-wrap">
          <span className="bg-red-600 text-white px-3 py-1 mr-3 rounded-md">F1</span>
          <span>Season Prediction Poster</span>
        </h1>

        {isLoading || !isLoaded ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <MerchGridProvider>
            <MerchInner />
          </MerchGridProvider>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default Merch;
