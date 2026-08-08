import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type PageCommand = { keywords: string[]; to: string; label: string; auth?: boolean };

const PAGES: PageCommand[] = [
  { keywords: ["home", "main page", "landing"], to: "/", label: "Home" },
  { keywords: ["explore", "browse", "search materials", "public"], to: "/explore", label: "Explore" },
  { keywords: ["dashboard", "stats", "statistics"], to: "/dashboard", label: "Dashboard", auth: true },
  { keywords: ["my materials", "my files", "manage"], to: "/my-materials", label: "My Materials", auth: true },
  { keywords: ["add material", "upload", "new material"], to: "/add-material", label: "Add Material", auth: true },
  { keywords: ["profile", "account", "my picture"], to: "/profile", label: "Profile", auth: true },
  { keywords: ["login", "sign in", "log in"], to: "/login", label: "Login" },
  { keywords: ["sign up", "signup", "register", "create account"], to: "/signup", label: "Sign Up" },
];

function getRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function VoiceCommand() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    setSupported(!!getRecognition());
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  async function handleTranscript(raw: string) {
    const text = raw.toLowerCase().trim();
    if (!text) return;

    const cleaned = text
      .replace(/^(hey |ok |please )?(learnova|lernova)?[,\s]*/i, "")
      .replace(/^(open|go to|show|take me to|navigate to|find|search for|look for|play)\s+(the\s+)?(document|file|material|notes)?\s*(called|named|titled)?\s*/i, "")
      .trim();

    const page = PAGES.find((p) => p.keywords.some((k) => cleaned.includes(k)));
    if (page) {
      if (page.auth && !user) {
        toast.error("Please log in first.");
        navigate({ to: "/login" });
        return;
      }
      toast.success(`Opening ${page.label}`);
      navigate({ to: page.to });
      return;
    }

    // Try to find a document/material by title / subject / topic
    const term = cleaned
      .replace(/\b(the|a|an|document|doc|file|material|materials|notes?|pdf|slides?)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (term.length >= 2) {
      const pattern = `%${term.replace(/[%_,]/g, " ")}%`;
      const filter = user
        ? `and(visibility.eq.public,or(title.ilike.${pattern},subject.ilike.${pattern},topic.ilike.${pattern})),and(user_id.eq.${user.id},or(title.ilike.${pattern},subject.ilike.${pattern},topic.ilike.${pattern}))`
        : undefined;

      let query = supabase.from("materials").select("id, title, subject, topic, visibility, user_id");
      query = filter
        ? query.or(filter)
        : query
            .eq("visibility", "public")
            .or(`title.ilike.${pattern},subject.ilike.${pattern},topic.ilike.${pattern}`);

      const { data } = await query.limit(25);

      const words = term.split(" ").filter((w) => w.length > 1);
      const score = (m: { title: string; subject: string; topic: string | null }) => {
        const title = m.title.toLowerCase();
        const hay = `${title} ${m.subject.toLowerCase()} ${(m.topic ?? "").toLowerCase()}`;
        let s = 0;
        if (title === term) s += 100;
        if (title.includes(term)) s += 50;
        if (hay.includes(term)) s += 20;
        s += words.filter((w) => title.includes(w)).length * 8;
        s += words.filter((w) => hay.includes(w)).length * 3;
        return s;
      };

      const best = (data ?? [])
        .map((m) => ({ m, s: score(m as any) }))
        .sort((a, b) => b.s - a.s)[0];

      if (best && best.s > 0) {
        const hit = best.m;
        const mine = user && hit.user_id === user.id && hit.visibility !== "public";
        toast.success(`Opening "${hit.title}"${mine ? " (your material)" : ""}`);
        navigate({ to: "/material/$id", params: { id: hit.id } });
        return;
      }
    }

    toast.error(`No match for "${raw}". Try "open dashboard" or a document name.`);
  }

  function toggle() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      toast.error("Voice recognition isn't supported in this browser.");
      return;
    }
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (e: any) => {
      setListening(false);
      if (e?.error === "not-allowed") toast.error("Microphone permission denied.");
      else if (e?.error !== "aborted") toast.error("Could not hear you. Try again.");
    };
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      void handleTranscript(transcript);
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }

  if (!supported) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={listening ? "Stop voice command" : "Start voice command"}
      title='Voice command — say "open dashboard" or a document name'
      className={cn(listening && "text-primary animate-pulse")}
    >
      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </Button>
  );
}
