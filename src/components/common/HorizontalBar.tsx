import React from 'react';

const HorizontalBar: React.FC = () => {
  return (
    <div className="w-full h-2 bg-gray-200 my-4">
      <div className="h-full bg-gradient-to-r from-red-500 to-red-600 w-full"></div>
    </div>
  );
};

export default HorizontalBar;