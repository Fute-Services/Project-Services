"use client";

import { useState } from "react";
import QRCode from "qrcode";

export default function QrCodeButton({ slug }: { slug: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleClick() {
    if (!dataUrl) {
      const url = `${window.location.origin}/p/${slug}`;
      const generated = await QRCode.toDataURL(url, { margin: 1, width: 220 });
      setDataUrl(generated);
    }
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="shrink-0 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
      >
        QR
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setOpen(false)}
        >
          <div
            className="rounded-2xl bg-white p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {dataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt="Project QR code" width={220} height={220} />
            )}
            <p className="mt-3 text-sm text-neutral-600">
              Scan karke app ka page kholo
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
