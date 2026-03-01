import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { buttonStyles } from "../../ui/primitives/buttonStyles";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/primitives/Card";
import { EmptyState } from "../../ui/shell/EmptyState";
import { PageHeader } from "../../ui/shell/PageHeader";

export default async function DashboardPage({
  params,
}: {
  // Next.js requires awaiting the `params` object when using async
  // components in dynamic routes; accessing `params.locale` directly
  // triggers the runtime warning seen earlier.
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t("kpi.queued")} value="0" />
        <KpiCard label={t("kpi.processing")} value="0" />
        <KpiCard label={t("kpi.completed")} value="0" />
        <KpiCard label={t("kpi.failed")} value="0" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t("latest.title")}</CardTitle>
            <div className="mt-1 text-sm text-[var(--text-muted)]">{t("latest.subtitle")}</div>
          </div>

          <Link
            href={`/${locale}/projects/new`}
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            {t("latest.new")}
          </Link>
        </CardHeader>

        <CardContent>
          <EmptyState
            title={t("latest.empty")}
            actionLabel={t("latest.new")}
            actionHref={`/${locale}/projects/new`}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-sm transition-all hover:-translate-y-px hover:shadow motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="text-xs font-medium text-[var(--text-muted)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[var(--text)]">{value}</div>
    </div>
  );
}
