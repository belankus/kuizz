import AuthContainer from "@/components/auth/AuthContainer";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContainer mode="register" />
    </Suspense>
  );
}
