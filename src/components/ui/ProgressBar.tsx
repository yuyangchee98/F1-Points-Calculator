import React from 'react';

interface Props {
  value: number;
  max: number;
  /** Neutral for amounts; brand only for the current user's own figure. */
  tone?: 'neutral' | 'brand';
  className?: string;
  'aria-label'?: string;
}

const ProgressBar: React.FC<Props> = ({ value, max, tone = 'neutral', className = 'w-24', 'aria-label': ariaLabel }) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      className={`h-1.5 rounded-full bg-carbon-200 overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-full ${tone === 'brand' ? 'bg-brand' : 'bg-carbon-700'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default ProgressBar;
