"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodePlaceholderClient({
  joinCode,
  baseUrl,
}: {
  joinCode: string;
  baseUrl: string;
}) {
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    setJoinUrl(`${baseUrl}/join?roomId=${joinCode}`);
  }, [baseUrl, joinCode]);

  // console.log("joinUrl", joinUrl);
  return <>{joinUrl && <QRCodeSVG value={joinUrl} />}</>;
}
