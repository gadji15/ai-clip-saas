import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { buttonStyles } from '../../ui/primitives/buttonStyles';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/primitives/Card';

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations('dashboard');

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-sm text-slate-600">{t('subtitle')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('kpi.queued')} value="0" />
        <KpiCard label={t('kpi.processing')} value="0" />
        <KpiCard label={t('kpi.completed')} value="0" />
        <KpiCard label={t('kpi.failed')} value="0" />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t('latest.title')}</CardTitle>
            <div className="mt-1 text-sm text-slate-500">{t('latest.subtitle')}</div>
          </div>

          <Link
            href={`/${locale}/projects/new`}
            className={buttonStyles({ variant: 'primary', size: 'sm' })}
          >
            {t('latest.new')}
          </Link>
        </CardHeader>

        <CardContent>
          <div className="text-sm text-slate-600">{t('latest.empty')}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
