'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

import { locales, type AppLocale } from '../../i18n/locales';

function setLocaleCookie(locale: AppLocale) {
  document.cookie = `youtok_locale=${locale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  function onChange(nextLocale: AppLocale) {
    setLocaleCookie(nextLocale);

    const parts = pathname.split('/');
    if (parts.length > 1 && locales.includes(parts[1] as AppLocale)) {
      parts[1] = nextLocale;
      router.push(parts.join('/') || '/');
      return;
    }

    router.push(`/${nextLocale}${pathname === '/' ? '' : pathname}`);
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('fr')}
        className={
          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors ' +
          (locale === 'fr' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50')
        }
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={
          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors ' +
          (locale === 'en' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50')
        }
      >
        EN
      </button>
    </div>
  );
}
