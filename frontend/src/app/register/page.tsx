import AuthContainer from "@/components/auth/AuthContainer";
import LoadingCircle from "@/components/common/LoadingCircle";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("Common");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return (
    <Suspense fallback={<LoadingCircle>{t("loading")}</LoadingCircle>}>
      <AuthContainer mode="register" apiUrl={apiUrl} />
    </Suspense>
  );
}
