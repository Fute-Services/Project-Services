import { notFound } from "next/navigation";
import { getProjectBySlug, isExpired } from "@/lib/clients";
import DownloadButtons from "./download-buttons";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getProjectBySlug(slug);

  if (!result) notFound();

  const { client, project } = result;
  const expired = isExpired(project);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-800 text-3xl font-semibold">
          {project.title.charAt(0)}
        </div>

        <h1 className="text-2xl font-semibold">{project.title}</h1>
        <p className="mt-2 text-neutral-400">{project.description}</p>
        <p className="mt-1 text-sm text-neutral-500">
          {client.name} · v{project.version}
        </p>

        {project.screenshots.length > 0 && (
          <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
            {project.screenshots.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`${project.title} screenshot ${i + 1}`}
                className="h-40 w-auto shrink-0 rounded-lg border border-neutral-800 object-cover"
              />
            ))}
          </div>
        )}

        {expired ? (
          <p className="mt-10 text-sm text-neutral-500">
            This link has expired. Contact {client.name} for a new link.
          </p>
        ) : (
          <DownloadButtons slug={project.slug} downloads={project.downloads} />
        )}

        <div className="mt-12 border-t border-neutral-800 pt-6 text-xs text-neutral-600">
          Powered by Project-Services
        </div>
      </div>
    </main>
  );
}
