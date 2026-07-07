import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

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
const REDIS_KEY = "clients-data";

// On Vercel the filesystem is read-only outside /tmp, so client/project data
// lives in Redis there. Locally (no Redis env vars configured), fall back to
// the JSON file so `npm run dev` keeps working without cloud credentials.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

async function readData(): Promise<Data> {
  if (redis) {
    const data = await redis.get<Data>(REDIS_KEY);
    return data ?? { clients: [] };
  }
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Data;
}

async function writeData(data: Data): Promise<void> {
  if (redis) {
    await redis.set(REDIS_KEY, data);
    return;
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getAllClients(): Promise<Client[]> {
  return (await readData()).clients;
}

export async function getProjectBySlug(
  slug: string
): Promise<{ client: Client; project: Project } | null> {
  const clients = (await readData()).clients;
  for (const client of clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) return { client, project };
  }
  return null;
}

export async function getClientById(id: string): Promise<Client | null> {
  return (await readData()).clients.find((c) => c.id === id) ?? null;
}

export function isExpired(project: Project): boolean {
  if (!project.expiresAt) return false;
  return new Date(project.expiresAt).getTime() < Date.now();
}

export async function addClient(name: string): Promise<Client> {
  const data = await readData();
  let id = slugify(name);
  let suffix = 2;
  while (data.clients.some((c) => c.id === id)) {
    id = `${slugify(name)}-${suffix++}`;
  }
  const client: Client = { id, name, projects: [] };
  data.clients.push(client);
  await writeData(data);
  return client;
}

export async function generateUniqueSlug(title: string): Promise<string> {
  const data = await readData();
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

export async function addProject(
  clientId: string,
  input: {
    slug: string;
    title: string;
    description: string;
    version: string;
    icon?: string;
    downloads: ProjectDownloads;
    expiresAt?: string | null;
    screenshots?: string[];
  }
): Promise<Project> {
  const data = await readData();
  const client = data.clients.find((c) => c.id === clientId);
  if (!client) throw new Error("Client not found");

  const now = new Date().toISOString();

  const project: Project = {
    slug: input.slug,
    title: input.title,
    description: input.description,
    version: input.version,
    icon: input.icon ?? "",
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
  await writeData(data);
  return project;
}

export async function addProjectVersion(
  slug: string,
  input: { version: string; downloads: ProjectDownloads }
): Promise<Project> {
  const data = await readData();
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
      await writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export async function updateProjectStatus(
  slug: string,
  status: ProjectStatus
): Promise<Project> {
  const data = await readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.status = status;
      project.updatedAt = new Date().toISOString();
      await writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export async function updateProjectNotes(slug: string, notes: string): Promise<Project> {
  const data = await readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.notes = notes;
      project.updatedAt = new Date().toISOString();
      await writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export async function addProjectScreenshots(
  slug: string,
  newScreenshots: string[]
): Promise<Project> {
  const data = await readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.screenshots = [...project.screenshots, ...newScreenshots];
      project.updatedAt = new Date().toISOString();
      await writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export async function updateProjectExpiry(
  slug: string,
  expiresAt: string | null
): Promise<Project> {
  const data = await readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.expiresAt = expiresAt;
      project.updatedAt = new Date().toISOString();
      await writeData(data);
      return project;
    }
  }
  throw new Error("Project not found");
}

export async function incrementDownloadCount(
  slug: string,
  platform: Platform
): Promise<{ client: Client; project: Project } | null> {
  const data = await readData();
  for (const client of data.clients) {
    const project = client.projects.find((p) => p.slug === slug);
    if (project) {
      project.downloadCounts[platform] = (project.downloadCounts[platform] ?? 0) + 1;
      await writeData(data);
      return { client, project };
    }
  }
  return null;
}
