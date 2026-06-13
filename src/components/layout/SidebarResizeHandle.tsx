import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { setSidebarWidth, SIDEBAR_MIN, SIDEBAR_MAX, SIDEBAR_DEFAULT } from '../../store/slices/uiSlice';

interface SidebarResizeHandleProps {
  asideRef: React.RefObject<HTMLElement | null>;
}

const clamp = (px: number) => Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, px));

/**
 * Drag-to-resize strip on the sidebar's right edge (desktop only).
 *
 * During the drag we mutate `aside.style.width` directly and keep only an
 * `isResizing` flag in React state — dispatching to Redux on every mousemove
 * would re-render the whole standings subtree (and thrash chart.js) 60×/sec.
 * The committed width is dispatched once, on mouseup.
 */
const SidebarResizeHandle: React.FC<SidebarResizeHandleProps> = ({ asideRef }) => {
  const dispatch = useAppDispatch();
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!asideRef.current) return;
    startXRef.current = e.clientX;
    startWidthRef.current = asideRef.current.offsetWidth;
    setIsResizing(true);
    e.preventDefault();
  };

  const handleDoubleClick = () => {
    if (asideRef.current) {
      asideRef.current.style.width = `${SIDEBAR_DEFAULT}px`;
    }
    dispatch(setSidebarWidth(SIDEBAR_DEFAULT));
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!asideRef.current) return;
      const next = clamp(startWidthRef.current + (e.clientX - startXRef.current));
      asideRef.current.style.width = `${next}px`;
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (asideRef.current) {
        dispatch(setSidebarWidth(asideRef.current.offsetWidth));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, asideRef, dispatch]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar (double-click to reset)"
      title="Drag to resize · double-click to reset"
      className={`hidden sm:block absolute top-0 right-0 h-full w-1.5 cursor-col-resize z-30 transition-colors ${
        isResizing ? 'bg-interactive/40' : 'hover:bg-interactive/30'
      }`}
    />
  );
};

export default SidebarResizeHandle;
