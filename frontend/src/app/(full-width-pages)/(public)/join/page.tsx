import JoinContent from "@/components/game/JoinContent";
import { Suspense } from "react";

export default async function JoinPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Suspense fallback={<div>Loading...</div>}>
        <JoinContent />
      </Suspense>
    </div>
  );
}
