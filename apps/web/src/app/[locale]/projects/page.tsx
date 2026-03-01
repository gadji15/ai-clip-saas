import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Badge } from '../../ui/primitives/Badge';
import { buttonStyles } from '../../ui/primitives/buttonStyles';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/primitives/Card';
import { Input } from '../../ui/primitives/Input';

type ProjectStatus = 'queued' | 'processing' | 'completed' | 'failed';

type ProjectRow = {
  id: string;
  name: string;
  status: ProjectStatus;
  updatedAt: string;
};

const mockProjects: ProjectRow[] = [
  {
    id: 'proj_8f2c',
    name: 'Best of Podcast #12',
    status: 'processing',
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'proj_1aa9',
    name: 'YouTube Shorts — Compilation',
    status: 'completed',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'proj_33b1',
    name: 'Interview Founder',
    status: 'failed',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
];

export default async function ProjectsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations('projects');
  const tProject = await getTranslations('project');

  const df = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-600">{t('subtitle')}</p>
        </div>

        <Link
          href={`/${locale}/projects/new`}
          className={buttonStyles({ variant: 'primary', size: 'sm' })}
        >
          {t('new')}
        </Link>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t('title')}</CardTitle>
          <div className="w-full sm:w-72">
            <Input placeholder={t('searchPlaceholder')} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="grid grid-cols-12 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
              <div className="col-span-7">{t('table.name')}</div>
              <div className="col-span-3">{t('table.status')}</div>
              <div className="col-span-2 text-right">{t('table.updated')}</div>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {mockProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}/projects/${p.id}`}
                  className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50"
                >
                  <div className="col-span-7 min-w-0">
                    <div className="truncate font-medium text-slate-900">{p.name}</div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">{p.id}</div>
                  </div>
                  <div className="col-span-3">
                    <StatusBadge
                      status={p.status}
                      labels={{
                        queued: tProject('status.queued'),
                        processing: tProject('status.processing'),
                        completed: tProject('status.completed'),
                        failed: tProject('status.failed'),
                      }}
                    />
                  </div>
                  <div className="col-span-2 text-right text-xs text-slate-500">
                    {df.format(new Date(p.updatedAt))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({
  status,
  labels,
}: {
  status: ProjectStatus;
  labels: Record<ProjectStatus, string>;
}) {
  const variant =
    status === 'completed'
      ? 'success'
      : status === 'failed'
        ? 'danger'
        : status === 'processing'
          ? 'warning'
          : 'secondary';

  return <Badge variant={variant}>{labels[status]}</Badge>;
}
