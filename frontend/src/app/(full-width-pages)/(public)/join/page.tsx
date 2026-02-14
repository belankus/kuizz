import JoinContent from "@/components/game/JoinContent";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let roomId: string = "";
  const filter = (await searchParams).roomId as string;
  if (filter && filter.length > 1) roomId = filter;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <JoinContent roomId={roomId} />
    </div>
  );
}
