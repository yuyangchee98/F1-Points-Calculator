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
  const [dragThumbPosition, setDragThumbPosition] = useState<number | null>(null);

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
    const scrollContainer = scrollContainerRef.current;
    const rect = scrollBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    // Calculate thumb width based on viewport ratio
    const viewportRatio = scrollContainer.clientWidth / scrollContainer.scrollWidth;
    const thumbWidth = Math.max(0.2, Math.min(0.9, viewportRatio)) * scrollBar.clientWidth;
    
    // Center the thumb on the click position
    let targetThumbPosition = clickX - (thumbWidth / 2);
    
    // Clamp thumb position to valid range
    const maxThumbPosition = scrollBar.clientWidth - thumbWidth;
    targetThumbPosition = Math.max(0, Math.min(maxThumbPosition, targetThumbPosition));
    
    // Convert thumb position to scroll position
    const thumbPercentage = targetThumbPosition / maxThumbPosition;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollContainer.scrollLeft = thumbPercentage * maxScroll;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setScrollStartX(scrollContainerRef.current?.scrollLeft || 0);
    
    // Calculate initial thumb position
    if (scrollBarRef.current && scrollContainerRef.current) {
      const rect = scrollBarRef.current.getBoundingClientRect();
      const initialPosition = e.clientX - rect.left;
      setDragThumbPosition(initialPosition);
    }
    
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current || !scrollBarRef.current) return;
      
      const scrollBar = scrollBarRef.current;
      const scrollContainer = scrollContainerRef.current;
      const rect = scrollBar.getBoundingClientRect();
      
      // Calculate thumb width based on viewport ratio
      const viewportRatio = scrollContainer.clientWidth / scrollContainer.scrollWidth;
      const thumbWidthPercent = Math.max(20, Math.min(90, viewportRatio * 100));
      const thumbWidth = (thumbWidthPercent / 100) * scrollBar.clientWidth;
      
      // Update thumb position directly based on mouse position
      const mouseX = e.clientX - rect.left;
      const halfThumbWidth = thumbWidth / 2;
      let newThumbPosition = mouseX - halfThumbWidth;
      
      // Clamp thumb position
      const maxThumbPosition = scrollBar.clientWidth - thumbWidth;
      newThumbPosition = Math.max(0, Math.min(maxThumbPosition, newThumbPosition));
      setDragThumbPosition(newThumbPosition + halfThumbWidth);
      
      // Convert thumb position to scroll position
      const thumbPercentage = newThumbPosition / maxThumbPosition;
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      scrollContainer.scrollLeft = thumbPercentage * maxScroll;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragThumbPosition(null);
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
  let thumbPosition = (scrollPercentage / 100) * maxThumbTravel;
  
  // Override with drag position if dragging
  if (isDragging && dragThumbPosition !== null && scrollBarRef.current) {
    const thumbCenterPercent = (dragThumbPosition / scrollBarRef.current.clientWidth) * 100;
    thumbPosition = thumbCenterPercent - (thumbWidthPercentage / 2);
  }

  return (
    <div className="w-full py-2 px-4 hidden sm:block">
      <div className="bg-white rounded-md p-2 shadow-sm border border-gray-200">
        <div 
          ref={scrollBarRef}
          className="relative w-full h-2.5 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleScrollBarClick}
        >
          {/* Thumb */}
          <div 
            ref={thumbRef}
            className={`absolute top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow transition-all ${isDragging ? '' : 'duration-200'} cursor-grab active:cursor-grabbing hover:shadow-md`}
            style={{ 
              width: `${thumbWidthPercentage}%`,
              left: `${thumbPosition}%`
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
};

export default HorizontalScrollBar;