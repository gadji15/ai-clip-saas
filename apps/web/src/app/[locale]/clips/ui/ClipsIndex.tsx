'use client';

import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { AppLocale } from '@/i18n/locales';
import { Badge } from '@/ui/primitives/Badge';
import { Button } from '@/ui/primitives/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/Card';
import { Input } from '@/ui/primitives/Input';
import { buttonStyles } from '@/ui/primitives/buttonStyles';

type ClipStatus = 'processing' | 'ready' | 'failed';

type ClipRow = {
  id: string;
  title: string;
  projectName: string;
  status: ClipStatus;
  durationSec: number;
  createdAt: string;
};

const mockClips: ClipRow[] = [
  {
    id: 'clip_0f2c',
    title: 'Hook + payoff (30s)',
    projectName: 'Best of Podcast #12',
    status: 'ready',
    durationSec: 31,
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: 'clip_aa19',
    title: 'Founder story (45s)',
    projectName: 'Interview Founder',
    status: 'processing',
    durationSec: 44,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'clip_33b1',
    title: 'Key takeaway (25s)',
    projectName: 'YouTube Shorts — Compilation',
    status: 'failed',
    durationSec: 26,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
  },
];

export function ClipsIndex() {
  const t = useTranslations('clips');
  const tClip = useTranslations('clip');
  const locale = useLocale() as AppLocale;

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ClipStatus>('all');
  const [view, setView] = useState<'table' | 'cards'>('table');

  const df = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return mockClips.filter((clip) => {
      if (status !== 'all' && clip.status !== status) return false;
      if (q.length === 0) return true;

      return (
        clip.id.toLowerCase().includes(q) ||
        clip.title.toLowerCase().includes(q) ||
        clip.projectName.toLowerCase().includes(q)
      );
    });
  }, [query, status]);

  const hasAny = mockClips.length > 0;

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <CardTitle>{t('listTitle')}</CardTitle>
          <div className="mt-1 text-sm text-slate-500">
            {hasAny ? t('count', { shown: filtered.length, total: mockClips.length }) : t('countEmpty')}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <div className="w-full sm:w-72">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterButton active={status === 'all'} onClick={() => setStatus('all')}>
              {t('filters.all')}
            </FilterButton>
            <FilterButton active={status === 'processing'} onClick={() => setStatus('processing')}>
              {t('filters.processing')}
            </FilterButton>
            <FilterButton active={status === 'ready'} onClick={() => setStatus('ready')}>
              {t('filters.ready')}
            </FilterButton>
            <FilterButton active={status === 'failed'} onClick={() => setStatus('failed')}>
              {t('filters.failed')}
            </FilterButton>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('table')}
              className={buttonStyles({ variant: view === 'table' ? 'primary' : 'secondary', size: 'sm' })}
            >
              {t('view.table')}
            </button>
            <button
              type="button"
              onClick={() => setView('cards')}
              className={buttonStyles({ variant: view === 'cards' ? 'primary' : 'secondary', size: 'sm' })}
            >
              {t('view.cards')}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!hasAny ? (
          <EmptyState
            title={t('empty.title')}
            subtitle={t('empty.subtitle')}
            actionLabel={t('empty.action')}
            actionHref={`/${locale}/projects`}
          />
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-semibold text-slate-900">{t('noResults.title')}</div>
            <div className="mt-1 text-sm text-slate-600">{t('noResults.subtitle')}</div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                }}
              >
                {t('noResults.reset')}
              </Button>
            </div>
          </div>
        ) : view === 'table' ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-12 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
              <div className="col-span-5">{t('table.clip')}</div>
              <div className="col-span-3">{t('table.project')}</div>
              <div className="col-span-2">{t('table.status')}</div>
              <div className="col-span-1 text-right">{t('table.duration')}</div>
              <div className="col-span-1 text-right">{t('table.created')}</div>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {filtered.map((clip) => (
                <Link
                  key={clip.id}
                  href={`/${locale}/clips/${clip.id}`}
                  className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50"
                >
                  <div className="col-span-5 min-w-0">
                    <div className="truncate font-medium text-slate-900">{clip.title}</div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">{clip.id}</div>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <div className="truncate text-sm text-slate-700">{clip.projectName}</div>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge
                      status={clip.status}
                      labels={{
                        processing: tClip('status.processing'),
                        ready: tClip('status.ready'),
                        failed: tClip('status.failed'),
                      }}
                    />
                  </div>
                  <div className="col-span-1 text-right text-xs text-slate-600">
                    {formatDuration(clip.durationSec)}
                  </div>
                  <div className="col-span-1 text-right text-xs text-slate-500">
                    {df.format(new Date(clip.createdAt))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((clip) => (
              <Link
                key={clip.id}
                href={`/${locale}/clips/${clip.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-px hover:border-slate-300 hover:shadow motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                      {clip.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">{clip.projectName}</div>
                  </div>
                  <StatusBadge
                    status={clip.status}
                    labels={{
                      processing: tClip('status.processing'),
                      ready: tClip('status.ready'),
                      failed: tClip('status.failed'),
                    }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div>
                    <div className="text-slate-500">{t('cards.duration')}</div>
                    <div className="mt-1 font-medium text-slate-800">
                      {formatDuration(clip.durationSec)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">{t('cards.created')}</div>
                    <div className="mt-1 font-medium text-slate-800">{df.format(new Date(clip.createdAt))}</div>
                  </div>
                </div>

                <div className="mt-3 truncate text-xs text-slate-500">{clip.id}</div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonStyles({ variant: active ? 'primary' : 'secondary', size: 'sm' })}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  status,
  labels,
}: {
  status: ClipStatus;
  labels: Record<ClipStatus, string>;
}) {
  const variant =
    status === 'ready' ? 'success' : status === 'failed' ? 'danger' : 'warning';

  return <Badge variant={variant}>{labels[status]}</Badge>;
}

function formatDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function EmptyState({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
      <div className="mt-4">
        <Link href={actionHref} className={buttonStyles({ variant: 'primary', size: 'sm' })}>
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
