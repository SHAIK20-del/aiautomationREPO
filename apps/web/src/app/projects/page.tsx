import { projects, mediaUrl } from "@/lib/strapi";
import { Gallery } from "@/components/projects/gallery";
export const metadata = {
  alternates: { canonical: "/projects" },
  title: "Selected Work",
};
export default async function Projects() {
  const work = await projects();
  return (
    <main id="main" className="inner-page">
      <div className="page-heading">
        <span className="eyebrow">The collection / Selected work</span>
        <h1>
          Proof in <em>motion.</em>
        </h1>
        <p>
          A meeting of intelligent systems, digital experiences, and moving
          images. Every project begins with a different possibility.
        </p>
      </div>
      <section className="section-pad">
        <Gallery
          projects={work.data.map((p) => ({
            ...p,
            image: mediaUrl(p.thumbnail?.url ?? p.coverImage?.url, 1100),
            imageAlt: p.thumbnail?.alternativeText ?? p.title,
          }))}
          state={work.state}
        />
      </section>
    </main>
  );
}
