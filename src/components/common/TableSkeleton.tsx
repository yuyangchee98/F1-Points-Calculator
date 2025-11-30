import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  type?: 'driver' | 'team';
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 20, 
  type = 'driver' 
}) => {
  return (
    <div className="overflow-hidden rounded-lg relative">
      {/* Single shimmer overlay instead of individual animations */}
      <div className="skeleton-shimmer-overlay" aria-hidden="true" />

      <table className="w-full min-w-full table-auto">
        <thead>
          <tr className="text-gray-300 border-gray-600">
            <th className="w-12 text-left py-2 font-normal text-sm">Pos</th>
            <th className="text-left py-2 font-normal text-sm">
              {type === 'driver' ? 'Driver' : 'Constructor'}
            </th>
            <th className="text-right py-2 pr-2 font-normal text-sm">Points</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              <td className="py-3 px-2 text-center">
                <div className="h-5 w-8 bg-gray-200 rounded mx-auto"></div>
              </td>
              <td className="py-3">
                <div className="flex items-center">
                  <div className="h-5 w-3 bg-gray-200 rounded-sm mr-2"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                </div>
              </td>
              <td className="py-3 px-2 text-right">
                <div className="h-5 w-16 bg-gray-200 rounded ml-auto"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;