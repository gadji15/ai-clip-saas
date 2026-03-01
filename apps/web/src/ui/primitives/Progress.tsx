import { cn } from '@/lib/cn';

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]',
        className
      )}
    >
      <div
        className="h-full rounded-full bg-indigo-600 transition-all motion-reduce:transition-none"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
