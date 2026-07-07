import { NextRequest, NextResponse } from "next/server";
import { updateProjectNotes } from "@/lib/clients";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { notes } = await req.json();

  try {
    const project = await updateProjectNotes(slug, String(notes ?? ""));
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update notes" },
      { status: 400 }
    );
  }
}
