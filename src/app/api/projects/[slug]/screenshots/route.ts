import { NextRequest, NextResponse } from "next/server";
import { addProjectScreenshots, getProjectBySlug } from "@/lib/clients";
import { saveScreenshot } from "@/lib/upload";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const existing = await getProjectBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const form = await req.formData();
  const files = form.getAll("screenshots").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
  }

  const urls: string[] = [];
  for (const file of files) {
    urls.push(await saveScreenshot(file, existing.client.id, slug));
  }

  const project = await addProjectScreenshots(slug, urls);
  return NextResponse.json({ project });
}
