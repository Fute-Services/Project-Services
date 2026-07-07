import { NextRequest, NextResponse } from "next/server";

function guessPlatform(filename: string): "windows" | "mac" | "android" | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".exe") || lower.endsWith(".msi")) return "windows";
  if (lower.endsWith(".dmg") || lower.endsWith(".pkg")) return "mac";
  if (lower.endsWith(".apk")) return "android";
  return null;
}

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get("repo")?.trim();
  const tag = req.nextUrl.searchParams.get("tag")?.trim();

  if (!repo || !repo.includes("/") || !tag) {
    return NextResponse.json(
      { error: "repo (owner/name) and tag query params required" },
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
    `https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`,
    { headers }
  );

  if (!res.ok) {
    const msg =
      res.status === 404
        ? "Ye release nahi mila"
        : `GitHub API error: ${res.status}`;
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const data = await res.json();
  const assets = (data.assets ?? []).map(
    (a: { name: string; browser_download_url: string; size: number }) => ({
      name: a.name,
      url: a.browser_download_url,
      size: a.size,
      guessedPlatform: guessPlatform(a.name),
    })
  );

  return NextResponse.json({ assets, version: (data.tag_name as string).replace(/^v/, "") });
}
