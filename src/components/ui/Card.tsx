import React from 'react';

interface CardProps {
  /** Optional header row; rendered with the brand speed-stripe accent */
  title?: React.ReactNode;
  /** Show the red speed-stripe next to the title (default true when title set) */
  accent?: boolean;
  headerClassName?: string;
  className?: string;
  children: React.ReactNode;
}

/* The one resting surface of the app: flat white, hairline border,
   xs shadow. Higher elevation is reserved for menus, modals, and drag. */
const Card: React.FC<CardProps> = ({
  title,
  accent = true,
  headerClassName = '',
  className = '',
  children,
}) => (
  <div className={`bg-surface rounded-lg shadow-xs border overflow-hidden ${className}`}>
    {title !== undefined && (
      <h2
        className={`text-lg font-semibold font-display p-3 border-b sticky top-0 bg-surface flex items-center ${headerClassName}`}
      >
        {accent && <span className="w-1 h-5 bg-brand mr-3 inline-block rounded-r-md" aria-hidden="true"></span>}
        {title}
      </h2>
    )}
    {children}
  </div>
);

export default Card;
