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
    if (token) {
      setAccessToken(token);
      router.replace("/dashboard");
    } else {
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
