import fs from "fs";
import path from "path";

export type ProjectDownloads = {
  windows: string | null;
  mac: string | null;
  android: string | null;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  version: string;
  icon: string;
  downloads: ProjectDownloads;
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
  }
): Project {
  const data = readData();
  const client = data.clients.find((c) => c.id === clientId);
  if (!client) throw new Error("Client not found");

  const project: Project = {
    slug: input.slug,
    title: input.title,
    description: input.description,
    version: input.version,
    icon: "",
    downloads: input.downloads,
    updatedAt: new Date().toISOString(),
  };

  client.projects.push(project);
  writeData(data);
  return project;
}
