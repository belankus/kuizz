import Link from "next/link";

export default function HomePage() {
  return (
    <main className="from-fd-background to-fd-muted relative flex h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b px-4 text-center">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,80,255,0.08),transparent_50%)]" />

      <div className="animate-in fade-in slide-in-from-bottom-8 z-10 max-w-4xl duration-1000">
        <h1 className="from-fd-primary via-fd-secondary to-fd-accent mb-6 bg-linear-to-r bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          Kuizz Docs
        </h1>
        <p className="text-fd-muted-foreground mx-auto mb-10 max-w-2xl text-xl leading-relaxed sm:text-2xl">
          The ultimate guide to building, hosting, and scaling interactive
          quizzes for teams and events.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs/introduction/what-is-kuizz"
            className="bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90 focus-visible:outline-fd-primary inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold shadow-lg transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Get Started
          </Link>
          <Link
            href="/docs/developer/architecture-overview"
            className="border-fd-border bg-fd-background/50 text-fd-foreground hover:bg-fd-accent hover:text-fd-accent-foreground inline-flex h-12 items-center justify-center rounded-full border px-8 text-sm font-semibold shadow-sm backdrop-blur-sm transition-all"
          >
            Developer Guide
          </Link>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-12 z-10 mt-24 grid max-w-5xl grid-cols-1 gap-8 delay-200 duration-1200 md:grid-cols-3">
        {[
          {
            title: "Quick Quizzes",
            desc: "Learn how to create and manage interactive quizzes in seconds.",
            link: "/docs/user-guide/creating-quiz",
          },
          {
            title: "Open API",
            desc: "Integrate Kuizz into your own workflow with our powerful developer API.",
            link: "/docs/developer/api-overview",
          },
          {
            title: "Collaboration",
            desc: "Master shared question banks and collaborative quiz building.",
            link: "/docs/concepts/collaboration",
          },
        ].map((feature, i) => (
          <Link
            key={i}
            href={feature.link}
            className="border-fd-border bg-fd-background/40 hover:border-fd-primary/50 rounded-2xl border p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="text-fd-foreground mb-2 text-lg font-bold">
              {feature.title}
            </h3>
            <p className="text-fd-muted-foreground text-sm leading-relaxed">
              {feature.desc}
            </p>
          </Link>
        ))}
      </div>

      <div className="text-fd-muted-foreground animate-in fade-in absolute bottom-10 text-sm delay-500 duration-1000">
        Built with{" "}
        <span className="text-fd-primary font-semibold">Fumadocs</span> &{" "}
        <span className="text-fd-primary font-semibold">Next.js</span>
      </div>
    </main>
  );
}
