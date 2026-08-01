import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Download,
  ExternalLink,
  Link2,
  Loader2,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
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

export const Route = createFileRoute("/material/$id")({
  head: () => ({
    meta: [
      { title: "Study Material Details | Learnova" },
      { name: "description", content: "View, download and share a study material posted on Learnova." },
      { property: "og:title", content: "Study Material Details | Learnova" },
      { property: "og:description", content: "View and download a study material on Learnova." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
    ],
  }),

  component: MaterialDetails,
});

type Row = Material & { profiles: { username: string | null; full_name: string } | null };

function MaterialDetails() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["material", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*, profiles(username, full_name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Row) ?? null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">You are not authorized to access this material.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may be private or no longer exist.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/explore">Back to Explore</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === data.user_id;
  const isPublic = data.visibility === "public";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  async function share() {
    const shareData = { title: data!.title, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelled */
      }
    } else {
      await copyLink();
    }
  }

  async function handleOpen() {
    setBusy("open");
    try {
      await openFile(data!.file_path);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(null);
  }

  async function handleDownload() {
    setBusy("download");
    try {
      await downloadFile(data!.file_path, data!.file_name);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(null);
  }

  async function handleDelete() {
    setBusy("delete");
    try {
      await deleteMaterial(data!.id, data!.file_path);
      toast.success("Material deleted successfully!");
      navigate({ to: "/my-materials" });
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(null);
    setConfirmOpen(false);
  }

  const rows = [
    ["Subject", data.subject],
    ["Topic", data.topic || "—"],
    ["Author", data.profiles?.username ?? data.profiles?.full_name ?? "Unknown"],
    ["File Name", data.file_name],
    ["File Type", data.file_type.toUpperCase()],
    ["File Size", formatSize(data.file_size)],
    ["Uploaded", formatDate(data.created_at)],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight break-words">{data.title}</h1>
            <Badge variant={isPublic ? "default" : "secondary"}>
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-muted/60 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleOpen} disabled={busy === "open"}>
              {busy === "open" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              View / Open
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={busy === "download"}>
              {busy === "download" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download
            </Button>
            <Button variant="outline" onClick={copyLink}>
              <Link2 className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" onClick={share}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            {isOwner && (
              <>
                <Button variant="secondary" asChild>
                  <Link to="/edit-material/$id" params={{ id: data.id }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this material?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the record and the uploaded file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={busy === "delete"}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
