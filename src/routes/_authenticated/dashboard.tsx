import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, FolderOpen, Globe, Loader2, Lock, Plus, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, type Material } from "@/lib/materials";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Learnova" },
      {
        name: "description",
        content:
          "Your Learnova dashboard with study material statistics and recent uploads.",
      },
      { property: "og:title", content: "Dashboard | Learnova" },
      {
        property: "og:description",
        content: "Your study material statistics at a glance.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://learn-stash-share.lovable.app/dashboard",
      },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Dashboard | Learnova" },
      {
        name: "twitter:description",
        content: "Your study material statistics at a glance.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://learn-stash-share.lovable.app/dashboard",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["my-materials", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Material[];
    },
  });

  const materials = data ?? [];
  const publicCount = materials.filter((m) => m.visibility === "public").length;

  const stats = [
    { label: "Total Materials", value: materials.length, icon: Files },
    { label: "Public Materials", value: publicCount, icon: Globe },
    { label: "Private Materials", value: materials.length - publicCount, icon: Lock },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">Overview of your study materials.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/add-material">
            <Plus className="mr-2 h-4 w-4" /> Add Material
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/my-materials">
            <FolderOpen className="mr-2 h-4 w-4" /> My Materials
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/explore">
            <Compass className="mr-2 h-4 w-4" /> Explore Materials
          </Link>
        </Button>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Recently uploaded</h2>
      {isLoading ? (
        <div className="flex justify-center py-14">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : materials.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">
          No materials yet. Upload your first one.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {materials.slice(0, 5).map((m) => (
            <Card key={m.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{m.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {m.subject} · {m.file_type.toUpperCase()} · {formatDate(m.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.visibility === "public" ? "default" : "secondary"}>
                    {m.visibility === "public" ? "Public" : "Private"}
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/material/$id" params={{ id: m.id }}>
                      View
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
