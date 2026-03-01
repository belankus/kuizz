import AuthContainer from "@/components/auth/AuthContainer";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthContainer mode="login" />
    </Suspense>
  );
}
