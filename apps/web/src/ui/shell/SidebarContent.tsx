'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import type { AppLocale } from '@/i18n/locales';
import { cn } from '@/lib/cn';
import { Logo } from '@/ui/shell/Logo';
import { appNavItems, isNavItemActive, localizeHref } from '@/ui/shell/navigation';

export function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const t = useTranslations('app');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-4">
        <Logo />
        <div className="text-sm font-semibold tracking-tight">{t('name')}</div>
      </div>

      <nav className="px-2 py-3">
        {appNavItems.map((item) => {
          const href = localizeHref(locale, item.href);
          const active = isNavItemActive({ pathname, locale, href: item.href });
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-slate-900' : 'text-slate-500')} />
              <span className="truncate">{t(item.translationKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-4 pt-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-700">Workspace</div>
          <div className="mt-1 truncate text-sm text-slate-600">demo.youtok.com</div>
        </div>
      </div>
    </div>
  );
}
