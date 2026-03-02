import { youtubeEmbedUrl } from '@/lib/youtube';
import { cn } from '@/lib/cn';

export function YouTubeEmbed({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)]',
        className
      )}
    >
      <div className="aspect-video">
        <iframe
          title={title ?? 'YouTube video preview'}
          src={youtubeEmbedUrl(videoId)}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
