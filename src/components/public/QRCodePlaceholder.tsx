"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodePlaceholder({ joinCode }: { joinCode: string }) {
  const baseUrl = process.env.APP_IP;
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    setJoinUrl(`${baseUrl}/join?sessionId=${joinCode}`);
  });

  // console.log("joinUrl", joinUrl);
  return <>{joinUrl && <QRCodeSVG value={joinUrl} />}</>;
}
