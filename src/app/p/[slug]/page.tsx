import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, isExpired } from "@/lib/clients";
import DownloadButtons from "./download-buttons";
import AppIcon from "@/components/app-icon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProjectBySlug(slug);
  if (!result) return {};

  const { project } = result;
  const image = project.icon || "/logo.png";

  return {
    title: project.title,
    description: project.description || `Download ${project.title}`,
    openGraph: {
      title: project.title,
      description: project.description || `Download ${project.title}`,
      images: [image],
    },
    twitter: {
      card: "summary",
      title: project.title,
      description: project.description || `Download ${project.title}`,
      images: [image],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProjectBySlug(slug);

  if (!result) notFound();

  const { client, project } = result;
  const expired = isExpired(project);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-neutral-950 text-neutral-100"
      style={project.background ? { backgroundColor: project.background } : undefined}
    >
      <div className="w-full max-w-md text-center">
        <AppIcon
          src={project.icon || "/logo.png"}
          alt={`${project.title} icon`}
          className="mx-auto mb-6 h-20 w-20 rounded-2xl object-cover"
        />

        <h1 className="text-2xl font-semibold">{project.title}</h1>

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
          <DownloadButtons
            slug={project.slug}
            downloads={project.downloads}
            platformSettings={project.platformSettings}
          />
        )}

        <div className="mt-12 border-t border-neutral-800 pt-6 text-xs text-neutral-600">
          Powered by Fute-Services
        </div>
      </div>
    </main>
  );
}
