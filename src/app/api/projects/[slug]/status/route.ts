import { NextRequest, NextResponse } from "next/server";
import { updateProjectStatus, type ProjectStatus } from "@/lib/clients";

const VALID_STATUSES: ProjectStatus[] = ["in_progress", "delivered"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const project = updateProjectStatus(slug, status);
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update status" },
      { status: 400 }
    );
  }
}
