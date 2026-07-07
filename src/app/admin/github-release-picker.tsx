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
  const [selectedTag, setSelectedTag] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [version, setVersion] = useState("");
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

    const res = await fetch(`/api/github/releases?repo=${encodeURIComponent(repo)}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Releases load nahi hue");
      return;
    }
    setReleases(data.releases);
    if (data.releases.length === 0) {
      setError("Is repo me koi release nahi mila");
    }
  }

  async function loadAssets(tag: string) {
    setSelectedTag(tag);
    setLoading(true);
    setError("");

    const res = await fetch(
      `/api/github/release-assets?repo=${encodeURIComponent(repo)}&tag=${encodeURIComponent(tag)}`
    );
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Assets load nahi hue");
      return;
    }

    setAssets(data.assets);
    setVersion(data.version);

    // Auto-map by file extension — one-tap default, still overridable below.
    const auto: Record<string, string> = {};
    for (const asset of data.assets as Asset[]) {
      if (asset.guessedPlatform && !auto[asset.guessedPlatform]) {
        auto[asset.guessedPlatform] = asset.url;
      }
    }
    setAssignments(auto);
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
        Ya GitHub Release se import karo
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
        <select
          value={selectedTag}
          onChange={(e) => loadAssets(e.target.value)}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm outline-none"
        >
          <option value="">Release choose karo...</option>
          {releases.map((r) => (
            <option key={r.tag} value={r.tag}>
              {r.name} ({r.tag})
            </option>
          ))}
        </select>
      )}

      {assets.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-neutral-500">
            Auto-detected (extension ke hisab se) — chaho to badal do:
          </p>
          {(["windows", "mac", "android"] as const).map((platform) => (
            <div key={platform} className="flex items-center gap-2 text-xs">
              <span className="w-16 capitalize text-neutral-400">{platform}</span>
              <select
                value={assignments[platform] ?? ""}
                onChange={(e) =>
                  setAssignments((prev) => ({ ...prev, [platform]: e.target.value }))
                }
                className="flex-1 rounded-lg bg-neutral-900 px-2 py-1.5 outline-none"
              >
                <option value="">— none —</option>
                {assets.map((a) => (
                  <option key={a.name} value={a.url}>
                    {a.name}
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
