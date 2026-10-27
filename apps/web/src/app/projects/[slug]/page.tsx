import { notFound } from "next/navigation";
import Link from "next/link";
import { draftMode } from "next/headers";
import { project, projects, mediaUrl, safeUrl } from "@/lib/strapi";
import { RichText } from "@/components/rich-text";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: p } = await project(slug);
  if (!p) notFound();
  return {
    alternates: { canonical: `/projects/${slug}` },
    title: p?.seoTitle ?? p?.title ?? "Project not found",
    description: p?.seoDescription ?? p?.shortDescription,
  };
}
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: p } = await project(slug);
  if (!p) notFound();
  const draft = (await draftMode()).isEnabled;
  const cover = mediaUrl(p.coverImage?.url, 1800);
  const video = mediaUrl(p.projectVideo?.url ?? p.videoUrl);
  const collection = await projects();
  const related = collection.data.filter((x) => x.slug !== slug).slice(0, 3);
  return (
    <main id="main" className="inner-page">
      {draft && (
        <div className="preview-banner">
          Private draft preview <a href="/api/preview/exit">Exit preview</a>
        </div>
      )}
      <div className="page-heading">
        <span className="eyebrow">
          {p.category?.name ?? "Selected work"} / {p.projectDate?.slice(0, 4)}
        </span>
        <h1>{p.title}</h1>
        <p>{p.shortDescription}</p>
      </div>
      {cover && (
        <img
          className="project-cover"
          src={cover}
          alt={p.coverImage?.alternativeText ?? p.title}
        />
      )}
      <section className="project-body section-pad">
        <aside>
          <span className="eyebrow">Project notes</span>
          {p.clientName && (
            <p>
              Client
              <br />
              <strong>{p.clientName}</strong>
            </p>
          )}
          <p>
            Tools & technologies
            <br />
            {p.technologies?.map((x) => x.name).join(" / ")}
          </p>
          {safeUrl(p.externalLink) && (
            <a
              className="text-link"
              href={safeUrl(p.externalLink)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit project ↗
            </a>
          )}
        </aside>
        <div>
          <h2>The idea.</h2>
          <RichText blocks={p.description} />
          {video && (
            <video
              controls
              playsInline
              preload="metadata"
              poster={cover}
              src={video}
              aria-label={`${p.title} project video`}
            />
          )}
          {p.creativeProcess?.length && (
            <>
              <h2>The making.</h2>
              <RichText blocks={p.creativeProcess} />
            </>
          )}
          {p.gallery?.map((m, i) => {
            const url = mediaUrl(m.url, 1400);
            return url ? (
              <img
                key={i}
                src={url}
                alt={
                  m.alternativeText ?? `${p.title} supporting visual ${i + 1}`
                }
                loading="lazy"
              />
            ) : null;
          })}
        </div>
      </section>
      {related.length > 0 && (
        <section className="section-pad">
          <h2>Continue exploring.</h2>
          <div className="related-links">
            {related.map((r) => (
              <Link key={r.documentId} href={`/projects/${r.slug}`}>
                {r.title} ↗
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
