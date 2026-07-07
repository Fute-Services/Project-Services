import { NextRequest, NextResponse } from "next/server";
import {
  addProjectVersion,
  getProjectBySlug,
  type Platform,
} from "@/lib/clients";
import { saveFile } from "@/lib/upload";

const PLATFORMS: Platform[] = ["windows", "mac", "android"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const existing = getProjectBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const form = await req.formData();
  const version = String(form.get("version") ?? "").trim();

  if (!version) {
    return NextResponse.json({ error: "version is required" }, { status: 400 });
  }

  const downloads: Record<Platform, string | null> = {
    windows: null,
    mac: null,
    android: null,
  };

  for (const platform of PLATFORMS) {
    const file = form.get(platform);
    if (file instanceof File && file.size > 0) {
      downloads[platform] = await saveFile(
        file,
        existing.client.id,
        slug,
        platform
      );
    }
  }

  try {
    const project = addProjectVersion(slug, { version, downloads });
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add version" },
      { status: 400 }
    );
  }
}
