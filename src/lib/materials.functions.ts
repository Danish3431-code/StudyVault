import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type MaterialMetadata =
  | null
  | {
      id: string;
      isPublic: false;
    }
  | {
      id: string;
      title: string;
      subject: string;
      topic: string | null;
      fileType: string;
      createdAt: string;
      author: string | null;
      isPublic: true;
    };

export const getMaterialMetadata = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<MaterialMetadata> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: material, error } = await supabaseAdmin
      .from("materials")
      .select("id, title, subject, topic, visibility, created_at, file_type, user_id, profiles(username, full_name)")
      .eq("id", data.id)
      .maybeSingle();

    if (error || !material) return null;

    if (material.visibility !== "public") {
      return { id: material.id, isPublic: false };
    }

    return {
      id: material.id,
      title: material.title,
      subject: material.subject,
      topic: material.topic,
      fileType: material.file_type,
      createdAt: material.created_at,
      author: material.profiles?.username ?? material.profiles?.full_name ?? null,
      isPublic: true,
    };
  });
