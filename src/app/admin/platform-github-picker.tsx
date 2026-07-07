"use client";

import { useState } from "react";

type Release = { tag: string; name: string; publishedAt: string };
type Asset = {
  name: string;
  url: string;
  size: number;
  guessedPlatform: "windows" | "mac" | "android" | null;
};

export default function PlatformGithubPicker({
  platform,
  repo,
  onRepoChange,
  onApply,
}: {
  platform: "windows" | "mac" | "android";
  repo: string;
  onRepoChange: (repo: string) => void;
  onApply: (url: string, version: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReleases() {
    if (!repo.includes("/")) {
      setError("Repo format: owner/name (e.g. Fute-Services/Project-Services)");
      return;
    }
    setLoading(true);
    setError("");
    setReleases([]);
    setAssets([]);
    setSelectedTag("");

    const res = await fetch(`/api/github/releases?repo=${encodeURIComponent(repo)}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to load releases");
      return;
    }
    setReleases(data.releases);
    if (data.releases.length === 0) {
      setError("No releases found in this repo");
    }
  }

  async function loadAssets(tag: string) {
    setSelectedTag(tag);
    setAssets([]);
    setLoading(true);
    setError("");

    const res = await fetch(
      `/api/github/release-assets?repo=${encodeURIComponent(repo)}&tag=${encodeURIComponent(tag)}`
    );
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to load assets");
      return;
    }
    setAssets(data.assets);
  }

  function handleApply(asset: Asset) {
    const release = releases.find((r) => r.tag === selectedTag);
    const version = release ? release.tag.replace(/^v/, "") : "";
    onApply(asset.url, version);
    setLinked(true);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left text-xs text-neutral-500 underline hover:text-neutral-300"
      >
        {linked ? "Re-import from GitHub" : "+ Import from GitHub"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-2">
      <div className="flex gap-1">
        <input
          value={repo}
          onChange={(e) => onRepoChange(e.target.value)}
          placeholder="owner/repo"
          className="min-w-0 flex-1 rounded bg-neutral-900 px-2 py-1 text-xs outline-none placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={loadReleases}
          disabled={loading}
          className="shrink-0 rounded bg-neutral-800 px-2 py-1 text-xs hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "..." : "Load"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {releases.length > 0 && (
        <select
          value={selectedTag}
          onChange={(e) => loadAssets(e.target.value)}
          className="rounded bg-neutral-900 px-2 py-1 text-xs outline-none"
        >
          <option value="">Choose a release...</option>
          {releases.map((r) => (
            <option key={r.tag} value={r.tag}>
              {r.name} ({r.tag})
            </option>
          ))}
        </select>
      )}

      {assets.length > 0 && (
        <div className="flex flex-col gap-1">
          {assets.map((a) => (
            <button
              key={a.url}
              type="button"
              onClick={() => handleApply(a)}
              className={`rounded px-2 py-1 text-left text-xs hover:bg-neutral-700 ${
                a.guessedPlatform === platform ? "bg-neutral-800" : "bg-neutral-900 text-neutral-500"
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="self-start text-xs text-neutral-500 hover:text-neutral-300"
      >
        Cancel
      </button>
    </div>
  );
}
