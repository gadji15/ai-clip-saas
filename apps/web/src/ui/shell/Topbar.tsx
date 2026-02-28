import { LanguageSwitcher } from '@/ui/shell/LanguageSwitcher';

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden text-sm font-medium text-slate-700 sm:block">YouTok</div>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="text-sm text-slate-500">Dashboard</div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Account
          </button>
        </div>
      </div>
    </header>
  );
}
