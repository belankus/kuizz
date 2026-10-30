"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function GameAlreadyStarted() {
  const router = useRouter();
  const t = useTranslations("Game");

  const handleBack = () => {
    localStorage.removeItem("playerToken");
    localStorage.removeItem("nickname");
    localStorage.removeItem("roomCode");
    router.push("/join");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-yellow-500 px-6 text-black">
      <h1 className="text-4xl font-bold">{t("alreadyStarted")}</h1>
      <p className="mt-4 text-center">
        {t("cannotJoinInProgress")}
      </p>

      <button
        onClick={handleBack}
        className="mt-8 rounded-lg bg-black px-6 py-3 font-semibold text-white shadow hover:bg-black/80"
      >
        ← {t("backToJoin")}
      </button>
    </div>
  );
}
