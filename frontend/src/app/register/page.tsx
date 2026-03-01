import AuthContainer from "@/components/auth/AuthContainer";
import { Suspense } from "react";

export default function RegisterPage() {
  const apiUrl = process.env.API_URL;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContainer mode="register" apiUrl={apiUrl || ""} />
    </Suspense>
  );
}
