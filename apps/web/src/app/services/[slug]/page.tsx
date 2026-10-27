import { notFound } from "next/navigation";
import Link from "next/link";
import { services } from "@/lib/strapi";
import { serviceDirections } from "@atelier/shared";
import { RichText } from "@/components/rich-text";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = await services();
  const record = all.data.find((x) => x.slug === slug);
  const s = record ?? serviceDirections.find((x) => x.slug === slug);
  return {
    title: record?.seoTitle ?? s?.title ?? "Service not found",
    description: record?.seoDescription ?? s?.shortDescription,
    alternates: { canonical: `/services/${slug}` },
  };
}
export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cms = await services();
  const record = cms.data.find((x) => x.slug === slug);
  const direction = serviceDirections.find((x) => x.slug === slug);
  if (!record && !direction) notFound();
  return (
    <main id="main" className="inner-page">
      <div className="page-heading">
        <span className="eyebrow">Our expertise / A new possibility</span>
        <h1>{record?.title ?? direction?.title}</h1>
        <p>{record?.shortDescription ?? direction?.shortDescription}</p>
      </div>
      <section className="service-detail section-pad">
        <div className="service-detail-art" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div>
          <h2>
            Intelligence, with <em>intention.</em>
          </h2>
          {record?.fullDescription ? (
            <RichText blocks={record.fullDescription} />
          ) : (
            <p>{direction?.detail}</p>
          )}
          <p>
            Every engagement starts with your context. Together, we define a
            meaningful scope, explore the possibilities, and build toward a
            clear outcome.
          </p>
          <Link href="/contact" className="button">
            Let’s explore your idea ↗
          </Link>
        </div>
      </section>
    </main>
  );
}
