"use client";

import { useState } from "react";
import type { ProjectStatus } from "@/lib/clients";

const LABELS: Record<ProjectStatus, string> = {
  in_progress: "In Progress",
  delivered: "Delivered",
  pending_payment: "Pending Payment",
};

const COLORS: Record<ProjectStatus, string> = {
  in_progress: "bg-blue-500/20 text-blue-300",
  delivered: "bg-green-500/20 text-green-300",
  pending_payment: "bg-amber-500/20 text-amber-300",
};

export default function StatusSelect({
  slug,
  status,
  onChanged,
}: {
  slug: string;
  status: ProjectStatus;
  onChanged: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ProjectStatus;
    setSaving(true);
    await fetch(`/api/projects/${slug}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    onChanged();
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`rounded-md border-none px-2 py-1 text-xs font-medium outline-none ${COLORS[status]}`}
    >
      {(Object.keys(LABELS) as ProjectStatus[]).map((key) => (
        <option key={key} value={key} className="bg-neutral-900 text-neutral-100">
          {LABELS[key]}
        </option>
      ))}
    </select>
  );
}
