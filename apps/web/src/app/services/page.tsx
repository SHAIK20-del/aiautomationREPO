import { services } from "@/lib/strapi";
import { Expertise } from "@/components/experience";
export const metadata = {
  alternates: { canonical: "/services" },
  title: "Expertise",
};
export default async function Services() {
  const content = await services();
  return (
    <main id="main" className="inner-page">
      <div className="page-heading">
        <span className="eyebrow">The capabilities / Our expertise</span>
        <h1>
          Ideas without
          <br />
          <em>boundaries.</em>
        </h1>
        <p>
          Six connected disciplines. One considered approach. Explore the
          possibilities at the intersection of creativity and intelligent
          engineering.
        </p>
      </div>
      <section className="section-pad">
        <Expertise content={content.data} />
      </section>
    </main>
  );
}
