import React, { useEffect, useState, ReactNode } from 'react';
import type { DndProvider as DndProviderType } from 'react-dnd';
import type { BackendFactory } from 'dnd-core';

interface LazyDndProviderProps {
  children: ReactNode;
}

// Lazy load the DnD provider to reduce initial bundle size
const LazyDndProvider: React.FC<LazyDndProviderProps> = ({ children }) => {
  const [DndModule, setDndModule] = useState<{
    DndProvider: typeof DndProviderType;
    HTML5Backend: BackendFactory;
  } | null>(null);

  useEffect(() => {
    // Load DnD after initial render to avoid blocking
    const loadDnd = async () => {
      const [dndCore, backend] = await Promise.all([
        import('react-dnd'),
        import('react-dnd-html5-backend')
      ]);
      setDndModule({
        DndProvider: dndCore.DndProvider,
        HTML5Backend: backend.HTML5Backend
      });
    };
    loadDnd();
  }, []);

  // Wait for DnD module to load before rendering children
  // This prevents "Expected drag drop context" errors from useDrag/useDrop hooks
  if (!DndModule) {
    return null;
  }

  const { DndProvider, HTML5Backend } = DndModule;
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
};

export default LazyDndProvider;
