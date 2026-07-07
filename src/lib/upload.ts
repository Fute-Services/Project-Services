import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import type { Platform } from "@/lib/clients";

// On Vercel the filesystem is read-only outside /tmp, so uploads go to Vercel
// Blob there. Locally (no BLOB_READ_WRITE_TOKEN configured), fall back to
// writing into public/uploads so `npm run dev` keeps working without cloud
// credentials.
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

async function store(key: string, file: File): Promise<string> {
  if (useBlob) {
    const blob = await put(key, file, { access: "public", addRandomSuffix: false });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", path.dirname(key));
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(process.cwd(), "public", key);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
  return `/${key}`;
}

export async function saveFile(
  file: File,
  clientId: string,
  projectSlug: string,
  platform: Platform
): Promise<string> {
  const ext = path.extname(file.name) || "";
  const filename = `${platform}-${Date.now()}${ext}`;
  return store(`uploads/${clientId}/${projectSlug}/${filename}`, file);
}

export async function saveScreenshot(
  file: File,
  clientId: string,
  projectSlug: string
): Promise<string> {
  const ext = path.extname(file.name) || ".png";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  return store(`uploads/${clientId}/${projectSlug}/screenshots/${filename}`, file);
}

export async function saveIcon(
  file: File,
  clientId: string,
  projectSlug: string
): Promise<string> {
  const ext = path.extname(file.name) || ".png";
  const filename = `icon-${Date.now()}${ext}`;
  return store(`uploads/${clientId}/${projectSlug}/${filename}`, file);
}
