import React from 'react';

const SmartInputSkeleton: React.FC = () => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
      {/* Single shimmer overlay instead of individual animations */}
      <div className="skeleton-shimmer-overlay" aria-hidden="true" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-64 bg-gray-200 rounded mt-2 sm:mt-0" />
      </div>

      <div className="bg-white rounded-md p-6 border border-gray-300 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:gap-8">
          <div className="flex-1 mb-6 md:mb-0 text-center">
            <div className="h-6 w-64 bg-gray-200 rounded mx-auto mb-3" />
            <div className="h-4 w-80 bg-gray-200 rounded mx-auto mb-2" />

            <div className="w-[380px] max-w-full mx-auto">
              <div className="h-[38px] bg-gray-200 rounded mb-4" />
              <div className="h-[150px] bg-gray-200 rounded" />
            </div>
          </div>

          <div className="hidden md:block w-px bg-gray-200 self-stretch mx-4"></div>

          <div className="text-center">
            <div className="hidden md:block">
              <div className="h-12 w-32 bg-gray-200 rounded-md mx-auto" />
              <div className="h-3 w-48 bg-gray-200 rounded mx-auto mt-2" />
            </div>

            <div className="md:hidden">
              <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-10 w-24 bg-gray-200 rounded mx-auto mb-1" />
              <div className="h-4 w-56 bg-gray-200 rounded mx-auto mb-4" />
              <div className="h-12 w-32 bg-gray-200 rounded-md mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartInputSkeleton;
