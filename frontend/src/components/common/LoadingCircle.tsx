export default function LoadingCircle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500" />
        <p className="text-gray-600 dark:text-gray-400">{children}</p>
      </div>
    </div>
  );
}
