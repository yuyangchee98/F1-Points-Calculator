import { useState, useEffect, useCallback, useRef } from 'react';
import { ContextMenuItem, ContextMenuPosition } from '../types/contextMenu';

interface UseContextMenuReturn {
  isOpen: boolean;
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  open: (event: React.MouseEvent | React.TouchEvent, menuItems: ContextMenuItem[]) => void;
  close: () => void;
}

export function useContextMenu(): UseContextMenuReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  // Track long press for mobile
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const open = useCallback((event: React.MouseEvent | React.TouchEvent, menuItems: ContextMenuItem[]) => {
    event.preventDefault();
    event.stopPropagation();

    let clientX: number;
    let clientY: number;

    // Handle both mouse and touch events
    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Smart positioning to prevent overflow
    const menuWidth = 200; // Approximate menu width
    const menuHeight = menuItems.length * 40; // Approximate item height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = clientX;
    let y = clientY;

    // Adjust if menu would overflow right edge
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }

    // Adjust if menu would overflow bottom edge
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }

    // Ensure minimum distance from edges
    x = Math.max(10, x);
    y = Math.max(10, y);

    setPosition({ x, y });
    setItems(menuItems);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setItems([]);

    // Clear long press timer if active
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => close();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    // Small delay to prevent immediate closing from the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);

  // Handle window resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => close();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, close]);

  return {
    isOpen,
    position,
    items,
    open,
    close,
  };
}

// Helper hook for handling long press on mobile devices
export function useLongPress(
  callback: (event: React.TouchEvent) => void,
  duration = 500
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };

    timerRef.current = setTimeout(() => {
      callback(event);
    }, duration);
  }, [callback, duration]);

  const cancel = useCallback((event: React.TouchEvent) => {
    // Check if finger moved significantly
    if (startPosRef.current && event.touches[0]) {
      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - startPosRef.current.x);
      const deltaY = Math.abs(touch.clientY - startPosRef.current.y);

      // If moved more than 10px, cancel long press
      if (deltaX > 10 || deltaY > 10) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  }, []);

  const end = useCallback((_event: React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  return {
    onTouchStart: start,
    onTouchMove: cancel,
    onTouchEnd: end,
  };
}
