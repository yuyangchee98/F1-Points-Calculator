import React from 'react';

interface DrawLineRacingPromoProps {
  className?: string;
}

const DrawLineRacingPromo: React.FC<DrawLineRacingPromoProps> = ({ className = '' }) => {
  return (
    <a
      href="https://drawlineracing.chyuang.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1 sm:gap-2 p-2 sm:px-4 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 ${className}`}
      aria-label="Try Draw Line Racing"
      title="Try my new game: Draw Line Racing!"
      onClick={() => {
        if (window.gtag) {
          window.gtag('event', 'click', {
            event_category: 'Draw Line Racing Promo',
            event_label: 'Header Banner Click',
          });
        }
      }}
    >
      <span className="text-base sm:text-2xl leading-none">🏎️</span>
      <div className="hidden sm:flex flex-col items-start">
        <span className="text-xs font-normal opacity-90">Try my new game!</span>
        <span className="text-sm font-bold leading-tight">Draw Line Racing</span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="hidden sm:block h-4 w-4 group-hover:translate-x-1 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
};

export default DrawLineRacingPromo;
