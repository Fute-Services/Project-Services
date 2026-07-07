"use client";

import { useState } from "react";
import type { ProjectDownloads } from "@/lib/clients";

type Release = { tag: string; name: string; publishedAt: string };
type Asset = {
  name: string;
  url: string;
  size: number;
  guessedPlatform: "windows" | "mac" | "android" | null;
};

export default function GithubReleasePicker({
  onApply,
}: {
  onApply: (downloads: Partial<ProjectDownloads>, version: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [repo, setRepo] = useState("");
  const [releases, setReleases] = useState<Release[]>([]);
  const [loadedTags, setLoadedTags] = useState<string[]>([]);
  const [assetsByTag, setAssetsByTag] = useState<Record<string, Asset[]>>({});
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Assets pooled across every release the user has loaded, so Windows can
  // come from one release and Android from another without overwriting.
  const assets: (Asset & { tag: string })[] = loadedTags.flatMap((tag) =>
    (assetsByTag[tag] ?? []).map((a) => ({ ...a, tag }))
  );

  async function loadReleases() {
    if (!repo.includes("/")) {
      setError("Repo format: owner/name (e.g. Fute-Services/Project-Services)");
      return;
    }
    setLoading(true);
    setError("");
    setReleases([]);
    setLoadedTags([]);
    setAssetsByTag({});
    setAssignments({});

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
    if (loadedTags.includes(tag)) return;

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

    setAssetsByTag((prev) => ({ ...prev, [tag]: data.assets }));
    setLoadedTags((prev) => [...prev, tag]);
    setVersion(data.version);

    // Auto-map by file extension — one-tap default, still overridable below.
    setAssignments((prev) => {
      const next = { ...prev };
      for (const asset of data.assets as Asset[]) {
        if (asset.guessedPlatform && !next[asset.guessedPlatform]) {
          next[asset.guessedPlatform] = asset.url;
        }
      }
      return next;
    });
  }

  function handleApply() {
    onApply(
      {
        windows: assignments.windows ?? null,
        mac: assignments.mac ?? null,
        android: assignments.android ?? null,
      },
      version
    );
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-neutral-300 underline hover:text-white"
      >
Or import from a GitHub Release
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 p-4">
      <div className="flex gap-2">
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="owner/repo (e.g. Fute-Services/Project-Services)"
          className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={loadReleases}
          disabled={loading}
          className="shrink-0 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Releases"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {releases.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-neutral-500">
            Load a release to pull in its assets — load more than one if
            Windows/Mac/Android files live in different releases:
          </p>
          {releases.map((r) => {
            const isLoaded = loadedTags.includes(r.tag);
            return (
              <button
                key={r.tag}
                type="button"
                onClick={() => loadAssets(r.tag)}
                disabled={loading || isLoaded}
                className="flex items-center justify-between rounded-lg bg-neutral-900 px-3 py-2 text-left text-xs hover:bg-neutral-800 disabled:opacity-60"
              >
                <span>
                  {r.name} <span className="text-neutral-500">({r.tag})</span>
                </span>
                <span className="text-neutral-500">
                  {isLoaded ? "Loaded" : "Load assets"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {assets.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 text-neutral-400">Version</span>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="flex-1 rounded-lg bg-neutral-900 px-2 py-1.5 outline-none"
            />
          </div>

          <p className="text-xs text-neutral-500">
            Auto-detected (by file extension) — override if needed:
          </p>
          {(["windows", "mac", "android"] as const).map((platform) => (
            <div key={platform} className="flex items-center gap-2 text-xs">
              <span className="w-16 shrink-0 capitalize text-neutral-400">{platform}</span>
              <select
                value={assignments[platform] ?? ""}
                onChange={(e) =>
                  setAssignments((prev) => ({ ...prev, [platform]: e.target.value }))
                }
                className="flex-1 rounded-lg bg-neutral-900 px-2 py-1.5 outline-none"
              >
                <option value="">— none —</option>
                {assets.map((a) => (
                  <option key={a.url} value={a.url}>
                    [{a.tag}] {a.name}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            type="button"
            onClick={handleApply}
            className="mt-1 self-start rounded-lg bg-white px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-200"
          >
            Use these links
          </button>
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
