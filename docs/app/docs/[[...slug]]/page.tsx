import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/page";
import { source } from "@/lib/source";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { mdxComponents } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;

  const filePath = slug ? slug.join("/") : "index";

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      editOnGithub={{
        owner: "belankus",
        repo: "kuizz",
        sha: "main",
        path: `docs/content/docs/${filePath}.mdx`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents, ...mdxComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  return {
    title: `${page.data.title} — Kuizz Docs`,
    description: page.data.description,
    openGraph: {
      title: `${page.data.title} — Kuizz Docs`,
      description: page.data.description,
      url: `https://docs.kuizz.my.id/docs/${slug?.join("/") ?? ""}`,
      siteName: "Kuizz Docs",
    },
  };
}
