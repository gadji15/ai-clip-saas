'use client';

import { Menu } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import type { AppLocale } from '../../i18n/locales';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getActiveNavItem } from './navigation';

export function Topbar({
  onOpenMobileNav,
}: {
  onOpenMobileNav?: () => void;
}) {
  const t = useTranslations('app');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const active = getActiveNavItem({ pathname, locale });

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label={t('topbar.openNavigation')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden text-sm font-medium text-slate-700 sm:block">YouTok</div>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="truncate text-sm font-medium text-slate-600">{t(active.translationKey)}</div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            {t('topbar.account')}
          </button>
        </div>
      </div>
    </header>
  );
}
