import GameContainer from "@/components/game/GameContainer";

interface PageProps {
  params: {
    roomCode: string;
  };
}

export default function GamePage({ params }: PageProps) {
  const { roomCode } = params;

  return <GameContainer roomCode={roomCode} />;
}
