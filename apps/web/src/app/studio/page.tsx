import Link from "next/link";
import { settings } from "@/lib/strapi";
import { RichText } from "@/components/rich-text";
export const metadata = {
  alternates: { canonical: "/studio" },
  title: "The Studio",
};
export default async function Studio() {
  const { data: s } = await settings();
  return (
    <main id="main" className="inner-page">
      <div className="page-heading">
        <span className="eyebrow">The practice / Independent in spirit</span>
        <h1>
          Curiosity is
          <br />
          our <em>constant.</em>
        </h1>
        <p>
          {s?.brandDescription ??
            "An independent creative technology practice bringing together intelligent systems, expressive digital experiences, and imaginative storytelling."}
        </p>
      </div>
      <section className="studio-story section-pad">
        <div className="about-mark" aria-hidden="true">
          <span>a</span>
          <i>✺</i>
          <small>THE LIVING ATELIER</small>
        </div>
        <div>
          <h2>
            Where disciplines
            <br />
            <em>become possibilities.</em>
          </h2>
          {s?.biography ? (
            <RichText blocks={s.biography} />
          ) : (
            <>
              <p>
                The Living Atelier explores the space between creative instinct
                and considered engineering. A place for AI automation, web
                development, motion, and film to inspire one another.
              </p>
              <p>
                We believe technology is at its best when it makes room for
                people: their imagination, their attention, and the work that
                matters to them.
              </p>
            </>
          )}
          <Link href="/contact" className="text-link">
            Start a conversation ↗
          </Link>
        </div>
      </section>
    </main>
  );
}
