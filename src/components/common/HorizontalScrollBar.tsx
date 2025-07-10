import React, { useEffect, useState, useRef } from 'react';

interface HorizontalScrollBarProps {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const HorizontalScrollBar: React.FC<HorizontalScrollBarProps> = ({ scrollContainerRef }) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const updateScrollBar = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const maxScroll = scrollWidth - clientWidth;
      
      // Only show scroll bar if content is scrollable
      setIsVisible(scrollWidth > clientWidth);
      
      if (maxScroll > 0) {
        const percentage = (scrollLeft / maxScroll) * 100;
        setScrollPercentage(percentage);
      }
    };

    // Initial check
    updateScrollBar();

    // Add scroll event listener
    scrollContainer.addEventListener('scroll', updateScrollBar);
    
    // Add resize observer to handle dynamic content changes
    const resizeObserver = new ResizeObserver(updateScrollBar);
    resizeObserver.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener('scroll', updateScrollBar);
      resizeObserver.disconnect();
    };
  }, [scrollContainerRef]);

  const handleScrollBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current || !scrollBarRef.current || e.target === thumbRef.current) return;
    
    const scrollBar = scrollBarRef.current;
    const rect = scrollBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    
    const scrollContainer = scrollContainerRef.current;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollContainer.scrollLeft = (percentage / 100) * maxScroll;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setScrollStartX(scrollContainerRef.current?.scrollLeft || 0);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current || !scrollBarRef.current) return;
      
      const deltaX = e.clientX - dragStartX;
      const scrollBar = scrollBarRef.current;
      const scrollContainer = scrollContainerRef.current;
      
      const scrollRatio = scrollContainer.scrollWidth / scrollBar.clientWidth;
      scrollContainer.scrollLeft = scrollStartX + (deltaX * scrollRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStartX, scrollStartX, scrollContainerRef]);

  if (!isVisible) return null;

  // Calculate thumb width based on viewport to content ratio
  const scrollContainer = scrollContainerRef.current;
  let thumbWidthPercentage = 20; // default minimum
  if (scrollContainer) {
    const viewportRatio = scrollContainer.clientWidth / scrollContainer.scrollWidth;
    thumbWidthPercentage = Math.max(20, Math.min(90, viewportRatio * 100));
  }

  // Calculate thumb position
  const maxThumbTravel = 100 - thumbWidthPercentage;
  const thumbPosition = (scrollPercentage / 100) * maxThumbTravel;

  return (
    <div className="w-full my-3 px-2">
      <div 
        ref={scrollBarRef}
        className="relative w-full h-2 bg-gray-100 rounded-full cursor-pointer shadow-inner"
        onClick={handleScrollBarClick}
      >
        {/* Track with subtle pattern */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
        </div>
        
        {/* Thumb */}
        <div 
          ref={thumbRef}
          className={`absolute top-1/2 -translate-y-1/2 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md transition-all ${isDragging ? '' : 'duration-150'} cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-y-110`}
          style={{ 
            width: `${thumbWidthPercentage}%`,
            left: `${thumbPosition}%`
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Inner highlight for depth */}
          <div className="absolute inset-x-1 top-1 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
      
      {/* Optional: Visual hint when at edges */}
      {scrollPercentage > 95 && (
        <div className="text-right text-xs text-gray-400 mt-1">End</div>
      )}
      {scrollPercentage < 5 && (
        <div className="text-left text-xs text-gray-400 mt-1">Start</div>
      )}
    </div>
  );
};

export default HorizontalScrollBar;