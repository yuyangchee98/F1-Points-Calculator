import React from 'react';

interface RacendoPromoProps {
  className?: string;
}

const RacendoPromo: React.FC<RacendoPromoProps> = ({ className = '' }) => {
  return (
    <a
      href="https://racendo.chyuang.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 ${className}`}
      onClick={() => {
        if (window.gtag) {
          window.gtag('event', 'click', {
            event_category: 'Racendo Promo',
            event_label: 'Header Banner Click',
          });
        }
      }}
    >
      <span className="text-2xl animate-bounce">🏁</span>
      <div className="flex flex-col items-start">
        <span className="text-xs font-normal opacity-90">Master Every Corner</span>
        <span className="text-sm font-bold leading-tight">Racendo</span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 group-hover:translate-x-1 transition-transform"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
};

export default RacendoPromo;
