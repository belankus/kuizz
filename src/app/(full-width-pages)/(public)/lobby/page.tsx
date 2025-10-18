import LobbyContent from "@/components/public/LobbyContent";
import { redirect } from "next/navigation";

export default async function LobbyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filter = (await searchParams).quizId;

  if (!filter || filter.length < 1) redirect("/");

  const joinCode = "897 4212"; // contoh PIN yang besar

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LobbyContent joinCode={joinCode} />
    </div>
  );
}
