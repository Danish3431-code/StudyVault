import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  ACCEPT_ATTR,
  BUCKET,
  fileExtension,
  isAllowedFile,
  storagePath,
} from "@/lib/materials";

export const Route = createFileRoute("/_authenticated/add-material")({
  head: () => ({
    meta: [
      { title: "Upload Materials | StudyVault" },
      {
        name: "description",
        content:
          "Upload PDFs, slides, notes and other study materials to your StudyVault account.",
      },
      { property: "og:title", content: "Upload Materials | StudyVault" },
      {
        property: "og:description",
        content:
          "Upload PDFs, slides, notes and other study materials to your StudyVault account.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://learn-stash-share.lovable.app/add-material",
      },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Upload Materials | StudyVault" },
      {
        name: "twitter:description",
        content:
          "Upload PDFs, slides, notes and other study materials to your StudyVault account.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://learn-stash-share.lovable.app/add-material",
      },
    ],
  }),
  component: AddMaterial,
});

function AddMaterial() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!file) {
      toast.error("Please select a file.");
      return;
    }
    if (!isAllowedFile(file.name)) {
      toast.error("Unsupported file type.");
      return;
    }

    setLoading(true);
    const path = storagePath(user.id, file.name);
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
    if (uploadError) {
      setLoading(false);
      toast.error("File upload failed.");
      return;
    }

    const { error } = await supabase.from("materials").insert({
      user_id: user.id,
      title: title.trim(),
      subject: subject.trim(),
      topic: topic.trim() || null,
      file_name: file.name,
      file_path: path,
      file_type: fileExtension(file.name),
      file_size: file.size,
      visibility,
    });
    setLoading(false);

    if (error) {
      await supabase.storage.from(BUCKET).remove([path]);
      toast.error(error.message);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["my-materials"] });
    toast.success("Material uploaded successfully!");
    navigate({ to: "/my-materials" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold tracking-tight">Add Material</h1>
          <p className="text-sm text-muted-foreground">
            Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, PNG, JPG, JPEG.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Material Title</Label>
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">File Upload</Label>
              <Input
                id="file"
                type="file"
                accept={ACCEPT_ATTR}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="cursor-pointer file:mr-3 file:cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload Material
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
