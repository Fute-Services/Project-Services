"use client";

import { useState } from "react";
import type { PlatformSettings } from "@/lib/clients";

const PLATFORM_LABELS = {
  windows: "Windows",
  mac: "Mac",
  android: "Android",
} as const;

export default function EditProjectForm({
  slug,
  initialTitle,
  initialDescription,
  initialIcon,
  initialPlatformSettings,
  initialBackground,
  onSaved,
  onCancel,
}: {
  slug: string;
  initialTitle: string;
  initialDescription: string;
  initialIcon: string;
  initialPlatformSettings: PlatformSettings;
  initialBackground: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState(initialIcon);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    initialPlatformSettings
  );
  const [background, setBackground] = useState(initialBackground);
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
    form.set("background", background);
    for (const platform of ["windows", "mac", "android"] as const) {
      form.set(`${platform}Enabled`, String(platformSettings[platform].enabled));
      form.set(`${platform}Label`, platformSettings[platform].label);
    }

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

      <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-3">
        <p className="text-xs text-neutral-500">
          Download buttons shown on the public page:
        </p>
        {(["windows", "mac", "android"] as const).map((platform) => (
          <div key={platform} className="flex items-center gap-2 text-xs">
            <label className="flex w-20 shrink-0 items-center gap-1.5">
              <input
                type="checkbox"
                checked={platformSettings[platform].enabled}
                onChange={(e) =>
                  setPlatformSettings((prev) => ({
                    ...prev,
                    [platform]: { ...prev[platform], enabled: e.target.checked },
                  }))
                }
              />
              {PLATFORM_LABELS[platform]}
            </label>
            <input
              value={platformSettings[platform].label}
              onChange={(e) =>
                setPlatformSettings((prev) => ({
                  ...prev,
                  [platform]: { ...prev[platform], label: e.target.value },
                }))
              }
              placeholder={`Download for ${PLATFORM_LABELS[platform]}`}
              className="flex-1 rounded-lg bg-neutral-900 px-2 py-1.5 outline-none placeholder:text-neutral-600"
            />
          </div>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Public page background (CSS color, e.g. #0a0a0a or transparent for default)
        <input
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          placeholder="Default"
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600"
        />
      </label>

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
