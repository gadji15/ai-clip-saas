import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-sm text-slate-600">{t('subtitle')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Queued</div>
          <div className="mt-2 text-2xl font-semibold">0</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Processing</div>
          <div className="mt-2 text-2xl font-semibold">0</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Completed</div>
          <div className="mt-2 text-2xl font-semibold">0</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Failed</div>
          <div className="mt-2 text-2xl font-semibold">0</div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Latest projects</div>
            <div className="mt-1 text-xs text-slate-500">This will be wired to the API next.</div>
          </div>
          <a
            href="#"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            New project
          </a>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          <div className="py-3 text-sm text-slate-600">No projects yet.</div>
        </div>
      </div>
    </div>
  );
}
