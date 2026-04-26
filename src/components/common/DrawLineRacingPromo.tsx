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
      className={`group inline-flex items-center gap-1.5 h-8 px-3 bg-red-50 text-red-700 border border-red-200 font-medium rounded-md hover:bg-red-100 transition-colors text-sm ${className}`}
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
      <span className="text-sm leading-none">🏎️</span>
      <span>Draw Line Racing</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 group-hover:translate-x-0.5 transition-transform"
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
