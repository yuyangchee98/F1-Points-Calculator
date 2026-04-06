import { useRef, useCallback } from 'react';

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export default function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isVertical = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isVertical.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (isVertical.current) return;
    const deltaX = Math.abs(e.touches[0].clientX - startX.current);
    const deltaY = Math.abs(e.touches[0].clientY - startY.current);
    // Once we determine direction, lock it
    if (deltaX > 10 || deltaY > 10) {
      if (deltaY > deltaX) {
        isVertical.current = true;
      }
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isVertical.current) return;
    const deltaX = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
