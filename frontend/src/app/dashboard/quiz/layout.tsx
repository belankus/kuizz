"use client";

import React from "react";

export default function QuizEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white">
      {children}
    </div>
  );
}
