import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function buttonStyles({
  variant = 'secondary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium shadow-sm ring-offset-white transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:translate-y-px',
    {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
      secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ghost: 'text-slate-700 hover:bg-slate-100',
      danger: 'bg-rose-600 text-white hover:bg-rose-500',
    }[variant],
    {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-3.5 text-sm',
      lg: 'h-11 px-4 text-sm',
    }[size],
    className
  );
}
