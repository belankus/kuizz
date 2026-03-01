import AuthContainer from "@/components/auth/AuthContainer";
import LoadingCircle from "@/components/common/LoadingCircle";
import { Suspense } from "react";

export default function RegisterPage() {
  const apiUrl = process.env.API_URL;
  return (
    <Suspense fallback={<LoadingCircle>Loading...</LoadingCircle>}>
      <AuthContainer mode="register" apiUrl={apiUrl || ""} />
    </Suspense>
  );
}
