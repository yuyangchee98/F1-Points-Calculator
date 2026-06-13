import React, { useState, useRef, useEffect, type ReactNode } from 'react';

interface SettingsPopoverProps {
  ariaLabel: string;
  children: ReactNode;
  /** Popover panel width in rem. */
  widthRem?: number;
}

/**
 * Small gear button that opens an anchored settings panel. Used per section
 * (a drivers gear and a constructors gear), so the trigger is sized to sit
 * inside a section heading. Click-outside closes it (same pattern as the
 * other dropdowns in this app).
 */
const SettingsPopover: React.FC<SettingsPopoverProps> = ({ ariaLabel, children, widthRem = 15 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center h-5 w-5 rounded transition-colors ${
          isOpen ? 'text-ink bg-carbon-100' : 'text-ink-muted hover:text-ink hover:bg-carbon-100'
        }`}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 z-50 bg-surface border border-strong rounded-lg shadow-lg p-3 normal-case tracking-normal max-h-[70vh] overflow-y-auto"
          style={{ width: `${widthRem}rem`, maxWidth: 'calc(100vw - 1rem)' }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    className="w-full flex items-center justify-between gap-3 py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive rounded"
  >
    <span className="min-w-0">
      <span className="block text-sm text-ink">{label}</span>
      {description && <span className="block text-2xs text-ink-muted">{description}</span>}
    </span>
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-carbon-800' : 'bg-carbon-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </span>
  </button>
);

export default SettingsPopover;
