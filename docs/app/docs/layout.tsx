import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="text-lg font-bold">
            Kuizz<span className="text-primary"> Docs</span>
          </span>
        ),
        url: "/docs",
      }}
      sidebar={{
        banner: null,
      }}
      links={[
        {
          text: "Dashboard",
          url: "https://kuizz.my.id",
          external: true,
        },
        {
          text: "GitHub",
          url: "https://github.com/belankus/kuizz",
          external: true,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
