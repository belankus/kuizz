import AuthContainer from "@/components/auth/AuthContainer";
import LoadingCircle from "@/components/common/LoadingCircle";
import { Suspense } from "react";

export default function RegisterPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return (
    <Suspense fallback={<LoadingCircle>Loading...</LoadingCircle>}>
      <AuthContainer mode="register" apiUrl={apiUrl} />
    </Suspense>
  );
}
