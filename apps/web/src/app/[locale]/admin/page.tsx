import { getTranslations } from 'next-intl/server';

import { Badge } from '@/ui/primitives/Badge';
import { Button } from '@/ui/primitives/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/primitives/Card';

export default async function AdminPage() {
  const t = await getTranslations('admin');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-600">{t('subtitle')}</p>
        </div>
        <Badge>{t('badge')}</Badge>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('placeholder.title')}</CardTitle>
          <CardDescription>{t('placeholder.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="text-sm text-slate-600">{t('placeholder.note')}</div>
            <Button disabled>{t('placeholder.cta')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
