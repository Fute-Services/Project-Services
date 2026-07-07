"use client";

export default function EmailShareButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  function handleClick() {
    const url = `${window.location.origin}/p/${slug}`;
    const subject = encodeURIComponent(`${title} — download link`);
    const body = encodeURIComponent(`Link to download ${title}:\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <button
      onClick={handleClick}
      className="shrink-0 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
    >
      Email
    </button>
  );
}
