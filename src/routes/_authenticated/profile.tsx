import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Save, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarCropDialog } from "@/components/AvatarCropDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile | StudyVault" },
      { name: "description", content: "View and update your StudyVault profile details." },
      { property: "og:title", content: "Profile | StudyVault" },
      { property: "og:description", content: "View and update your profile details." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Profile,
});

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [profileRes, countRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase
          .from("materials")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("visibility", "public"),
      ]);
      if (profileRes.error) throw profileRes.error;
      const profile = profileRes.data as {
        full_name: string;
        username: string | null;
        avatar_url: string | null;
      } | null;

      let avatarSignedUrl: string | null = null;
      if (profile?.avatar_url) {
        const { data: signed } = await supabase.storage
          .from("avatars")
          .createSignedUrl(profile.avatar_url, 60 * 60);
        avatarSignedUrl = signed?.signedUrl ?? null;
      }

      return {
        profile,
        avatarSignedUrl,
        publicCount: countRes.count ?? 0,
      };
    },
  });

  useEffect(() => {
    if (data?.profile) {
      setFullName(data.profile.full_name ?? "");
      setUsername(data.profile.username ?? "");
    }
  }, [data]);

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be smaller than 2 MB.");
      return;
    }

    setPendingFile(file);
  }

  async function uploadAvatar(blob: Blob) {
    if (!user) return;

    setPendingFile(null);
    setAvatarPreview(URL.createObjectURL(blob));
    setUploading(true);

    const path = `${user.id}/avatar-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

    if (uploadError) {
      setUploading(false);
      setAvatarPreview(null);
      toast.error(uploadError.message);
      return;
    }

    const previousPath = data?.profile?.avatar_url ?? null;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", user.id);

    setUploading(false);

    if (updateError) {
      setAvatarPreview(null);
      toast.error(updateError.message);
      return;
    }

    if (previousPath && previousPath !== path) {
      await supabase.storage.from("avatars").remove([previousPath]);
    }

    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    await queryClient.invalidateQueries({ queryKey: ["navbar-avatar"] });
    setAvatarPreview(null);
    toast.success("Profile picture updated!");
  }


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), username: username.trim() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile updated successfully!");
  }

  const avatarSrc = avatarPreview ?? data?.avatarSignedUrl ?? null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={`${fullName || "User"} profile picture`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {avatarSrc ? "Change photo" : "Upload photo"}
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    JPG or PNG, up to 2 MB. You can crop, zoom and rotate before saving.
                  </p>
                </div>
              </div>

              <AvatarCropDialog
                file={pendingFile}
                open={!!pendingFile}
                onCancel={() => setPendingFile(null)}
                onCropped={uploadAvatar}
              />


              <div className="mb-6 rounded-lg bg-muted/60 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total Public Materials
                </p>
                <p className="mt-1 text-2xl font-bold">{data?.publicCount ?? 0}</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
