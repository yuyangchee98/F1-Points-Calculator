import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuItem, ContextMenuPosition } from '../../types/contextMenu';

interface ContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, position, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
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

        case 'ArrowUp':
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

        case 'ArrowRight':
          event.preventDefault();
          const currentItem = items[focusedIndex];
          if (currentItem?.submenu && currentItem.submenu.length > 0) {
            setOpenSubmenuId(currentItem.id);
          }
          break;

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
        case ' ':
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
        const newPos = {
          x: rect.right + 5,
          y: rect.top,
        };

        const submenuWidth = 200;
        if (newPos.x + submenuWidth > window.innerWidth) {
          newPos.x = rect.left - submenuWidth - 5;
        }

        setSubmenuPosition(newPos);
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

  return createPortal(
    <>
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

      {openSubmenuId && items.find(item => item.id === openSubmenuId)?.submenu && (
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
            {items.find(item => item.id === openSubmenuId)?.submenu?.map((subItem) => {
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
