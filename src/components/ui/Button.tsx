import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Toggle buttons: renders aria-pressed and pressed styling */
  pressed?: boolean;
  iconOnly?: boolean;
}

interface ButtonProps extends ButtonOwnProps, React.ButtonHTMLAttributes<HTMLButtonElement> {}
interface ButtonLinkProps extends ButtonOwnProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-200 select-none whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive disabled:opacity-50 disabled:pointer-events-none';

const sizes: Record<ButtonSize, string> = {
  sm: 'text-sm px-2.5 py-1.5',
  md: 'text-sm px-3 py-2',
};

const iconOnlySizes: Record<ButtonSize, string> = {
  sm: 'text-sm p-1.5',
  md: 'text-sm p-2',
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong shadow-xs',
  secondary: 'bg-surface border border-strong text-ink hover:bg-carbon-50',
  ghost: 'bg-transparent text-ink-secondary hover:bg-carbon-100 hover:text-ink',
  danger: 'bg-transparent text-ink-secondary hover:bg-red-50 hover:text-danger',
};

/* Toggles are on/off state, not a color identity: pressed = dark fill */
const pressedClasses = 'bg-carbon-800 text-white hover:bg-carbon-700 hover:text-white';

export function buttonClasses({
  variant = 'secondary',
  size = 'md',
  pressed,
  iconOnly,
  className = '',
}: ButtonOwnProps & { className?: string }): string {
  return [
    base,
    iconOnly ? iconOnlySizes[size] : sizes[size],
    pressed ? pressedClasses : variants[variant],
    className,
  ].join(' ');
}

const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  pressed,
  iconOnly,
  className = '',
  children,
  ...rest
}) => (
  <button
    {...rest}
    aria-pressed={pressed !== undefined ? pressed : undefined}
    className={buttonClasses({ variant, size, pressed, iconOnly, className })}
  >
    {children}
  </button>
);

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  variant = 'secondary',
  size = 'md',
  pressed,
  iconOnly,
  className = '',
  children,
  ...rest
}) => (
  <a {...rest} className={buttonClasses({ variant, size, pressed, iconOnly, className })}>
    {children}
  </a>
);

export default Button;
