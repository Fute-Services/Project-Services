"use client";

import { useState } from "react";

export default function CopyLinkButton({
  slug,
  path = "p",
  label = "Copy Link",
}: {
  slug: string;
  path?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/${path}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
