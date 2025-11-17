import React from 'react';
import { useSkeletonCounts } from '../../hooks/useSkeletonCounts';

const DriverSelectionSkeleton: React.FC = () => {
  const { drivers } = useSkeletonCounts();
  // Skeleton starts collapsed on mobile to match actual component behavior
  const isExpanded = false;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
        <div className="sm:hidden h-12 w-40 bg-gray-200 rounded-md animate-pulse skeleton-shimmer" />
      </div>

      <div
        className={`
          grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4
          ${isExpanded ? 'max-h-[800px]' : 'max-h-0 sm:max-h-[800px]'}
          overflow-hidden transition-all duration-300 ease-in-out
          sm:overflow-visible sm:max-h-full
          p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200
        `}
      >
        {Array.from({ length: drivers }).map((_, index) => (
          <div
            key={index}
            className="driver-card flex items-center justify-between rounded-md overflow-hidden
                       bg-white border-l-4 border-gray-300 h-[60px] p-3"
          >
            <div className="flex flex-col flex-grow space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse skeleton-shimmer" />
            </div>

            <div className="h-6 w-10 bg-gray-300 rounded animate-pulse skeleton-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverSelectionSkeleton;
