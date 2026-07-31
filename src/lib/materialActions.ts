import { supabase } from "@/integrations/supabase/client";
import { BUCKET } from "./materials";

export async function deleteMaterial(id: string, filePath: string) {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await supabase.storage.from(BUCKET).remove([filePath]);
}
