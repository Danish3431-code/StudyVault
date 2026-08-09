import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | StudyVault" },
      {
        name: "description",
        content: "Reset your StudyVault password and get back to your study materials.",
      },
      { property: "og:title", content: "Reset Password | StudyVault" },
      { property: "og:description", content: "Reset your StudyVault password." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://learn-stash-share.lovable.app/reset-password" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Reset Password | StudyVault" },
      { name: "twitter:description", content: "Reset your StudyVault password." },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://learn-stash-share.lovable.app/reset-password" }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent — check your inbox.");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <Card className="surface-glass glow-neon">
        <CardHeader className="gap-1">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
            Account recovery
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Reset your <span className="text-gradient-neon">password</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            We'll email you a secure link to set a new password.
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="text-foreground">{email}</span>, a reset link
              is on its way.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="bg-background/40 focus-visible:ring-neon"
                />
              </div>
              <Button type="submit" className="w-full glow-primary" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link to="/login" className="font-medium text-foreground underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
