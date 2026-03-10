"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/lib/auth";
import LoadingCircle from "@/components/common/LoadingCircle";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    // 1. Jika token ada di URL (fallback atau request khusus) -> Set cookie
    if (token) {
      setAccessToken(token);
      router.replace("/dashboard");
      return;
    }

    // 2. Jika tidak ada di URL, cek apakah sudah ada cookie (backend yang set)
    const hasCookie = document.cookie.includes("accessToken=");
    if (hasCookie) {
      router.replace("/dashboard");
    } else {
      // 3. Jika benar-benar tidak ada -> Gagal
      router.replace("/login?error=oauth_failed");
    }
  }, [router, searchParams]);

  return <LoadingCircle>Memproses login...</LoadingCircle>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}
