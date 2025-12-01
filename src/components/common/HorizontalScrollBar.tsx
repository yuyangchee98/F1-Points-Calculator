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
  const [dragThumbPosition, setDragThumbPosition] = useState<number | null>(null);
  const [scrollBarWidth, setScrollBarWidth] = useState(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const scrollBar = scrollBarRef.current;
    if (!scrollContainer) return;

    const updateScrollBar = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const maxScroll = scrollWidth - clientWidth;

      setIsVisible(scrollWidth > clientWidth);

      if (maxScroll > 0) {
        const percentage = (scrollLeft / maxScroll) * 100;
        setScrollPercentage(percentage);
      }

      // Track scrollbar width for GPU-accelerated transforms
      if (scrollBar) {
        setScrollBarWidth(scrollBar.clientWidth);
      }
    };

    updateScrollBar();

    scrollContainer.addEventListener('scroll', updateScrollBar);

    const resizeObserver = new ResizeObserver(updateScrollBar);
    resizeObserver.observe(scrollContainer);
    if (scrollBar) {
      resizeObserver.observe(scrollBar);
    }

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

    const viewportRatio = scrollContainer.clientWidth / scrollContainer.scrollWidth;
    const thumbWidth = Math.max(0.2, Math.min(0.9, viewportRatio)) * scrollBar.clientWidth;

    let targetThumbPosition = clickX - (thumbWidth / 2);

    const maxThumbPosition = scrollBar.clientWidth - thumbWidth;
    targetThumbPosition = Math.max(0, Math.min(maxThumbPosition, targetThumbPosition));

    const thumbPercentage = targetThumbPosition / maxThumbPosition;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollContainer.scrollLeft = thumbPercentage * maxScroll;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);

    if (scrollBarRef.current) {
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

      const viewportRatio = scrollContainer.clientWidth / scrollContainer.scrollWidth;
      const thumbWidthPercent = Math.max(20, Math.min(90, viewportRatio * 100));
      const thumbWidth = (thumbWidthPercent / 100) * scrollBar.clientWidth;

      const mouseX = e.clientX - rect.left;
      const halfThumbWidth = thumbWidth / 2;
      let newThumbPosition = mouseX - halfThumbWidth;

      const maxThumbPosition = scrollBar.clientWidth - thumbWidth;
      newThumbPosition = Math.max(0, Math.min(maxThumbPosition, newThumbPosition));
      setDragThumbPosition(newThumbPosition + halfThumbWidth);

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
  }, [isDragging, scrollContainerRef]);

  const scrollContainer = scrollContainerRef.current;
  let thumbWidthPercentage = 20;
  if (scrollContainer) {
    const viewportRatio = scrollContainer.clientWidth / scrollContainer.scrollWidth;
    thumbWidthPercentage = Math.max(20, Math.min(90, viewportRatio * 100));
  }

  const maxThumbTravel = 100 - thumbWidthPercentage;
  let thumbPosition = (scrollPercentage / 100) * maxThumbTravel;

  if (isDragging && dragThumbPosition !== null && scrollBarWidth > 0) {
    const thumbCenterPercent = (dragThumbPosition / scrollBarWidth) * 100;
    thumbPosition = thumbCenterPercent - (thumbWidthPercentage / 2);
  }

  // Calculate pixel offset for GPU-accelerated transform
  const thumbWidthPx = (thumbWidthPercentage / 100) * scrollBarWidth;
  const thumbOffsetPx = (thumbPosition / 100) * scrollBarWidth;

  return (
    <div className={`w-full py-2 px-4 hidden sm:block transition-opacity duration-200 ${!isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="bg-white rounded-md p-2 shadow-sm border border-gray-200">
        <div
          ref={scrollBarRef}
          className="relative w-full h-2.5 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleScrollBarClick}
        >
          <div
            ref={thumbRef}
            className={`absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow transition-transform ${isDragging ? '' : 'duration-200'} cursor-grab active:cursor-grabbing hover:shadow-md will-change-transform`}
            style={{
              width: `${thumbWidthPercentage}%`,
              transform: `translateX(${thumbOffsetPx}px)`
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
};

export default HorizontalScrollBar;