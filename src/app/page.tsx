import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Deliver apps to your clients, simply and securely.
        </h1>
        <p className="mt-4 max-w-xl text-neutral-400">
          A private link for every client - where they can see the latest
          version, screenshots, and notes for their apps.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin/login"
            className="rounded-lg bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-950 hover:bg-white"
          >
            Admin Login
          </Link>
        </div>

        <div className="mt-20 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 p-5">
            <p className="font-medium">Client Portals</p>
            <p className="mt-1 text-sm text-neutral-500">
              Each client gets their own private link.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-5">
            <p className="font-medium">Version Tracking</p>
            <p className="mt-1 text-sm text-neutral-500">
              Manage Windows, Mac, and Android builds in one place.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-5">
            <p className="font-medium">Share Instantly</p>
            <p className="mt-1 text-sm text-neutral-500">
              Share straight to a client via WhatsApp or email.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
