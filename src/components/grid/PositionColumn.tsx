import React from 'react';

interface PositionColumnProps {
  position: number;
}

const PositionColumn: React.FC<PositionColumnProps> = ({ position }) => {
  return (
    <div 
      className="position sticky left-0 z-10 flex items-center justify-center" 
      data-position={position}
    >
      {position}
    </div>
  );
};

export default PositionColumn;