import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/ui/primitives/Badge";
import { Button } from "@/ui/primitives/Button";
import { buttonStyles } from "@/ui/primitives/buttonStyles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/primitives/Card";
import { Progress } from "@/ui/primitives/Progress";
import { PageHeader } from "@/ui/shell/PageHeader";

type ProjectStatus = "queued" | "processing" | "completed" | "failed";

const stages = ["download", "transcribe", "segment", "render", "done"] as const;

type Stage = (typeof stages)[number];

export default async function ProjectDetailsPage({
  params,
}: {
  // params is a promise in Next.js async route handlers — await it.
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("project");

  // Mock project based on id
  const status: ProjectStatus = id.includes("failed")
    ? "failed"
    : id.includes("1")
      ? "completed"
      : "processing";
  const stage: Stage =
    status === "completed"
      ? "done"
      : status === "failed"
        ? "render"
        : "transcribe";
  const progress = status === "completed" ? 100 : status === "failed" ? 72 : 42;

  const stageLabel = t(`stages.${stage}`);

  const clips = [
    {
      id: "clip_a1",
      title: "Hook + intro",
      score: 0.86,
      status: "ready" as const,
    },
    {
      id: "clip_b2",
      title: "Key insight",
      score: 0.77,
      status: "ready" as const,
    },
    {
      id: "clip_c3",
      title: "Closing",
      score: 0.41,
      status: "pending" as const,
    },
  ];

  const events = [
    { ts: "12:03", message: "Downloading source video" },
    { ts: "12:05", message: "Extracting audio" },
    { ts: "12:07", message: "Running transcription (Whisper)" },
    { ts: "12:12", message: "Segment scoring" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={id}
        description={t('overview.subtitle')}
        actions={
          <>
            <Link
              href={`/${locale}/projects`}
              className={buttonStyles({ variant: 'ghost', size: 'sm' })}
            >
              {t('back')}
            </Link>
            <StatusBadge
              status={status}
              labels={{
                queued: t('status.queued'),
                processing: t('status.processing'),
                completed: t('status.completed'),
                failed: t('status.failed'),
              }}
            />
            <Button disabled>{t('actions.retry')}</Button>
            <Button variant="danger" disabled>
              {t('actions.delete')}
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("overview.title")}</CardTitle>
            <CardDescription>{t("overview.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-[var(--text-muted)]">
                    {t("overview.stage")}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                    {stageLabel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-[var(--text-muted)]">
                    {t("overview.progress")}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[var(--text)]">
                    {progress}%
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={progress} />
              </div>
            </div>

            <div className="mt-5">
              <Stepper current={stage} getLabel={(s) => t(`stages.${s}`)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("artifacts.title")}</CardTitle>
            <CardDescription>{t("artifacts.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button
                className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] motion-reduce:transition-none"
                disabled
              >
                transcript.json
              </button>
              <button
                className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] motion-reduce:transition-none"
                disabled
              >
                subtitles.srt
              </button>
              <button
                className="w-full rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] motion-reduce:transition-none"
                disabled
              >
                clips.json
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("events.title")}</CardTitle>
            <CardDescription>{t("events.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-sm text-[var(--text-muted)]">{t("events.empty")}</div>
            ) : (
              <div className="space-y-3">
                {events.map((e, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-14 shrink-0 text-xs font-medium text-[var(--text-muted)]">
                      {e.ts}
                    </div>
                    <div className="min-w-0 flex-1 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text-muted)]">
                      {e.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("clips.title")}</CardTitle>
            <CardDescription>{t("clips.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {clips.length === 0 ? (
              <div className="text-sm text-[var(--text-muted)]">{t("clips.empty")}</div>
            ) : (
              <div className="grid gap-3">
                {clips.map((c) => (
                  <Link
                    key={c.id}
                    href={`/${locale}/clips/${c.id}`}
                    className="group rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-3 transition-colors hover:bg-[var(--surface-muted)] motion-reduce:transition-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[var(--text)]">
                          {c.title}
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                          {c.id}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={c.status === "ready" ? "success" : "warning"}
                        >
                          {t(`clipStatus.${c.status}`)}
                        </Badge>
                        <div className="text-xs font-medium text-[var(--text-muted)]">
                          {Math.round(c.score * 100)}%
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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

function Stepper({
  current,
  getLabel,
}: {
  current: Stage;
  getLabel: (stage: Stage) => string;
}) {
  const currentIndex = stages.indexOf(current);

  return (
    <ol className="grid gap-2 sm:grid-cols-5">
      {stages.map((s, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;

        return (
          <li
            key={s}
            className={
              "rounded-lg border px-3 py-2 text-xs font-medium transition-colors motion-reduce:transition-none " +
              (done
                ? "border-[color:var(--border)] bg-[var(--success-soft)] text-[var(--text)]"
                : active
                  ? "border-[color:var(--border)] bg-[var(--accent-soft)] text-[var(--text)]"
                  : "border-[color:var(--border)] bg-[var(--surface)] text-[var(--text-muted)]")
            }
          >
            {getLabel(s)}
          </li>
        );
      })}
    </ol>
  );
}
