import React from 'react';
import { useSkeletonCounts } from '../../hooks/useSkeletonCounts';

const DriverSelectionSkeleton: React.FC = () => {
  const { drivers } = useSkeletonCounts();
  const isExpanded = false;

  return (
    <div className="mb-6 relative overflow-hidden">
      {/* Single shimmer overlay instead of individual animations */}
      <div className="skeleton-shimmer-overlay" aria-hidden="true" />

      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="sm:hidden h-12 w-40 bg-gray-200 rounded-md" />
      </div>

      <div
        className={`
          grid gap-2
          ${isExpanded ? 'max-h-[800px]' : 'max-h-0 sm:max-h-[800px]'}
          overflow-hidden transition-all duration-300 ease-in-out
          sm:overflow-visible sm:max-h-full
          p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200
        `}
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}
      >
        {Array.from({ length: drivers }).map((_, index) => (
          <div
            key={index}
            className="driver-card flex items-center justify-between rounded-md overflow-hidden
                       bg-white border-l-4 border-gray-300 h-[52px] p-2"
          >
            <div className="flex flex-col flex-grow space-y-1.5">
              <div className="h-3.5 w-16 bg-gray-200 rounded" />
              <div className="h-2.5 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverSelectionSkeleton;
