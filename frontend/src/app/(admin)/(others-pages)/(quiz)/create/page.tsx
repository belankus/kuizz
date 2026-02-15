"use client";

import dynamic from "next/dynamic";

const CreatePage = dynamic(() => import("./PageClient"), {
  ssr: false,
});

export default function Page() {
  return <CreatePage />;
}
