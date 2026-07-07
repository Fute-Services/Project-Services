"use client";

import { useState } from "react";
import type { ProjectDownloads } from "@/lib/clients";
import PlatformGithubPicker from "./platform-github-picker";

export default function AddVersionForm({
  slug,
  onCreated,
}: {
  slug: string;
  onCreated: () => void;
}) {
  const [version, setVersion] = useState("");
  const [windowsFile, setWindowsFile] = useState<File | null>(null);
  const [macFile, setMacFile] = useState<File | null>(null);
  const [androidFile, setAndroidFile] = useState<File | null>(null);
  const [githubUrls, setGithubUrls] = useState<Partial<ProjectDownloads>>({});
  const [githubRepo, setGithubRepo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleGithubApply(
    platform: keyof ProjectDownloads,
    url: string,
    ghVersion: string
  ) {
    setGithubUrls((prev) => ({ ...prev, [platform]: url }));
    if (ghVersion) setVersion(ghVersion);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!version.trim()) {
      setError("Enter a version number");
      return;
    }
    const hasAny =
      windowsFile || macFile || androidFile ||
      githubUrls.windows || githubUrls.mac || githubUrls.android;
    if (!hasAny) {
      setError("Upload at least one file or import from GitHub");
      return;
    }

    setSaving(true);
    setError("");

    const form = new FormData();
    form.set("version", version);
    if (windowsFile) form.set("windows", windowsFile);
    else if (githubUrls.windows) form.set("windowsUrl", githubUrls.windows);
    if (macFile) form.set("mac", macFile);
    else if (githubUrls.mac) form.set("macUrl", githubUrls.mac);
    if (androidFile) form.set("android", androidFile);
    else if (githubUrls.android) form.set("androidUrl", githubUrls.android);

    const res = await fetch(`/api/projects/${slug}/version`, {
      method: "POST",
      body: form,
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-800 p-4"
    >
      <input
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        placeholder="New version (e.g. 1.3.0)"
        className="rounded-lg bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-600"
      />

      <div className="grid grid-cols-3 gap-3 text-xs text-neutral-400">
        <label className="flex flex-col gap-1">
          Windows (.exe)
          <input
            type="file"
            accept=".exe,.msi"
            onChange={(e) => setWindowsFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          {githubUrls.windows && !windowsFile && (
            <span className="text-green-400">Linked from GitHub ✓</span>
          )}
          <PlatformGithubPicker
            platform="windows"
            repo={githubRepo}
            onRepoChange={setGithubRepo}
            onApply={(url, v) => handleGithubApply("windows", url, v)}
          />
        </label>
        <label className="flex flex-col gap-1">
          Mac (.dmg)
          <input
            type="file"
            accept=".dmg,.pkg"
            onChange={(e) => setMacFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          {githubUrls.mac && !macFile && (
            <span className="text-green-400">Linked from GitHub ✓</span>
          )}
          <PlatformGithubPicker
            platform="mac"
            repo={githubRepo}
            onRepoChange={setGithubRepo}
            onApply={(url, v) => handleGithubApply("mac", url, v)}
          />
        </label>
        <label className="flex flex-col gap-1">
          Android (.apk)
          <input
            type="file"
            accept=".apk"
            onChange={(e) => setAndroidFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          {githubUrls.android && !androidFile && (
            <span className="text-green-400">Linked from GitHub ✓</span>
          )}
          <PlatformGithubPicker
            platform="android"
            repo={githubRepo}
            onRepoChange={setGithubRepo}
            onApply={(url, v) => handleGithubApply("android", url, v)}
          />
        </label>
      </div>
      <p className="text-xs text-neutral-500">
        Leave a platform blank to keep its existing link.
      </p>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add Version"}
      </button>
    </form>
  );
}
