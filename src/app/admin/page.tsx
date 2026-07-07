"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CopyLinkButton from "./copy-link-button";
import AddClientForm from "./add-client-form";
import AddProjectForm from "./add-project-form";
import AddVersionForm from "./add-version-form";
import StatusSelect from "./status-select";
import WhatsAppShareButton from "./whatsapp-share-button";
import EmailShareButton from "./email-share-button";
import NotesEditor from "./notes-editor";
import ScreenshotsUploader from "./screenshots-uploader";
import type { ProjectStatus } from "@/lib/clients";

type Client = {
  id: string;
  name: string;
  projects: {
    slug: string;
    title: string;
    icon: string;
    version: string;
    status: ProjectStatus;
    expiresAt: string | null;
    notes: string;
    screenshots: string[];
    downloadCounts: { windows: number; mac: number; android: number };
    downloads: { windows: string | null; mac: string | null; android: string | null };
  }[];
};

export default function AdminPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProjectForm, setOpenProjectForm] = useState<string | null>(null);
  const [openVersionForm, setOpenVersionForm] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const query = search.trim().toLowerCase();
  const filteredClients = !query
    ? clients
    : clients
        .map((client) => {
          const clientMatches = client.name.toLowerCase().includes(query);
          const projects = clientMatches
            ? client.projects
            : client.projects.filter((p) =>
                p.title.toLowerCase().includes(query)
              );
          return { ...client, projects };
        })
        .filter(
          (client) =>
            client.name.toLowerCase().includes(query) ||
            client.projects.length > 0
        );

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">App Distribution Portal</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Add a new client, upload their apps, and share the link with
              them.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-neutral-400 hover:text-white"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <AddClientForm onCreated={loadClients} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or app..."
            className="min-w-[220px] flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-600"
          />
        </div>

        {loading && (
          <p className="mt-8 text-sm text-neutral-500">Loading...</p>
        )}

        {!loading && query && filteredClients.length === 0 && (
          <p className="mt-8 text-sm text-neutral-500">
            No matches for &quot;{search}&quot;.
          </p>
        )}

        <div className="mt-8 space-y-8">
          {filteredClients.map((client) => (
            <div key={client.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                    {client.name}
                  </h2>
                  <CopyLinkButton
                    slug={client.id}
                    path="c"
                    label="Client Portal Link"
                  />
                </div>
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
                    No apps yet - use &quot;+ Add App&quot; to upload the first one.
                  </p>
                )}
                {client.projects.map((project) => {
                  const platforms = Object.entries(project.downloads)
                    .filter(([, url]) => url)
                    .map(([platform]) => platform);
                  const totalDownloads =
                    project.downloadCounts.windows +
                    project.downloadCounts.mac +
                    project.downloadCounts.android;

                  return (
                    <div key={project.slug} className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {project.icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.icon}
                              alt={`${project.title} icon`}
                              className="h-9 w-9 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-xs font-semibold">
                              {project.title.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{project.title}</p>
                              <StatusSelect
                                slug={project.slug}
                                status={project.status}
                                onChanged={loadClients}
                              />
                            </div>
                            <p className="text-xs text-neutral-500">
                              v{project.version} · {platforms.join(", ") || "no files yet"}{" "}
                              · {totalDownloads} download{totalDownloads === 1 ? "" : "s"}
                              {project.expiresAt &&
                                ` · expires ${new Date(project.expiresAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setOpenVersionForm(
                                openVersionForm === project.slug ? null : project.slug
                              )
                            }
                            className="shrink-0 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
                          >
                            {openVersionForm === project.slug ? "Cancel" : "+ Version"}
                          </button>
                          <WhatsAppShareButton slug={project.slug} title={project.title} />
                          <EmailShareButton slug={project.slug} title={project.title} />
                          <CopyLinkButton slug={project.slug} />
                        </div>
                      </div>

                      {openVersionForm === project.slug && (
                        <div className="mt-3">
                          <AddVersionForm
                            slug={project.slug}
                            onCreated={() => {
                              setOpenVersionForm(null);
                              loadClients();
                            }}
                          />
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-4">
                        <NotesEditor slug={project.slug} initialNotes={project.notes} />
                        <ScreenshotsUploader slug={project.slug} onUploaded={loadClients} />
                        {project.screenshots.length > 0 && (
                          <span className="text-xs text-neutral-600">
                            {project.screenshots.length} screenshot
                            {project.screenshots.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!loading && clients.length === 0 && (
          <p className="mt-10 text-sm text-neutral-500">
            No clients yet - add your first one above.
          </p>
        )}
      </div>
    </main>
  );
}
