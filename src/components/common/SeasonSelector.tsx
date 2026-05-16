import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { CURRENT_SEASON, getGridPositions } from '../../utils/constants';
import { getSeasonRules } from '../../data/seasonRules';
import useWindowSize from '../../hooks/useWindowSize';

const COMPLETED_YEARS = [
  2025, 2024, 2023, 2022, 2021,
  2020, 2019, 2018, 2017, 2016,
  2015, 2014, 2013, 2012,
];

const getSeasonUrl = (year: number): string =>
  year === CURRENT_SEASON ? '/' : `/${year}`;

function formatStatusStrip(year: number): string {
  const rules = getSeasonRules(year);
  const cars = getGridPositions(year);
  const parts: string[] = [String(year)];
  if (rules.sprintFormat !== 'none') parts.push('SPRINT');
  if (rules.fastestLap) parts.push('FL');
  parts.push(`${cars} CARS`);
  return parts.join(' · ');
}

interface Props {
  activeSeason: number;
}

const SeasonSelector: React.FC<Props> = ({ activeSeason }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedYear, setFocusedYear] = useState<number>(activeSeason);

  // Mobile sheet animation lifecycle
  const [sheetMounted, setSheetMounted] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Drag-to-dismiss state
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef(0);
  const dragStartT = useRef(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const liveRef = useRef<HTMLAnchorElement>(null);
  const tilesRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isMobile } = useWindowSize();
  const races = useSelector((s: RootState) => s.seasonData.races);
  const totalRaces = races.length;
  const completedRaces = races.filter((r) => r.completed).length;
  const currentSeasonIsLive =
    totalRaces === 0 || completedRaces < totalRaces;
  const isOnLiveSeason = activeSeason === CURRENT_SEASON;
  const showLiveDotInTrigger = isOnLiveSeason && currentSeasonIsLive;

  // Click-outside (desktop only)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, isMobile]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Body scroll lock on mobile
  useEffect(() => {
    if (!(isOpen && isMobile)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, isMobile]);

  // Open/close lifecycle: mount + visibility transitions
  useEffect(() => {
    if (isOpen) {
      if (isMobile) setSheetMounted(true);
      const raf = requestAnimationFrame(() => {
        if (isMobile) setSheetVisible(true);
        else setPopoverVisible(true);
      });
      return () => {
        cancelAnimationFrame(raf);
        setSheetVisible(false);
        setPopoverVisible(false);
      };
    }
    setSheetVisible(false);
    setPopoverVisible(false);
  }, [isOpen, isMobile]);

  // Unmount sheet after exit animation
  useEffect(() => {
    if (sheetVisible || !sheetMounted) return;
    const t = window.setTimeout(() => setSheetMounted(false), 260);
    return () => window.clearTimeout(t);
  }, [sheetVisible, sheetMounted]);

  // Focus management on open / restore on close
  useEffect(() => {
    if (!isOpen) return;
    const triggerEl = triggerRef.current;
    setFocusedYear(activeSeason);
    const raf = requestAnimationFrame(() => {
      if (activeSeason === CURRENT_SEASON) {
        liveRef.current?.focus();
      } else {
        const idx = COMPLETED_YEARS.indexOf(activeSeason);
        (idx >= 0 ? tilesRef.current[idx] : tilesRef.current[0])?.focus();
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      triggerEl?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const cols = isMobile ? 4 : 5;
  const total = COMPLETED_YEARS.length;

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const currentIdx = COMPLETED_YEARS.indexOf(focusedYear);
    if (currentIdx < 0) return;
    let next = currentIdx;
    switch (e.key) {
      case 'ArrowRight':
        next = Math.min(currentIdx + 1, total - 1);
        break;
      case 'ArrowLeft':
        next = Math.max(currentIdx - 1, 0);
        break;
      case 'ArrowDown':
        next = Math.min(currentIdx + cols, total - 1);
        break;
      case 'ArrowUp':
        if (currentIdx < cols) {
          e.preventDefault();
          liveRef.current?.focus();
          return;
        }
        next = currentIdx - cols;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = total - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const nextYear = COMPLETED_YEARS[next];
    setFocusedYear(nextYear);
    tilesRef.current[next]?.focus();
  };

  const handleLiveKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(0, COMPLETED_YEARS.indexOf(focusedYear));
      const target = idx >= 0 && idx < total ? idx : 0;
      setFocusedYear(COMPLETED_YEARS[target]);
      tilesRef.current[target]?.focus();
    }
  };

  // Sheet drag handlers
  const onSheetTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
    dragStartT.current = Date.now();
  };
  const onSheetTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    setDragY(Math.max(0, dy));
  };
  const onSheetTouchEnd = () => {
    if (!isDragging) return;
    const dy = dragY;
    const dt = Date.now() - dragStartT.current;
    const velocity = dt > 0 ? dy / dt : 0;
    setIsDragging(false);
    if (dy > 80 || velocity > 0.5) {
      setIsOpen(false);
    }
    setDragY(0);
  };

  const sheetContents = (
    <SheetContents
      activeSeason={activeSeason}
      currentSeasonIsLive={currentSeasonIsLive}
      totalRaces={totalRaces}
      completedRaces={completedRaces}
      focusedYear={focusedYear}
      setFocusedYear={setFocusedYear}
      handleGridKeyDown={handleGridKeyDown}
      handleLiveKeyDown={handleLiveKeyDown}
      liveRef={liveRef}
      tilesRef={tilesRef}
      isMobile={isMobile}
    />
  );

  return (
    <div className="season-selector relative" ref={containerRef}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((o) => !o)}
        className={`flex items-center gap-1.5 h-7 sm:h-8 px-2 sm:px-2.5 text-xs sm:text-sm bg-white border rounded-md hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 transition-colors ${
          isOpen ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Choose season, currently ${activeSeason}`}
      >
        {showLiveDotInTrigger && (
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 motion-safe:animate-pulse"
            aria-hidden="true"
          />
        )}
        <span className="font-mono tabular-nums tracking-tight text-gray-900">
          {activeSeason}
        </span>
        <svg
          className={`h-3 w-3 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Desktop popover */}
      {isOpen && !isMobile && (
        <div
          role="dialog"
          aria-label="Choose season"
          className={`absolute z-30 right-0 top-full mt-1 w-[280px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden origin-top-right transition-all duration-150 ease-out motion-reduce:transition-none ${
            popoverVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-1'
          }`}
        >
          {sheetContents}
        </div>
      )}

      {/* Mobile bottom sheet */}
      {sheetMounted && isMobile && (
        <>
          <div
            className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
              sheetVisible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Choose season"
            aria-modal="true"
            className="fixed z-[70] left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden motion-reduce:transition-none"
            style={{
              transform: sheetVisible
                ? `translateY(${dragY}px)`
                : 'translateY(100%)',
              transition: isDragging
                ? 'none'
                : 'transform 240ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            <div
              className="py-2 touch-none cursor-grab active:cursor-grabbing"
              onTouchStart={onSheetTouchStart}
              onTouchMove={onSheetTouchMove}
              onTouchEnd={onSheetTouchEnd}
              onTouchCancel={onSheetTouchEnd}
            >
              <div
                className="mx-auto w-9 h-1 rounded-full bg-gray-300"
                aria-hidden="true"
              />
            </div>
            <div className="px-4 pb-2 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-gray-900">
                Choose season
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="w-11 h-11 -mr-3 flex items-center justify-center text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {sheetContents}
          </div>
        </>
      )}
    </div>
  );
};

interface SheetContentsProps {
  activeSeason: number;
  currentSeasonIsLive: boolean;
  totalRaces: number;
  completedRaces: number;
  focusedYear: number;
  setFocusedYear: (y: number) => void;
  handleGridKeyDown: (e: React.KeyboardEvent) => void;
  handleLiveKeyDown: (e: React.KeyboardEvent) => void;
  liveRef: React.RefObject<HTMLAnchorElement>;
  tilesRef: React.MutableRefObject<Array<HTMLAnchorElement | null>>;
  isMobile: boolean;
}

const SheetContents: React.FC<SheetContentsProps> = ({
  activeSeason,
  currentSeasonIsLive,
  totalRaces,
  completedRaces,
  focusedYear,
  setFocusedYear,
  handleGridKeyDown,
  handleLiveKeyDown,
  liveRef,
  tilesRef,
  isMobile,
}) => {
  const statusText = formatStatusStrip(focusedYear);
  const isLiveSelected = activeSeason === CURRENT_SEASON;

  return (
    <>
      {/* LIVE / current-season card */}
      <div className="relative">
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600"
          aria-hidden="true"
        />
        <a
          ref={liveRef}
          href={getSeasonUrl(CURRENT_SEASON)}
          onMouseEnter={() => setFocusedYear(CURRENT_SEASON)}
          onFocus={() => setFocusedYear(CURRENT_SEASON)}
          onKeyDown={handleLiveKeyDown}
          aria-current={isLiveSelected ? 'page' : undefined}
          className={`block pl-[14px] pr-3.5 py-3 hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-50 transition-colors ${
            isLiveSelected ? 'bg-gray-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            {currentSeasonIsLive ? (
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-red-600">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-red-600 motion-safe:animate-pulse"
                  aria-hidden="true"
                />
                LIVE
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                Current
              </span>
            )}
            {totalRaces > 0 && (
              <span className="font-mono tabular-nums text-xs text-gray-500">
                {completedRaces} / {totalRaces}
              </span>
            )}
          </div>
          <div
            className={`${
              isMobile ? 'text-[17px]' : 'text-[15px]'
            } font-semibold text-gray-900 mt-0.5`}
          >
            {CURRENT_SEASON} Season
          </div>
        </a>
      </div>

      <div className="h-px bg-gray-200" aria-hidden="true" />

      {/* Year grid */}
      <div className={isMobile ? 'px-4 pt-3 pb-3' : 'px-2.5 pt-2.5 pb-2.5'}>
        <div className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Completed
        </div>
        <div
          role="group"
          aria-label="Completed seasons"
          className={`grid ${
            isMobile ? 'grid-cols-4 gap-2' : 'grid-cols-5 gap-1'
          }`}
          onKeyDown={handleGridKeyDown}
        >
          {COMPLETED_YEARS.map((year, idx) => {
            const isSelected = year === activeSeason;
            const isFocusedTile = year === focusedYear;
            return (
              <a
                key={year}
                ref={(el) => {
                  tilesRef.current[idx] = el;
                }}
                href={getSeasonUrl(year)}
                tabIndex={isFocusedTile ? 0 : -1}
                aria-current={isSelected ? 'page' : undefined}
                onMouseEnter={() => setFocusedYear(year)}
                onFocus={() => setFocusedYear(year)}
                className={`relative ${
                  isMobile ? 'h-[52px] text-[17px]' : 'h-10 text-[15px]'
                } flex items-center justify-center rounded font-mono tabular-nums font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 transition-colors ${
                  isSelected
                    ? 'bg-gray-900 text-white border border-gray-900'
                    : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600 rounded-l"
                    aria-hidden="true"
                  />
                )}
                {year}
              </a>
            );
          })}
        </div>
      </div>

      {/* Status strip */}
      <div
        className={`border-t border-gray-200 bg-gray-50 ${
          isMobile ? 'px-4 py-2 text-[12px]' : 'px-3.5 py-1.5 text-[11px]'
        } font-mono tabular-nums text-gray-500 whitespace-nowrap overflow-hidden`}
        aria-live="polite"
      >
        {statusText}
      </div>
    </>
  );
};

export default SeasonSelector;
