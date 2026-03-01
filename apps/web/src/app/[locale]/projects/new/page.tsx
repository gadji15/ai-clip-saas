import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { buttonStyles } from '../../../ui/primitives/buttonStyles';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/primitives/Card';

import { CreateProjectForm } from './ui/CreateProjectForm';

export default async function NewProjectPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations('projectNew');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/projects`} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
            {t('back')}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        </div>
      </div>

      <p className="text-sm text-slate-600">{t('subtitle')}</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateProjectForm redirectLocale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
