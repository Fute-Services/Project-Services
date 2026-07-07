import { NextRequest, NextResponse } from "next/server";
import {
  getProjectBySlug,
  incrementDownloadCount,
  isExpired,
  type Platform,
} from "@/lib/clients";
import { sendDownloadEmail } from "@/lib/notify";

const VALID_PLATFORMS: Platform[] = ["windows", "mac", "android"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; platform: string }> }
) {
  const { slug, platform } = await params;

  if (!VALID_PLATFORMS.includes(platform as Platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const result = await getProjectBySlug(slug);
  if (!result) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { project } = result;

  if (isExpired(project)) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  const fileUrl = project.downloads[platform as Platform];
  if (!fileUrl) {
    return NextResponse.json({ error: "File not available" }, { status: 404 });
  }

  const updated = await incrementDownloadCount(slug, platform as Platform);

  if (updated) {
    sendDownloadEmail(updated.client, updated.project, platform as Platform).catch(
      () => {
        // Email is a best-effort notification; failures must not block the download.
      }
    );
  }

  const absoluteUrl = fileUrl.startsWith("http")
    ? fileUrl
    : new URL(fileUrl, req.url).toString();

  return NextResponse.redirect(absoluteUrl);
}
