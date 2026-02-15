"use client";

import dynamic from "next/dynamic";

const CreatePage = dynamic(() => import("./PageClientEdit"), {
  ssr: false,
});

export default function Page() {
  return <CreatePage />;
}
