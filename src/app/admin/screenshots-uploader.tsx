"use client";

import { useState } from "react";

export default function ScreenshotsUploader({
  slug,
  onUploaded,
}: {
  slug: string;
  onUploaded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!files || files.length === 0) {
      setError("Kam se kam ek image choose karo");
      return;
    }
    setSaving(true);
    setError("");

    const form = new FormData();
    Array.from(files).forEach((f) => form.append("screenshots", f));

    const res = await fetch(`/api/projects/${slug}/screenshots`, {
      method: "POST",
      body: form,
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload fail ho gaya");
      return;
    }

    setFiles(null);
    setOpen(false);
    onUploaded();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-neutral-500 hover:text-neutral-300"
      >
        + Screenshots
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="text-xs"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUpload}
          disabled={saving}
          className="rounded-lg bg-neutral-800 px-3 py-1 text-xs font-medium hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "Uploading..." : "Upload"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
