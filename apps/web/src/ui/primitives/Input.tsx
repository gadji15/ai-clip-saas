'use client';

import * as React from 'react';

import { cn } from '../../lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm',
        'placeholder:text-slate-400',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
