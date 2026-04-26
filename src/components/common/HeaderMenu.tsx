import React, { useState, useRef, useEffect } from 'react';
import { trackBuyCoffeeClick, trackFeedbackClick } from '../../utils/analytics';

interface HeaderMenuProps {
  hasConsensusAccess: boolean;
  onOpenSubscription: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ hasConsensusAccess, onOpenSubscription }) => {
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

  const handlePromoClick = () => {
    if (window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'Draw Line Racing Promo',
        event_label: 'Header Menu Click',
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center h-7 sm:h-8 w-7 sm:w-8 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <a
            href="/about"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </a>

          <a
            href="https://github.com/yuyangchee98/F1-Points-Calculator/issues"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { trackFeedbackClick(); setIsOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Feedback
          </a>

          <a
            href="https://buymeacoffee.com/yaang"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { trackBuyCoffeeClick(); setIsOpen(false); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Support
          </a>

          <a
            href="https://drawlineracing.chyuang.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handlePromoClick}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 lg:hidden"
          >
            <span className="text-base leading-none">🏎️</span>
            Try Draw Line Racing
          </a>

          {hasConsensusAccess && (
            <button
              onClick={() => { onOpenSubscription(); setIsOpen(false); }}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Subscription
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderMenu;
