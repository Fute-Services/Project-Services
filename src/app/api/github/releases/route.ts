import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get("repo")?.trim();
  if (!repo || !repo.includes("/")) {
    return NextResponse.json(
      { error: "repo query param required as owner/name" },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${repo}/releases?per_page=10`,
    { headers }
  );

  if (!res.ok) {
    const msg =
      res.status === 404
        ? "Repo ya releases nahi mile — repo naam check karo (owner/name)"
        : `GitHub API error: ${res.status}`;
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const data = await res.json();
  const releases = data.map((r: { tag_name: string; name: string | null; published_at: string }) => ({
    tag: r.tag_name,
    name: r.name || r.tag_name,
    publishedAt: r.published_at,
  }));

  return NextResponse.json({ releases });
}
