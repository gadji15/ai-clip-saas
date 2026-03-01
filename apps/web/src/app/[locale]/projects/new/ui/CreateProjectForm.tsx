'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/ui/primitives/Button';
import { Input } from '@/ui/primitives/Input';

function isValidYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.hostname.includes('youtube.com') ||
      url.hostname === 'youtu.be'
    );
  } catch {
    return false;
  }
}

export function CreateProjectForm({ redirectLocale }: { redirectLocale: string }) {
  const t = useTranslations('projectNew');
  const router = useRouter();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [clipLength, setClipLength] = useState('30');

  const urlOk = useMemo(() => (url.trim().length === 0 ? false : isValidYoutubeUrl(url.trim())), [url]);
  const canSubmit = urlOk;

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    // Mock behavior for now: redirect to a fake project id.
    const id = 'proj_demo';
    router.push(`/${redirectLocale}/projects/${id}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <label className="text-xs font-medium text-[var(--text-muted)]">{t('form.nameLabel')}</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('form.namePlaceholder')}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-medium text-[var(--text-muted)]">{t('form.urlLabel')}</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('form.urlPlaceholder')}
        />
        <div
          className={
            'text-xs ' +
            (url.length === 0
              ? 'text-[var(--text-muted)]'
              : urlOk
                ? 'text-[var(--success)]'
                : 'text-[var(--danger)]')
          }
        >
          {url.length === 0 ? ' ' : urlOk ? t('form.urlValid') : t('form.urlInvalid')}
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-sm font-semibold text-[var(--text)]">{t('form.optionsTitle')}</div>
        <div className="mt-1 text-sm text-[var(--text-muted)]">{t('form.optionsHint')}</div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)]">{t('form.languageLabel')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
              className="h-10 w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] shadow-sm transition-colors placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 ring-offset-[color:var(--surface)] motion-reduce:transition-none"
            >
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)]">{t('form.clipLengthLabel')}</label>
            <Input
              inputMode="numeric"
              value={clipLength}
              onChange={(e) => setClipLength(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button variant="primary" disabled={!canSubmit}>
          {t('form.create')}
        </Button>
      </div>
    </form>
  );
}
