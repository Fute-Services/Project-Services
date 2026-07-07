import fs from "fs";
import path from "path";

export type Platform = "windows" | "mac" | "android";

export type ProjectDownloads = {
  windows: string | null;
  mac: string | null;
  android: string | null;
};

export type ProjectStatus = "in_progress" | "delivered";

export type VersionEntry = {
  version: string;
  downloads: ProjectDownloads;
  createdAt: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  version: string;
  icon: string;
  downloads: ProjectDownloads;
  downloadCounts: Record<Platform, number>;
  versions: VersionEntry[];
  status: ProjectStatus;
  expiresAt: string | null;
  screenshots: string[];
  notes: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  name: string;
  projects: Project[];
};

type Data = { clients: Client[] };

const DATA_PATH = path.join(process.cwd(), "data", "clients.json");

function readData(): Data {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Data;
}

function writeData(data: Data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getAllClients(): Client[] {
  return readData().clients;
}

export function getProjectBySlug(
  slug: string
): { client: Client; project: Project } | null {
  const clients = readData().clients;
  for (const client of clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) return { client, project };
  }
  return null;
}

export function getClientById(id: string): Client | null {
  return readData().clients.find((c) => c.id === id) ?? null;
}

export function isExpired(project: Project): boolean {
  if (!project.expiresAt) return false;
  return new Date(project.expiresAt).getTime() < Date.now();
}

export function addClient(name: string): Client {
  const data = readData();
  let id = slugify(name);
  let suffix = 2;
  while (data.clients.some((c) => c.id === id)) {
    id = `${slugify(name)}-${suffix++}`;
  }
  const client: Client = { id, name, projects: [] };
  data.clients.push(client);
  writeData(data);
  return client;
}

export function generateUniqueSlug(title: string): string {
  const data = readData();
  const allSlugs = new Set(
    data.clients.flatMap((c) => c.projects.map((p) => p.slug))
  );
  let slug = slugify(title);
  let suffix = 2;
  while (allSlugs.has(slug)) {
    slug = `${slugify(title)}-${suffix++}`;
  }
  return slug;
}

export function addProject(
  clientId: string,
  input: {
    slug: string;
    title: string;
    description: string;
    version: string;
    downloads: ProjectDownloads;
    expiresAt?: string | null;
    screenshots?: string[];
  }
): Project {
  const data = readData();
  const client = data.clients.find((c) => c.id === clientId);
  if (!client) throw new Error("Client not found");

  const now = new Date().toISOString();

  const project: Project = {
    slug: input.slug,
    title: input.title,
    description: input.description,
    version: input.version,
    icon: "",
    downloads: input.downloads,
    downloadCounts: { windows: 0, mac: 0, android: 0 },
    versions: [{ version: input.version, downloads: input.downloads, createdAt: now }],
    status: "in_progress",
    expiresAt: input.expiresAt ?? null,
    screenshots: input.screenshots ?? [],
    notes: "",
    updatedAt: now,
  };

  client.projects.push(project);
  writeData(data);
  return project;
}

export function addProjectVersion(
  slug: string,
  input: { version: string; downloads: ProjectDownloads }
): Project {
  const data = readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      const now = new Date().toISOString();
      // Merge: keep previous platform links if this version didn't upload a file for that platform
      const mergedDownloads: ProjectDownloads = {
        windows: input.downloads.windows ?? project.downloads.windows,
        mac: input.downloads.mac ?? project.downloads.mac,
        android: input.downloads.android ?? project.downloads.android,
      };
      project.version = input.version;
      project.downloads = mergedDownloads;
      project.versions.push({
        version: input.version,
        downloads: input.downloads,
        createdAt: now,
      });
      project.updatedAt = now;
      writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export function updateProjectStatus(
  slug: string,
  status: ProjectStatus
): Project {
  const data = readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.status = status;
      project.updatedAt = new Date().toISOString();
      writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export function updateProjectNotes(slug: string, notes: string): Project {
  const data = readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.notes = notes;
      project.updatedAt = new Date().toISOString();
      writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export function addProjectScreenshots(
  slug: string,
  newScreenshots: string[]
): Project {
  const data = readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.screenshots = [...project.screenshots, ...newScreenshots];
      project.updatedAt = new Date().toISOString();
      writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export function updateProjectExpiry(
  slug: string,
  expiresAt: string | null
): Project {
  const data = readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.expiresAt = expiresAt;
      project.updatedAt = new Date().toISOString();
      writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export function incrementDownloadCount(
  slug: string,
  platform: Platform
): { client: Client; project: Project } | null {
  const data = readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.downloadCounts[platform] = (project.downloadCounts[platform] ?? 0) + 1;
      writeData(data);
      return { client, project };
    }
  }
  return null;
}
