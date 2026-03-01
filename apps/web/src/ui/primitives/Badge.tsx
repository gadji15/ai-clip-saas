import * as React from 'react';

import { cn } from '@/lib/cn';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'danger';

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        {
          default:
            'border-[color:var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]',
          secondary:
            'border-[color:var(--border)] bg-[var(--surface)] text-[var(--text-muted)]',
          success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
          warning: 'border-amber-200 bg-amber-50 text-amber-800',
          danger: 'border-rose-200 bg-rose-50 text-rose-700',
        }[variant],
        className
      )}
      {...props}
    />
  );
}
