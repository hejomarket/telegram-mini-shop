import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--tg-button)] text-[var(--tg-button-text)] shadow-soft shadow-soia-green/15 hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-soia-lime text-soia-forest shadow-soft shadow-soia-lime/20 hover:-translate-y-0.5 active:translate-y-0',
  outline: 'border border-soia-green/12 bg-white/60 text-soia-green hover:bg-white',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100',
  ghost: 'bg-transparent text-soia-green hover:bg-soia-mist',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3 text-xs',
  md: 'min-h-12 px-4 text-sm',
  lg: 'min-h-14 px-5 text-sm',
  icon: 'h-11 w-11 p-0',
};

export function Button({ variant = 'primary', size = 'md', isLoading = false, className = '', disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex touch-manipulation items-center justify-center gap-2 rounded-2xl font-extrabold tracking-[-0.01em] transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soia-lime disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
