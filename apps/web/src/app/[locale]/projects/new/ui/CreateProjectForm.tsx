'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { parseYoutubeVideoId } from '@/lib/youtube';
import { Button } from '@/ui/primitives/Button';
import { Input } from '@/ui/primitives/Input';
import { Select } from '@/ui/primitives/Select';
import { YouTubeEmbed } from '@/ui/shell/YouTubeEmbed';

export function CreateProjectForm({ redirectLocale }: { redirectLocale: string }) {
  const t = useTranslations('projectNew');
  const router = useRouter();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [clipLength, setClipLength] = useState('60');
  const [subtitles, setSubtitles] = useState<'on' | 'off'>('on');

  const videoId = useMemo(() => parseYoutubeVideoId(url), [url]);
  const urlOk = videoId !== null;
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

        {videoId ? (
          <div className="pt-2 motion-reduce:animate-none sm:animate-[youtok-page-enter_200ms_ease-out]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-[var(--text-muted)]">Preview</div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  {t('form.urlValid')}
                </div>
              </div>
              <YouTubeEmbed
                videoId={videoId}
                title={t('form.urlLabel')}
                size="sm"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)] p-4">
        <div className="text-sm font-semibold text-[var(--text)]">{t('form.optionsTitle')}</div>
        <div className="mt-1 text-sm text-[var(--text-muted)]">{t('form.optionsHint')}</div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)]">{t('form.languageLabel')}</label>
            <Select value={language} onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)]">{t('form.clipLengthLabel')}</label>
            <Input
              inputMode="numeric"
              min={60}
              max={180}
              value={clipLength}
              onChange={(e) => setClipLength(e.target.value)}
            />
            <div className="text-xs text-[var(--text-muted)]">60–180</div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-[var(--text-muted)]">{t('form.subtitlesLabel')}</label>
            <Select value={subtitles} onChange={(e) => setSubtitles(e.target.value as 'on' | 'off')}>
              <option value="on">{t('form.subtitlesOn')}</option>
              <option value="off">{t('form.subtitlesOff')}</option>
            </Select>
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
