import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/clients";
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

        <DownloadButtons downloads={project.downloads} />

        <div className="mt-12 border-t border-neutral-800 pt-6 text-xs text-neutral-600">
          Powered by Project-Services
        </div>
      </div>
    </main>
  );
}
