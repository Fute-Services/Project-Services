"use client";

import { useState } from "react";

export default function EditProjectForm({
  slug,
  initialTitle,
  initialDescription,
  initialIcon,
  onSaved,
  onCancel,
}: {
  slug: string;
  initialTitle: string;
  initialDescription: string;
  initialIcon: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState(initialIcon);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Enter the app name");
      return;
    }

    setSaving(true);
    setError("");

    const form = new FormData();
    form.set("title", title);
    form.set("description", description);
    if (iconFile) form.set("icon", iconFile);

    const res = await fetch(`/api/projects/${slug}/details`, {
      method: "PATCH",
      body: form,
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-800 p-4"
    >
      <div className="flex items-center gap-3">
        {iconPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconPreview}
            alt="App icon preview"
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-xs text-neutral-600">
            Icon
          </div>
        )}
        <label className="text-xs text-neutral-400">
          App icon
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setIconFile(file);
              setIconPreview(file ? URL.createObjectURL(file) : initialIcon);
            }}
            className="mt-1 block text-xs"
          />
        </label>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="App name"
        className="rounded-lg bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-600"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description"
        className="rounded-lg bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-600"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
