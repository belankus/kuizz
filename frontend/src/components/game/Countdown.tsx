"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function Countdown() {
  const t = useTranslations("Game");
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) return;

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 text-white">
      <div className="text-center">
        <div className="text-lg opacity-80">{t("startingIn")}</div>
        <div
          key={count}
          className="animate-scale-in mt-6 text-9xl font-extrabold"
        >
          {count === 0 ? t("go") : count}
        </div>
      </div>
    </div>
  );
}
