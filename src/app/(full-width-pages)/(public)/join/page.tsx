import JoinContent from "@/components/public/JoinContent";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let sessionId: string = "";
  const filter = (await searchParams).sessionId as string;
  if (filter && filter.length > 1) sessionId = filter;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <JoinContent sessionId={sessionId} />
    </div>
  );
}
