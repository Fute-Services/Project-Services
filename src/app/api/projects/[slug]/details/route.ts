import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug, updateProjectDetails } from "@/lib/clients";
import { saveIcon } from "@/lib/upload";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const existing = await getProjectBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();

  if (!title) {
    return NextResponse.json({ error: "App name is required" }, { status: 400 });
  }

  const iconFile = form.get("icon");
  const icon =
    iconFile instanceof File && iconFile.size > 0
      ? await saveIcon(iconFile, existing.client.id, slug)
      : undefined;

  try {
    const project = await updateProjectDetails(slug, { title, description, icon });
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update project" },
      { status: 400 }
    );
  }
}
