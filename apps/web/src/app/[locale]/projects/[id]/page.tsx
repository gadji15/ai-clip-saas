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
import { Skeleton } from "@/ui/primitives/skeleton";
import { CopyButton } from "@/ui/shell/CopyButton";
import { PageHeader } from "@/ui/shell/PageHeader";
import { PipelineProgress } from "@/ui/shell/PipelineProgress";

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
      id: "clip_001",
      score: 0.86,
      durationSeconds: 74,
      subtitlesEnabled: true,
      status: "ready" as const,
      viralTitle:
        locale === "fr"
          ? "Ne fais plus cette erreur (ça change tout)"
          : "Stop making this mistake (it changes everything)",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    },
    {
      id: "clip_002",
      score: 0.77,
      durationSeconds: 122,
      subtitlesEnabled: false,
      status: "ready" as const,
      viralTitle:
        locale === "fr"
          ? "Et si tu pouvais faire ça 2× plus vite ?"
          : "What if you could do this 2× faster?",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    },
    {
      id: "clip_003",
      score: 0.41,
      durationSeconds: 98,
      subtitlesEnabled: true,
      status: "pending" as const,
      viralTitle:
        locale === "fr"
          ? "La partie que tout le monde rate"
          : "The part everyone misses",
      videoUrl: "",
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
              <div className="mt-4">
                <PipelineProgress
                  value={progress}
                  stages={stages.map((s) => ({
                    key: s,
                    label: t(`stages.${s}`),
                    status:
                      status === "failed" && s === stage
                        ? "failed"
                        : stages.indexOf(s) < stages.indexOf(stage)
                          ? "done"
                          : s === stage
                            ? "active"
                            : "pending",
                  }))}
                />
              </div>
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
              <div className="grid gap-4 sm:grid-cols-2">
                {clips.map((c) => (
                  <div
                    key={c.id}
                    className="w-full max-w-[360px] rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[var(--text)]">
                          {c.viralTitle}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span>{c.id}</span>
                          <span aria-hidden="true">•</span>
                          <span>{formatDuration(c.durationSeconds)}</span>
                          <span aria-hidden="true">•</span>
                          <span>{Math.round(c.score * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Badge variant={c.status === "ready" ? "success" : "warning"}>
                          {t(`clipStatus.${c.status}`)}
                        </Badge>
                        <Badge variant="secondary">
                          {c.subtitlesEnabled ? t("clips.subtitles.on") : t("clips.subtitles.off")}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[var(--surface-muted)]">
                      <div className="aspect-[9/16]">
                        {c.status === "ready" ? (
                          <video
                            controls
                            preload="metadata"
                            src={c.videoUrl}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Skeleton className="h-full w-full rounded-none" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-medium text-[var(--text-muted)]">
                          {t("clips.titleSuggestion")}
                        </div>
                        <CopyButton
                          text={c.viralTitle}
                          label={t("clips.copyTitle")}
                          copiedLabel={t("clips.copied")}
                        />
                      </div>
                      <div className="text-sm font-medium text-[var(--text)]">{c.viralTitle}</div>
                      <Link
                        href={`/${locale}/clips/${c.id}`}
                        className={buttonStyles({ variant: "ghost", size: "sm" })}
                      >
                        {t("clips.open")}
                      </Link>
                    </div>
                  </div>
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

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}


