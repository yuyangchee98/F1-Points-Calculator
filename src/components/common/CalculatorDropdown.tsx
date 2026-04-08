import React, { useState, useRef, useEffect } from 'react';

const CalculatorDropdown: React.FC = () => {
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
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 text-white px-1.5 py-0.5 lg:px-3 lg:py-1 mr-1.5 lg:mr-3 rounded-md text-xs sm:text-sm lg:text-xl font-bold flex items-center gap-0.5 lg:gap-1 hover:bg-red-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Switch calculator"
      >
        F1
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 lg:h-4 lg:w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50">
          <nav
            className="bg-white shadow-lg rounded-md border border-gray-200 py-1 min-w-[180px]"
            role="menu"
            aria-label="Formula calculators"
          >
            <a
              href="/"
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 font-medium"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              F1 Calculator
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </a>
            <a
              href="https://f2pointscalculator.chyuang.com"
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              F2 Calculator
            </a>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CalculatorDropdown;
