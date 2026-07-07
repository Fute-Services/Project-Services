"use client";

import { useEffect, useRef, useState } from "react";

const FALLBACK = "/logo.png";

export default function AppIcon({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The browser can start loading (and failing) the image before React
  // hydrates and attaches onError, so also check on mount whether it had
  // already finished loading with no natural size (i.e. failed silently).
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={failed ? FALLBACK : src}
      alt={alt}
      className={className}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}
