import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientById, isExpired } from "@/lib/clients";
import AppIcon from "@/components/app-icon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clientId: string }>;
}): Promise<Metadata> {
  const { clientId } = await params;
  const client = await getClientById(clientId);
  if (!client) return {};

  return {
    title: client.name,
    description: `All your apps in one place`,
    openGraph: {
      title: client.name,
      description: `All your apps in one place`,
      images: ["/logo.png"],
    },
    twitter: {
      card: "summary",
      title: client.name,
      description: `All your apps in one place`,
      images: ["/logo.png"],
    },
  };
}

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClientById(clientId);

  if (!client) notFound();

  const activeProjects = client.projects.filter((p) => !isExpired(p));

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-md px-6 py-16 text-center">
        <AppIcon
          src="/logo.png"
          alt={`${client.name} icon`}
          className="mx-auto mb-6 h-20 w-20 rounded-2xl object-cover"
        />
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <p className="mt-2 text-neutral-400">All your apps in one place</p>

        <div className="mt-10 flex flex-col gap-3 text-left">
          {activeProjects.length === 0 && (
            <p className="text-center text-sm text-neutral-500">
              No apps available yet.
            </p>
          )}
          {activeProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/p/${project.slug}`}
              className="flex items-center gap-3 rounded-xl border border-neutral-800 px-4 py-3 hover:bg-neutral-900"
            >
              <AppIcon
                src={project.icon || "/logo.png"}
                alt={`${project.title} icon`}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium">{project.title}</p>
                <p className="text-xs text-neutral-500">
                  {project.description} · v{project.version}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-6 text-xs text-neutral-600">
          Powered by Fute-Services
        </div>
      </div>
    </main>
  );
}
