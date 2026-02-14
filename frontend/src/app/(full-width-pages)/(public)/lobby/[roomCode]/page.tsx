import LobbyContent from "@/components/public/LobbyPlayerContent";
import { redirect } from "next/navigation";

interface PageProps {
  params: {
    roomCode: string;
  };
}

export default async function LobbyPage({ params }: PageProps) {
  const { roomCode } = await params;

  if (!roomCode || roomCode.length < 6) redirect("/");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LobbyContent joinCode={formatRoomCode(roomCode)} />
    </div>
  );
}

// optional formatting helper
function formatRoomCode(code: string) {
  return code.replace(/(\d{3})(\d{4})/, "$1 $2");
}
