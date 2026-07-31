import { supabase } from "@/integrations/supabase/client";
import { BUCKET } from "./materials";

export async function getSignedUrl(path: string, download?: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 10, download ? { download } : undefined);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Could not access this file.");
  }
  return data.signedUrl;
}

export async function openFile(path: string) {
  const url = await getSignedUrl(path);
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function downloadFile(path: string, fileName: string) {
  const url = await getSignedUrl(path, fileName);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
