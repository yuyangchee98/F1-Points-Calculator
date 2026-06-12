import React from 'react';

type BadgeVariant = 'neutral' | 'inverse' | 'success' | 'warning' | 'danger' | 'brand';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-carbon-100 text-ink-secondary',
  inverse: 'bg-carbon-800 text-white',
  success: 'bg-green-50 text-success',
  warning: 'bg-amber-50 text-warning',
  danger: 'bg-red-50 text-danger',
  brand: 'bg-brand-subtle text-brand',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', className = '', children }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-2xs font-semibold uppercase tracking-wide tnum ${variants[variant]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
