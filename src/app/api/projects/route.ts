import { NextRequest, NextResponse } from "next/server";
import { addProject, generateUniqueSlug, type Platform } from "@/lib/clients";
import { saveFile } from "@/lib/upload";

const PLATFORMS: Platform[] = ["windows", "mac", "android"];

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const clientId = String(form.get("clientId") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const version = String(form.get("version") ?? "").trim();
  const expiresAt = String(form.get("expiresAt") ?? "").trim();

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
    const url = String(form.get(`${platform}Url`) ?? "").trim();
    if (file instanceof File && file.size > 0) {
      downloads[platform] = await saveFile(file, clientId, projectSlug, platform);
    } else if (url) {
      downloads[platform] = url;
    }
  }

  try {
    const project = addProject(clientId, {
      slug: projectSlug,
      title,
      description,
      version: version || "1.0.0",
      downloads,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add project" },
      { status: 400 }
    );
  }
}
