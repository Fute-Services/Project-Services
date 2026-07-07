"use client";

import { useEffect, useState } from "react";
import CopyLinkButton from "./copy-link-button";
import AddClientForm from "./add-client-form";
import AddProjectForm from "./add-project-form";

type Client = {
  id: string;
  name: string;
  projects: {
    slug: string;
    title: string;
    version: string;
    downloads: { windows: string | null; mac: string | null; android: string | null };
  }[];
};

export default function AdminPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProjectForm, setOpenProjectForm] = useState<string | null>(null);

  async function loadClients() {
    setLoading(true);
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data.clients);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-semibold">App Distribution Portal</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Naya client add karo, uske apps upload karo, aur client ko link
          share karo.
        </p>

        <div className="mt-8">
          <AddClientForm onCreated={loadClients} />
        </div>

        {loading && (
          <p className="mt-8 text-sm text-neutral-500">Loading...</p>
        )}

        <div className="mt-8 space-y-8">
          {clients.map((client) => (
            <div key={client.id}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  {client.name}
                </h2>
                <button
                  onClick={() =>
                    setOpenProjectForm(
                      openProjectForm === client.id ? null : client.id
                    )
                  }
                  className="text-xs font-medium text-neutral-300 hover:text-white"
                >
                  {openProjectForm === client.id ? "Cancel" : "+ Add App"}
                </button>
              </div>

              {openProjectForm === client.id && (
                <div className="mt-3">
                  <AddProjectForm
                    clientId={client.id}
                    onCreated={() => {
                      setOpenProjectForm(null);
                      loadClients();
                    }}
                  />
                </div>
              )}

              <div className="mt-3 divide-y divide-neutral-800 rounded-xl border border-neutral-800">
                {client.projects.length === 0 && (
                  <p className="px-4 py-3 text-xs text-neutral-500">
                    Abhi koi app nahi hai — &quot;+ Add App&quot; se pehla app upload karo.
                  </p>
                )}
                {client.projects.map((project) => {
                  const platforms = Object.entries(project.downloads)
                    .filter(([, url]) => url)
                    .map(([platform]) => platform);

                  return (
                    <div
                      key={project.slug}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-xs text-neutral-500">
                          v{project.version} · {platforms.join(", ") || "no files yet"}
                        </p>
                      </div>
                      <CopyLinkButton slug={project.slug} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!loading && clients.length === 0 && (
          <p className="mt-10 text-sm text-neutral-500">
            Abhi koi client add nahi hua — upar se pehla client add karo.
          </p>
        )}
      </div>
    </main>
  );
}
