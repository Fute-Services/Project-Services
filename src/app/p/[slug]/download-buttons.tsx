"use client";

import { useEffect, useState } from "react";
import type { ProjectDownloads, PlatformSettings } from "@/lib/clients";

type Platform = "windows" | "mac" | "android";

const DEFAULT_LABELS: Record<Platform, string> = {
  windows: "Download for Windows",
  mac: "Download for Mac",
  android: "Download for Android",
};

function detectPlatform(): Platform | null {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("android")) return "android";
  return null;
}

export default function DownloadButtons({
  slug,
  downloads,
  platformSettings,
}: {
  slug: string;
  downloads: ProjectDownloads;
  platformSettings?: PlatformSettings;
}) {
  const [detected, setDetected] = useState<Platform | null>(null);

  useEffect(() => {
    setDetected(detectPlatform());
  }, []);

  const LABELS: Record<Platform, string> = {
    windows: platformSettings?.windows.label || DEFAULT_LABELS.windows,
    mac: platformSettings?.mac.label || DEFAULT_LABELS.mac,
    android: platformSettings?.android.label || DEFAULT_LABELS.android,
  };

  const platforms = (Object.keys(DEFAULT_LABELS) as Platform[]).filter(
    (p) => downloads[p] && (platformSettings?.[p]?.enabled ?? true)
  );

  if (platforms.length === 0) {
    return (
      <p className="mt-10 text-sm text-neutral-500">
        No downloads available for this app.
      </p>
    );
  }

  return (
    <div className="mt-10 flex flex-col gap-3">
      {platforms.map((platform) => {
        const isPrimary = platform === detected;
        return (
          <a
            key={platform}
            href={`/api/download/${slug}/${platform}`}
            className={
              "w-full rounded-xl px-5 py-3 text-sm font-medium transition-colors " +
              (isPrimary
                ? "bg-white text-neutral-900 hover:bg-neutral-200"
                : "bg-neutral-800 text-neutral-100 hover:bg-neutral-700")
            }
          >
            {LABELS[platform]}
          </a>
        );
      })}
      {detected && (
        <p className="mt-1 text-xs text-neutral-500">
          Your device: {LABELS[detected].replace("Download for ", "")}
        </p>
      )}
    </div>
  );
}
