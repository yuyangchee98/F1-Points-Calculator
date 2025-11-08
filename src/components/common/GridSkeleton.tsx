import React from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { useSkeletonCounts } from '../../hooks/useSkeletonCounts';

const GridSkeleton: React.FC = () => {
  const { races } = useSkeletonCounts();
  const { isMobile, isTablet } = useWindowSize();

  const getMinColumnWidth = () => {
    if (isMobile) return '100px';
    if (isTablet) return '110px';
    return '120px';
  };

  const positionCount = 20;

  return (
    <div className="shadow-md rounded-lg border border-gray-200">
      <div className="bg-white border-b border-gray-200 px-4 py-3 rounded-t-lg">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-gray-200 rounded-md animate-pulse skeleton-shimmer"
            />
          ))}
        </div>
      </div>

      <div
        className="race-grid overflow-x-auto pb-4"
        style={{
          gridTemplateColumns: `80px repeat(${races}, minmax(${getMinColumnWidth()}, 1fr))`,
          gridAutoRows: 'minmax(40px, auto)',
        }}
      >
        <div className="position-header sticky left-0 z-10 flex flex-col items-center justify-center gap-0.5">
          <div className="h-3 w-12 bg-gray-600 rounded animate-pulse skeleton-shimmer" />
          <div className="h-2 w-16 bg-gray-600 rounded animate-pulse skeleton-shimmer mt-1" />
        </div>

        {Array.from({ length: races }).map((_, index) => (
          <div key={index} className="race-header">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-6 bg-gray-300 rounded animate-pulse skeleton-shimmer" />
              <div className="h-3 w-16 bg-gray-300 rounded animate-pulse skeleton-shimmer" />
            </div>
          </div>
        ))}

        {Array.from({ length: positionCount }).map((_, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div className={`contents ${rowIndex % 2 === 0 ? 'even-row' : ''}`}>
              <div className="position-cell sticky left-0 z-10">
                <div className="h-4 w-6 bg-gray-300 rounded mx-auto animate-pulse skeleton-shimmer" />
              </div>

              {Array.from({ length: races }).map((_, colIndex) => (
                <div key={colIndex} className="race-slot">
                  <div className="h-10 w-full bg-gray-100 rounded animate-pulse skeleton-shimmer" />
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GridSkeleton;
