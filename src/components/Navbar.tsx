import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Menu, User, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VoiceCommand } from "@/components/VoiceCommand";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";


const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
];

const privateLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/my-materials", label: "My Materials" },
  { to: "/add-material", label: "Add Material" },
  { to: "/profile", label: "Profile" },
];

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: avatarUrl } = useQuery({
    queryKey: ["navbar-avatar", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user!.id)
        .maybeSingle();

      if (!profile?.avatar_url) return null;
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(profile.avatar_url, 60 * 60);
      return signed?.signedUrl ?? null;
    },
  });

  const links = user ? privateLinks : publicLinks;

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Logged out");
    setOpen(false);
    navigate({ to: "/", replace: true });
  }

  const avatar = (
    <Link
      to="/profile"
      aria-label="Go to profile"
      className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border bg-muted"
      onClick={() => setOpen(false)}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <User className="h-4 w-4 text-muted-foreground" />
      )}
    </Link>
  );


  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="text-lg tracking-tight">Study<span className="text-gradient-neon">Vault</span></span>
        </Link>


        <div className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === l.to && "text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
          <VoiceCommand />
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2 pl-2">
              {avatar}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>


        <div className="flex items-center gap-1 md:hidden">
          <VoiceCommand />
          <ThemeToggle />

          {user && avatar}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

      </nav>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" className="mt-2" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
