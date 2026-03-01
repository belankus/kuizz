import AuthContainer from "@/components/auth/AuthContainer";
import { Suspense } from "react";

export default function LoginPage() {
  const apiUrl = process.env.API_URL;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContainer mode="login" apiUrl={apiUrl || ""} />
    </Suspense>
  );
}
