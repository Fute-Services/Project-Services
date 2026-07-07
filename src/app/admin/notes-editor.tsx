"use client";

import { useState } from "react";

export default function NotesEditor({
  slug,
  initialNotes,
}: {
  slug: string;
  initialNotes: string;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/projects/${slug}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-neutral-500 hover:text-neutral-300"
      >
        {initialNotes ? "Note ✎" : "+ Note"}
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Private note (sirf aapko dikhega) — e.g. payment pending, redesign needed..."
        rows={2}
        className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-xs outline-none placeholder:text-neutral-600"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-neutral-800 px-3 py-1 text-xs font-medium hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
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
