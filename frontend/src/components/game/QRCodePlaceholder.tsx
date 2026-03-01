"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { APP_URL } from "@/lib/config";

export default function QRCodePlaceholder({ joinCode }: { joinCode: string }) {
  const baseUrl = APP_URL;
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    setJoinUrl(`${baseUrl}/join?roomId=${joinCode}`);
  }, [baseUrl, joinCode]);

  // console.log("joinUrl", joinUrl);
  return <>{joinUrl && <QRCodeSVG value={joinUrl} />}</>;
}
