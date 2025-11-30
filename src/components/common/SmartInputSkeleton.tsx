import React from 'react';

const SmartInputSkeleton: React.FC = () => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
      {/* Single shimmer overlay instead of individual animations */}
      <div className="skeleton-shimmer-overlay" aria-hidden="true" />

      <div className="bg-white rounded-md p-6 border border-gray-300 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:gap-8">
          {/* Left side: Title, description, input, mini grid */}
          <div className="flex-1 mb-6 md:mb-0 text-center">
            {/* Title: "Try Smart Input:" + description */}
            <div className="flex flex-wrap items-baseline justify-center gap-2 mb-3">
              <div className="h-7 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-72 bg-gray-200 rounded" />
            </div>
            {/* "Watch demo" link */}
            <div className="h-3 w-20 bg-gray-200 rounded mx-auto mb-4" />

            {/* Input field + mini grid */}
            <div className="w-[380px] max-w-full mx-auto">
              {/* Input field */}
              <div className="h-[38px] bg-gray-100 border-2 border-gray-200 rounded mb-4" />

              {/* Mini grid preview */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '70px repeat(3, 105px)' }}>
                {/* Header row */}
                <div className="h-8 bg-gray-300 rounded" />
                <div className="h-8 bg-gray-300 rounded" />
                <div className="h-8 bg-gray-300 rounded" />
                <div className="h-8 bg-gray-300 rounded" />
                {/* Data row */}
                <div className="h-12 bg-gray-100 rounded" />
                <div className="h-12 bg-white border border-gray-200 rounded" />
                <div className="h-12 bg-white border border-gray-200 rounded" />
                <div className="h-12 bg-white border border-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* Vertical divider (desktop only) */}
          <div className="hidden md:block w-px bg-gray-200 self-stretch mx-4"></div>

          {/* Right side: CTA button + price */}
          <div className="text-center">
            {/* Desktop view */}
            <div className="hidden md:block">
              <div className="h-12 w-32 bg-gray-300 rounded-md mx-auto" />
              <div className="h-3 w-48 bg-gray-200 rounded mx-auto mt-2" />
            </div>

            {/* Mobile view */}
            <div className="md:hidden">
              <div className="h-7 w-48 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-10 w-20 bg-gray-200 rounded mx-auto mb-1" />
              <div className="h-4 w-56 bg-gray-200 rounded mx-auto mb-4" />
              <div className="h-12 w-32 bg-gray-300 rounded-md mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartInputSkeleton;
