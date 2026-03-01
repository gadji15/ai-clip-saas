'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Logo } from '@/ui/shell/Logo';

export function AppSidebar() {
  const t = useTranslations('app');

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-14 items-center gap-2 px-4">
        <Logo />
        <div className="text-sm font-semibold tracking-tight">{t('name')}</div>
      </div>

      <nav className="px-2 py-3">
        <SidebarLink href="#" label={t('nav.dashboard')} />
        <SidebarLink href="#" label={t('nav.projects')} />
        <SidebarLink href="#" label={t('nav.billing')} />
        <SidebarLink href="#" label={t('nav.settings')} />
      </nav>

      <div className="mt-auto px-4 pb-4 pt-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-700">Workspace</div>
          <div className="mt-1 truncate text-sm text-slate-600">demo.youtok.com</div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
    >
      <span className="truncate">{label}</span>
    </Link>
  );
}
