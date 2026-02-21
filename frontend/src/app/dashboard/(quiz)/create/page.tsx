"use client";

import dynamic from "next/dynamic";

const CreatePage = dynamic(() => import("./PageClientCreate"), {
  ssr: false,
});

export default function Page() {
  return <CreatePage />;
}
