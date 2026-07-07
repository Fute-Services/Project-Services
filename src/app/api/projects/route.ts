import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { addProject, generateUniqueSlug } from "@/lib/clients";

const PLATFORMS = ["windows", "mac", "android"] as const;
type Platform = (typeof PLATFORMS)[number];

async function saveFile(
  file: File,
  clientId: string,
  projectSlug: string,
  platform: Platform
): Promise<string> {
  const ext = path.extname(file.name) || "";
  const dir = path.join(process.cwd(), "public", "uploads", clientId, projectSlug);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${platform}${ext}`;
  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${clientId}/${projectSlug}/${filename}`;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const clientId = String(form.get("clientId") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const version = String(form.get("version") ?? "").trim();

  if (!clientId || !title) {
    return NextResponse.json(
      { error: "clientId and title are required" },
      { status: 400 }
    );
  }

  const projectSlug = generateUniqueSlug(title);

  const downloads: Record<Platform, string | null> = {
    windows: null,
    mac: null,
    android: null,
  };

  for (const platform of PLATFORMS) {
    const file = form.get(platform);
    if (file instanceof File && file.size > 0) {
      downloads[platform] = await saveFile(file, clientId, projectSlug, platform);
    }
  }

  try {
    const project = addProject(clientId, {
      slug: projectSlug,
      title,
      description,
      version: version || "1.0.0",
      downloads,
    });
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add project" },
      { status: 400 }
    );
  }
}
