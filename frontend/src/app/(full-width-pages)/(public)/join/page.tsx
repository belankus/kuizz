import JoinContent from "@/components/game/JoinContent";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

export default function JoinPage() {
  const t = useTranslations("Common");
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Suspense fallback={<div>{t("loading")}</div>}>
        <JoinContent />
      </Suspense>
    </div>
  );
}
