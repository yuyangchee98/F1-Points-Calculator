import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ContextMenuItem, ContextMenuPosition } from '../../types/contextMenu';

interface ContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  onClose: () => void;
}

const SearchableSubmenu: React.FC<{
  items: ContextMenuItem[];
  position: ContextMenuPosition;
  parentRect: DOMRect | null;
  onSelect: (item: ContextMenuItem) => void;
}> = ({ items, position, parentRect, onSelect }) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay so the input doesn't steal focus from the menu open animation
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // Compute responsive position
  const [pos, setPos] = useState(position);
  useEffect(() => {
    if (!panelRef.current || !parentRect) return;
    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;

    if (isMobile) {
      // Center on mobile
      setPos({
        x: Math.max(8, (vw - Math.min(rect.width, vw - 16)) / 2),
        y: Math.max(8, Math.min(position.y, vh - rect.height - 8)),
      });
    } else {
      // Position to the right of parent, or left if no room
      let x = parentRect.right + 5;
      if (x + rect.width > vw - 8) {
        x = parentRect.left - rect.width - 5;
      }
      x = Math.max(8, x);

      let y = parentRect.top;
      if (y + rect.height > vh - 8) {
        y = vh - rect.height - 8;
      }
      y = Math.max(8, y);

      setPos({ x, y });
    }
  }, [parentRect, position]);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? items.filter(item => !item.divider && item.label.toLowerCase().includes(query))
    : items;

  return (
    <div
      ref={panelRef}
      className="context-menu context-submenu fixed z-[51] animate-fadeInScale"
      style={{ left: pos.x, top: pos.y }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-[240px] sm:w-[260px] max-w-[calc(100vw-16px)] flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-2 border-b border-gray-100">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver..."
            className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 bg-gray-50"
          />
        </div>

        {/* Driver list */}
        <div className="overflow-y-auto overscroll-contain max-h-[min(320px,50vh)]">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No drivers found
            </div>
          ) : (
            filtered.map((item) => {
              if (item.divider) {
                return <div key={item.id} className="my-0.5 border-t border-gray-100" />;
              }

              // item.icon is team color hex string for driver items
              const isColorIcon = item.icon && item.icon.startsWith('#');

              return (
                <button
                  key={item.id}
                  className="w-full text-left px-3 py-2 text-sm transition-colors duration-100 flex items-center gap-2.5 hover:bg-gray-50 active:bg-gray-100"
                  onClick={() => onSelect(item)}
                  role="menuitem"
                >
                  {isColorIcon ? (
                    <span
                      className="w-1 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: item.icon }}
                    />
                  ) : item.icon ? (
                    <span className="text-base shrink-0">{item.icon}</span>
                  ) : null}
                  <span className="flex-1 min-w-0 font-medium text-gray-800 truncate">
                    {item.label}
                  </span>
                  {item.groupLabel && (
                    <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                      {item.groupLabel}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, position, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [submenuParentRect, setSubmenuParentRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // If a searchable submenu is open, let it handle its own keyboard events
      if (openSubmenuId) {
        const openItem = items.find(i => i.id === openSubmenuId);
        if (openItem?.searchable) {
          if (event.key === 'Escape') {
            event.preventDefault();
            setOpenSubmenuId(null);
          }
          return;
        }
      }

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          let nextIndex = focusedIndex + 1;
          while (nextIndex < items.length && (items[nextIndex].divider || items[nextIndex].disabled)) {
            nextIndex++;
          }
          if (nextIndex < items.length) {
            setFocusedIndex(nextIndex);
            setOpenSubmenuId(null);
          }
          break;
        }

        case 'ArrowUp': {
          event.preventDefault();
          let prevIndex = focusedIndex - 1;
          while (prevIndex >= 0 && (items[prevIndex].divider || items[prevIndex].disabled)) {
            prevIndex--;
          }
          if (prevIndex >= 0) {
            setFocusedIndex(prevIndex);
            setOpenSubmenuId(null);
          }
          break;
        }

        case 'ArrowRight': {
          event.preventDefault();
          const currentItem = items[focusedIndex];
          if (currentItem?.submenu && currentItem.submenu.length > 0) {
            setOpenSubmenuId(currentItem.id);
          }
          break;
        }

        case 'ArrowLeft':
        case 'Escape':
          event.preventDefault();
          if (openSubmenuId) {
            setOpenSubmenuId(null);
          } else {
            onClose();
          }
          break;

        case 'Enter':
        case ' ': {
          event.preventDefault();
          const focusedItem = items[focusedIndex];
          if (focusedItem && !focusedItem.disabled && !focusedItem.divider) {
            if (focusedItem.submenu) {
              setOpenSubmenuId(openSubmenuId === focusedItem.id ? null : focusedItem.id);
            } else if (focusedItem.onClick) {
              focusedItem.onClick();
              onClose();
            }
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, focusedIndex, onClose, openSubmenuId]);

  useEffect(() => {
    if (isOpen) {
      const firstSelectableIndex = items.findIndex(item => !item.divider && !item.disabled);
      setFocusedIndex(Math.max(0, firstSelectableIndex));
      setOpenSubmenuId(null);
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleItemClick = (item: ContextMenuItem, event?: React.MouseEvent) => {
    if (item.disabled || item.divider) return;

    if (item.submenu) {
      if (event) {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        setSubmenuParentRect(rect);
        setSubmenuPosition({ x: rect.right + 5, y: rect.top });
      }
      setOpenSubmenuId(openSubmenuId === item.id ? null : item.id);
    } else if (item.onClick) {
      item.onClick();
      onClose();
    }
  };

  const handleSubmenuItemClick = (subItem: ContextMenuItem) => {
    if (!subItem.disabled && !subItem.divider && subItem.onClick) {
      subItem.onClick();
      onClose();
    }
  };

  const openItem = openSubmenuId ? items.find(i => i.id === openSubmenuId) : null;

  return createPortal(
    <>
      {/* Backdrop — closes menu on outside click */}
      <div className="fixed inset-0 z-[49]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />

      <div
        ref={menuRef}
        className="context-menu fixed z-50 animate-fadeInScale"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[200px] max-w-[280px]">
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={item.id} className="context-menu-divider my-1 border-t border-gray-200" />;
            }

            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenuId === item.id;

            return (
              <button
                key={item.id}
                className={`
                  context-menu-item w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                  flex items-center gap-2
                  ${item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : focusedIndex === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${isSubmenuOpen ? 'bg-blue-50 text-blue-700' : ''}
                `}
                onClick={(e) => handleItemClick(item, e)}
                disabled={item.disabled}
                role="menuitem"
                tabIndex={focusedIndex === index ? 0 : -1}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    setFocusedIndex(index);
                    if (hasSubmenu) {
                      handleItemClick(item, e);
                    } else {
                      setOpenSubmenuId(null);
                    }
                  }
                }}
                aria-haspopup={hasSubmenu}
                aria-expanded={isSubmenuOpen}
              >
                {item.icon && <span className="text-base">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {hasSubmenu && <span className="text-xs text-gray-400">▸</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Searchable submenu */}
      {openItem?.searchable && openItem.submenu && (
        <SearchableSubmenu
          items={openItem.submenu}
          position={submenuPosition}
          parentRect={submenuParentRect}
          onSelect={handleSubmenuItemClick}
        />
      )}

      {/* Regular submenu */}
      {openItem && !openItem.searchable && openItem.submenu && (
        <div
          className="context-menu context-submenu fixed z-[51] animate-fadeInScale"
          style={{
            left: `${submenuPosition.x}px`,
            top: `${submenuPosition.y}px`,
          }}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[200px] max-w-[280px]">
            {openItem.submenu.map((subItem) => {
              if (subItem.divider) {
                return <div key={subItem.id} className="context-menu-divider my-1 border-t border-gray-200" />;
              }

              return (
                <button
                  key={subItem.id}
                  className={`
                    context-menu-item w-full text-left px-4 py-2.5 text-sm transition-colors duration-150
                    flex items-center gap-2
                    ${subItem.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => handleSubmenuItemClick(subItem)}
                  disabled={subItem.disabled}
                  role="menuitem"
                >
                  {subItem.icon && <span className="text-base">{subItem.icon}</span>}
                  <span className="flex-1">{subItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default ContextMenu;
