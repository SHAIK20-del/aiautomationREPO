import type { MetadataRoute } from "next";
import { projects, services } from "@/lib/strapi";
import { serviceDirections } from "@atelier/shared";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [p, s] = await Promise.all([projects(), services()]);
  return [
    "",
    "/studio",
    "/services",
    "/projects",
    "/contact",
    "/privacy",
    ...(s.data.length ? s.data : serviceDirections).map(
      (x) => `/services/${x.slug}`,
    ),
    ...p.data.map((x) => `/projects/${x.slug}`),
  ].map((path) => ({ url: base + path }));
}
