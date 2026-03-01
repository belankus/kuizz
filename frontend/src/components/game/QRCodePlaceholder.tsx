import QRCodePlaceholderClient from "./QRCodePlaceholderClient";

export default function QRCodePlaceholder({ joinCode }: { joinCode: string }) {
  const baseUrl = process.env.APP_URL || "";

  // console.log("joinUrl", joinUrl);
  return <QRCodePlaceholderClient joinCode={joinCode} baseUrl={baseUrl} />;
}
