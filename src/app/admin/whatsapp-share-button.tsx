"use client";

export default function WhatsAppShareButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  function handleClick() {
    const url = `${window.location.origin}/p/${slug}`;
    const text = encodeURIComponent(`${title} - download link: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      className="shrink-0 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
    >
      WhatsApp
    </button>
  );
}
