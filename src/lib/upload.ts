import fs from "fs";
import path from "path";
import type { Platform } from "@/lib/clients";

export async function saveFile(
  file: File,
  clientId: string,
  projectSlug: string,
  platform: Platform
): Promise<string> {
  const ext = path.extname(file.name) || "";
  const dir = path.join(process.cwd(), "public", "uploads", clientId, projectSlug);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${platform}-${Date.now()}${ext}`;
  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${clientId}/${projectSlug}/${filename}`;
}

export async function saveScreenshot(
  file: File,
  clientId: string,
  projectSlug: string
): Promise<string> {
  const ext = path.extname(file.name) || ".png";
  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    clientId,
    projectSlug,
    "screenshots"
  );
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${clientId}/${projectSlug}/screenshots/${filename}`;
}
