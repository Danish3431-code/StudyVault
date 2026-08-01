import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MaterialCard } from "@/components/MaterialCard";
import { supabase } from "@/integrations/supabase/client";
import type { Material } from "@/lib/materials";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Free Study Materials & Notes | Learnova" },
      {
        name: "description",
        content:
          "Browse, search and download free public study materials, lecture notes and slides shared by students on Learnova.",
      },
      {
        property: "og:title",
        content: "Explore Free Study Materials & Notes | Learnova",
      },
      {
        property: "og:description",
        content:
          "Browse and download public study materials shared by students.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://learn-stash-share.lovable.app/explore",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Explore Free Study Materials & Notes | Learnova",
      },
      {
        name: "twitter:description",
        content:
          "Browse and download public study materials shared by students.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://learn-stash-share.lovable.app/explore" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Explore Study Materials",
          description: "Public study materials shared by the Learnova community.",
        }),
      },
    ],
  }),
  component: Explore,
});


type Row = Material & { profiles: { username: string | null; full_name: string } | null };

function Explore() {
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*, profiles(username, full_name)")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  const q = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((m) =>
    !q
      ? true
      : [m.title, m.subject, m.topic ?? ""].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Explore Materials</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Public study materials shared by the community.
      </p>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, subject or topic"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="py-16 text-center text-sm text-destructive">
          Could not load materials. Please try again.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No public materials found.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              author={m.profiles?.username ?? m.profiles?.full_name ?? "Unknown"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
