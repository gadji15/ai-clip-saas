import { getTranslations } from 'next-intl/server';

import { Badge } from '@/ui/primitives/Badge';
import { Button } from '@/ui/primitives/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/primitives/Card';

export default async function SettingsPage() {
  const t = await getTranslations('settings');

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-sm text-slate-600">{t('subtitle')}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{t('profile.title')}</CardTitle>
                <CardDescription>{t('profile.subtitle')}</CardDescription>
              </div>
              <Badge>{t('profile.badge')}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Field label={t('profile.nameLabel')} defaultValue="Demo User" />
              <Field label={t('profile.emailLabel')} defaultValue="demo@youtok.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary">{t('profile.save')}</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('workspace.title')}</CardTitle>
            <CardDescription>{t('workspace.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Field label={t('workspace.slugLabel')} defaultValue="demo.youtok.com" />

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{t('workspace.notificationsTitle')}</div>
                    <div className="mt-1 text-sm text-slate-600">{t('workspace.notificationsHint')}</div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-indigo-600" />
                    <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>{t('workspace.save')}</Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('danger.title')}</CardTitle>
          <CardDescription>{t('danger.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-medium text-slate-900">{t('danger.actionTitle')}</div>
              <div className="mt-1 text-sm text-slate-600">{t('danger.actionHint')}</div>
            </div>
            <Button variant="danger">{t('danger.action')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <input
        defaultValue={defaultValue}
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      />
    </label>
  );
}
