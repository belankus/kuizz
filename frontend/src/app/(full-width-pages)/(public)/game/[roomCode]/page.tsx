import GameContainer from "@/components/game/GameContainer";

interface PageProps {
  params: Promise<{
    roomCode: string;
  }>;
}

export default async function GamePage({ params }: PageProps) {
  const { roomCode } = await params;

  return <GameContainer roomCode={roomCode} />;
}
