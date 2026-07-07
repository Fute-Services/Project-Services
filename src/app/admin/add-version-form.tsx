"use client";

import { useState } from "react";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!version.trim()) {
      setError("Version number daalo");
      return;
    }
    if (!windowsFile && !macFile && !androidFile) {
      setError("Kam se kam ek file upload karo");
      return;
    }

    setSaving(true);
    setError("");

    const form = new FormData();
    form.set("version", version);
    if (windowsFile) form.set("windows", windowsFile);
    if (macFile) form.set("mac", macFile);
    if (androidFile) form.set("android", androidFile);

    const res = await fetch(`/api/projects/${slug}/version`, {
      method: "POST",
      body: form,
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Kuch galat ho gaya");
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
        placeholder="Naya version (e.g. 1.3.0)"
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
        </label>
        <label className="flex flex-col gap-1">
          Mac (.dmg)
          <input
            type="file"
            accept=".dmg,.pkg"
            onChange={(e) => setMacFile(e.target.files?.[0] ?? null)}
            className="text-xs"
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
        </label>
      </div>
      <p className="text-xs text-neutral-500">
        Jo platform ki file nahi doge, uska purana link wahi rahega.
      </p>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
      >
        {saving ? "Uploading..." : "Add Version"}
      </button>
    </form>
  );
}
