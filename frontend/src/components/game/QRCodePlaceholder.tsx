import QRCodePlaceholderClient from "./QRCodePlaceholderClient";

export default function QRCodePlaceholder({ joinCode }: { joinCode: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  // console.log("joinUrl", joinUrl);
  return <QRCodePlaceholderClient joinCode={joinCode} baseUrl={baseUrl} />;
}
