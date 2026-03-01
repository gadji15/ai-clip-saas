import { getTranslations } from "next-intl/server";

import { ClipsIndex } from "./ui/ClipsIndex";

export default async function ClipsPage() {
  const t = await getTranslations("clips");

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-sm text-slate-600">{t("subtitle")}</p>

      <ClipsIndex />
    </div>
  );
}
