import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { downloadFile, openFile } from "@/lib/fileAccess";
import { deleteMaterial } from "@/lib/materialActions";
import { formatDate, formatSize, type Material } from "@/lib/materials";

export const Route = createFileRoute("/_authenticated/my-materials")({
  head: () => ({
    meta: [
      { title: "My Materials | Learnova" },
      { name: "description", content: "Manage, edit and delete your uploaded study materials." },
      { property: "og:title", content: "My Materials | Learnova" },
      { property: "og:description", content: "Manage your uploaded study materials." },
    ],
  }),
  component: MyMaterials,
});

function MyMaterials() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [target, setTarget] = useState<Material | null>(null);

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

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(null);
  }

  async function confirmDelete() {
    if (!target) return;
    await run("delete", async () => {
      await deleteMaterial(target.id, target.file_path);
      await queryClient.invalidateQueries({ queryKey: ["my-materials"] });
      toast.success("Material deleted successfully!");
    });
    setTarget(null);
  }

  const materials = data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Materials</h1>
          <p className="mt-2 text-sm text-muted-foreground">Everything you have uploaded.</p>
        </div>
        <Button asChild>
          <Link to="/add-material">
            <Plus className="mr-2 h-4 w-4" /> Add Material
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : materials.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No materials yet. Upload your first one.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardHeader className="gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold break-words">{m.title}</h2>
                  <Badge variant={m.visibility === "public" ? "default" : "secondary"}>
                    {m.visibility === "public" ? "Public" : "Private"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {m.subject}
                  {m.topic ? ` · ${m.topic}` : ""}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="break-words text-sm text-muted-foreground">
                  {m.file_name} · {m.file_type.toUpperCase()} · {formatSize(m.file_size)} ·{" "}
                  {formatDate(m.created_at)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => run(`open-${m.id}`, () => openFile(m.file_path))}
                    disabled={busy === `open-${m.id}`}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      run(`dl-${m.id}`, () => downloadFile(m.file_path, m.file_name))
                    }
                    disabled={busy === `dl-${m.id}`}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <Link to="/edit-material/$id" params={{ id: m.id }}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setTarget(m)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{target?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the record and the uploaded file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={busy === "delete"}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
