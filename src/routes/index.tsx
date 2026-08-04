import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen, Share2, Upload, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learnova — Share & Download Free Study Materials" },
      {
        name: "description",
        content:
          "Learnova lets students upload, organise and share study materials — PDFs, slides and notes — free, in one simple platform.",
      },
      { name: "keywords", content: "study materials, student notes, share PDF notes, free study resources, lecture slides" },
      { property: "og:title", content: "Learnova — Share & Download Free Study Materials" },
      {
        property: "og:description",
        content: "Learnova lets students upload, organise and share study materials — PDFs, slides and notes — free, in one simple platform.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://learn-stash-share.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Learnova — Share & Download Free Study Materials" },
      {
        name: "twitter:description",
        content: "Upload, organise and share study materials — PDFs, slides and notes — free.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://learn-stash-share.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Learnova",
          url: "https://learn-stash-share.lovable.app/",
          description:
            "Upload, manage, and share study materials in one simple platform built for students.",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://learn-stash-share.lovable.app/explore?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: Index,
});


const features = [
  {
    icon: Upload,
    title: "Upload Materials",
    text: "Add PDFs, slides, documents and images in seconds.",
    to: "/add-material",
  },
  {
    icon: FolderOpen,
    title: "Manage Your Files",
    text: "Edit, replace or delete your material anytime.",
    to: "/my-materials",
  },
  {
    icon: Share2,
    title: "Public Sharing",
    text: "Make a material public and share it with a link.",
    to: "/explore",
  },
  {
    icon: Zap,
    title: "Easy Access",
    text: "Your files stay in your account, available anywhere.",
    to: "/dashboard",
  },
];

function Index() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <span className="inline-block rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
          Study material hub
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Study. Store. <span className="text-primary">Share.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Upload, manage, and share your study materials in one simple platform.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link to="/explore">Explore Materials</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Link key={f.title} to={f.to} className="group block">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="pt-6">
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-base font-semibold">{f.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
