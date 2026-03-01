import * as React from 'react';

import { cn } from '../../lib/cn';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(function Card({ className, interactive = false, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        interactive && 'transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    />
  );
});

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cn('p-4 sm:p-5', className)} {...props} />;
  }
);

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn('text-sm font-semibold tracking-tight text-slate-900', className)}
        {...props}
      />
    );
  }
);

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn('mt-1 text-sm text-slate-500', className)} {...props} />;
});

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cn('px-4 pb-4 sm:px-5 sm:pb-5', className)} {...props} />;
  }
);

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-end gap-2 px-4 pb-4 sm:px-5 sm:pb-5', className)}
        {...props}
      />
    );
  }
);
