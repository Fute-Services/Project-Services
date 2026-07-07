import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientById, isExpired } from "@/lib/clients";

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
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-800 text-3xl font-semibold">
          {client.name.charAt(0)}
        </div>
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
              {project.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.icon}
                  alt={`${project.title} icon`}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-sm font-semibold">
                  {project.title.charAt(0)}
                </div>
              )}
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
          Powered by Project-Services
        </div>
      </div>
    </main>
  );
}
