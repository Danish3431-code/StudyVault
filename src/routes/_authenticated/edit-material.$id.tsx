import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
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
  type Material,
} from "@/lib/materials";

export const Route = createFileRoute("/_authenticated/edit-material/$id")({
  head: () => ({
    meta: [
      { title: "Edit Material | Learnova" },
      { name: "description", content: "Update your study material details or replace its file." },
      { property: "og:title", content: "Edit Material | Learnova" },
      { property: "og:description", content: "Update your study material details." },
    ],
  }),
  component: EditMaterial,
});

function EditMaterial() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["material", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as Material) ?? null;
    },
  });

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setSubject(data.subject);
      setTopic(data.topic ?? "");
      setVisibility(data.visibility);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.user_id !== user?.id) {
    return (
      <p className="px-4 py-24 text-center text-sm text-muted-foreground">
        You are not authorized to access this material.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !data) return;
    setSaving(true);

    let filePath = data.file_path;
    let fileName = data.file_name;
    let fileType = data.file_type;
    let fileSize = data.file_size;
    const oldPath = data.file_path;

    if (file) {
      if (!isAllowedFile(file.name)) {
        setSaving(false);
        toast.error("Unsupported file type.");
        return;
      }
      const newPath = storagePath(user.id, file.name);
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(newPath, file);
      if (uploadError) {
        setSaving(false);
        toast.error("File upload failed.");
        return;
      }
      filePath = newPath;
      fileName = file.name;
      fileType = fileExtension(file.name);
      fileSize = file.size;
    }

    const { error } = await supabase
      .from("materials")
      .update({
        title: title.trim(),
        subject: subject.trim(),
        topic: topic.trim() || null,
        visibility,
        file_path: filePath,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
      })
      .eq("id", data.id);

    if (error) {
      setSaving(false);
      if (file) await supabase.storage.from(BUCKET).remove([filePath]);
      toast.error(error.message);
      return;
    }

    if (file && oldPath !== filePath) {
      await supabase.storage.from(BUCKET).remove([oldPath]);
    }

    setSaving(false);
    await queryClient.invalidateQueries({ queryKey: ["my-materials"] });
    await queryClient.invalidateQueries({ queryKey: ["material", data.id] });
    toast.success("Material updated successfully!");
    navigate({ to: "/my-materials" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold tracking-tight">Edit Material</h1>
          <p className="text-sm text-muted-foreground">Current file: {data.file_name}</p>
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
              <Label htmlFor="file">Replace File (optional)</Label>
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
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
