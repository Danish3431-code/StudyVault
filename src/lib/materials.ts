export type Visibility = "public" | "private";

export type Material = {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  topic: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  visibility: string;
  created_at: string;
  updated_at: string;
};

export const BUCKET = "study-materials";

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "txt",
  "png",
  "jpg",
  "jpeg",
];

export const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

export function fileExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function isAllowedFile(name: string) {
  return ALLOWED_EXTENSIONS.includes(fileExtension(name));
}

export function formatSize(bytes: number) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function storagePath(userId: string, fileName: string) {
  return `${userId}/${Date.now()}_${sanitizeFileName(fileName)}`;
}
