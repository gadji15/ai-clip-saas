import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/ui/primitives/Badge";
import { buttonStyles } from "@/ui/primitives/buttonStyles";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives/Card";
import { Input } from "@/ui/primitives/Input";
import { PageHeader } from "@/ui/shell/PageHeader";

type ProjectStatus = "queued" | "processing" | "completed" | "failed";

type ProjectRow = {
  id: string;
  name: string;
  status: ProjectStatus;
  updatedAt: string;
};

const mockProjects: ProjectRow[] = [
  {
    id: "proj_8f2c",
    name: "Best of Podcast #12",
    status: "processing",
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "proj_1aa9",
    name: "YouTube Shorts — Compilation",
    status: "completed",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "proj_33b1",
    name: "Interview Founder",
    status: "failed",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
];

export default async function ProjectsPage({
  params,
}: {
  // params is a promise in Next.js async route handlers — await it.
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("projects");
  const tProject = await getTranslations("project");

  const df = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Link
            href={`/${locale}/projects/new`}
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            {t("new")}
          </Link>
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t("title")}</CardTitle>
          <div className="w-full sm:w-72">
            <Input placeholder={t("searchPlaceholder")} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-[var(--surface)]">
            <div className="grid grid-cols-12 bg-[var(--surface-muted)] px-4 py-2 text-xs font-medium text-[var(--text-muted)]">
              <div className="col-span-7">{t("table.name")}</div>
              <div className="col-span-3">{t("table.status")}</div>
              <div className="col-span-2 text-right">{t("table.updated")}</div>
            </div>

            <div className="divide-y divide-[color:var(--border)]">
              {mockProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}/projects/${p.id}`}
                  className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-muted)] motion-reduce:transition-none"
                >
                  <div className="col-span-7 min-w-0">
                    <div className="truncate font-medium text-[var(--text)]">
                      {p.name}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                      {p.id}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <StatusBadge
                      status={p.status}
                      labels={{
                        queued: tProject("status.queued"),
                        processing: tProject("status.processing"),
                        completed: tProject("status.completed"),
                        failed: tProject("status.failed"),
                      }}
                    />
                  </div>
                  <div className="col-span-2 text-right text-xs text-[var(--text-muted)]">
                    {df.format(new Date(p.updatedAt))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({
  status,
  labels,
}: {
  status: ProjectStatus;
  labels: Record<ProjectStatus, string>;
}) {
  const variant =
    status === "completed"
      ? "success"
      : status === "failed"
        ? "danger"
        : status === "processing"
          ? "warning"
          : "secondary";

  return <Badge variant={variant}>{labels[status]}</Badge>;
}
