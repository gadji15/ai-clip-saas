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
import { Skeleton } from "@/ui/primitives/Skeleton";

export default async function ClipDetailsPage({
  params,
}: {
  // params is a promise in Next.js async route handlers — await it.
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("clip");

  const processing = 64;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/clips`}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            {t("back")}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title", { id })}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning">{t("status.processing")}</Badge>
          <Button variant="primary" disabled>
            {t("actions.download")}
          </Button>
        </div>
      </div>

      <p className="text-sm text-slate-600">{t("subtitle")}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("preview.title")}</CardTitle>
            <CardDescription>{t("preview.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <div className="aspect-video">
                <Skeleton className="h-full w-full rounded-none" />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-800">
                  {t("progress.title")}
                </div>
                <div className="text-sm text-slate-600">
                  {t("progress.value", { value: processing })}
                </div>
              </div>
              <div className="mt-3">
                <Progress value={processing} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("meta.title")}</CardTitle>
              <CardDescription>{t("meta.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <MetaRow label={t("meta.clipId")} value={id} />
                <MetaRow label={t("meta.created")} value="—" />
                <MetaRow label={t("meta.duration")} value="—" />
                <MetaRow label={t("meta.format")} value="mp4" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("actions.title")}</CardTitle>
              <CardDescription>{t("actions.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Button disabled>{t("actions.copyLink")}</Button>
                <Button disabled>{t("actions.openInNewTab")}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-slate-500">{label}</div>
      <div className="truncate font-medium text-slate-800">{value}</div>
    </div>
  );
}
