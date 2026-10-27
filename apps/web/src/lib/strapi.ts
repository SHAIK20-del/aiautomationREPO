import "server-only";
import { z } from "zod";
import { draftMode } from "next/headers";
const media = z
  .object({
    url: z.string(),
    alternativeText: z.string().nullish(),
    width: z.number().nullish(),
    height: z.number().nullish(),
  })
  .passthrough();
const block = z.array(
  z
    .object({
      type: z.string(),
      children: z
        .array(
          z
            .object({
              text: z.string().optional(),
              type: z.string().optional(),
              bold: z.boolean().optional(),
              italic: z.boolean().optional(),
              url: z.string().optional(),
            })
            .passthrough(),
        )
        .optional(),
    })
    .passthrough(),
);
export const projectSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullish(),
  description: block.nullish(),
  creativeProcess: block.nullish(),
  category: z.object({ name: z.string(), slug: z.string() }).nullish(),
  coverImage: media.nullish(),
  thumbnail: media.nullish(),
  projectVideo: media.nullish(),
  videoUrl: z.string().nullish(),
  gallery: z.array(media).nullish(),
  technologies: z.array(z.object({ name: z.string() })).nullish(),
  projectDate: z.string().nullish(),
  projectType: z.string().nullish(),
  clientName: z.string().nullish(),
  externalLink: z.string().nullish(),
  featured: z.boolean().optional(),
  publishedAt: z.string().nullish(),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),
});
export type Project = z.infer<typeof projectSchema>;
export type Blocks = z.infer<typeof block>;
export type ContentResult<T> = {
  data: T;
  state: "live" | "unconfigured" | "unavailable";
};
const populated = [
  "coverImage",
  "thumbnail",
  "projectVideo",
  "gallery",
  "technologies",
  "category",
];
async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  fallback: T,
  params = new URLSearchParams(),
  draft = false,
): Promise<ContentResult<T>> {
  const base = process.env.STRAPI_URL;
  if (!base || !process.env.STRAPI_SERVER_API_TOKEN)
    return { data: fallback, state: "unconfigured" };
  params.set("status", draft ? "draft" : "published");
  try {
    const response = await fetch(`${base}/api/${path}?${params}`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_SERVER_API_TOKEN}`,
      },
      ...(draft
        ? { cache: "no-store" as const }
        : { next: { revalidate: 300, tags: ["cms"] } }),
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`CMS responded ${response.status}`);
    const parsed = schema.safeParse((await response.json()).data);
    if (!parsed.success) throw new Error("CMS content did not match schema");
    return { data: parsed.data, state: "live" };
  } catch {
    return { data: fallback, state: "unavailable" };
  }
}
export async function projects(category?: string) {
  const q = new URLSearchParams({
    "sort[0]": "sortOrder:asc",
    "sort[1]": "projectDate:desc",
    "pagination[pageSize]": "100",
  });
  populated.forEach((p, i) => q.set(`populate[${i}]`, p));
  if (category) q.set("filters[category][slug][$eq]", category);
  const result = await request("projects", z.array(projectSchema), [], q);
  return { ...result, data: result.data.filter((p) => !!p.publishedAt) };
}
export async function project(slug: string) {
  const draft = (await draftMode()).isEnabled;
  const q = new URLSearchParams({ "filters[slug][$eq]": slug });
  populated.forEach((p, i) => q.set(`populate[${i}]`, p));
  const result = await request(
    "projects",
    z.array(projectSchema),
    [],
    q,
    draft,
  );
  return {
    data: result.data.find((p) => draft || !!p.publishedAt) ?? null,
    state: result.state,
  };
}
const serviceSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullish(),
  fullDescription: block.nullish(),
  iconKey: z.string().nullish(),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),
});
export type Service = z.infer<typeof serviceSchema>;
export async function services() {
  return request(
    "services",
    z.array(serviceSchema),
    [],
    new URLSearchParams({ sort: "sortOrder:asc" }),
  );
}
export async function homepage() {
  return request(
    "homepage",
    z
      .object({
        heroEyebrow: z.string().nullish(),
        heroHeading: z.string().nullish(),
        heroDescription: z.string().nullish(),
        primaryCtaLabel: z.string().nullish(),
        primaryCtaDestination: z.string().nullish(),
        secondaryCtaLabel: z.string().nullish(),
        secondaryCtaDestination: z.string().nullish(),
        expertiseHeading: z.string().nullish(),
        workHeading: z.string().nullish(),
        finalCtaText: z.string().nullish(),
        featuredProjects: z.array(projectSchema).nullish(),
      })
      .nullable(),
    null,
    new URLSearchParams(
      Object.fromEntries(
        populated.map((p, i) => [
          `populate[featuredProjects][populate][${i}]`,
          p,
        ]),
      ),
    ),
  );
}
export async function settings() {
  return request(
    "studio-setting",
    z
      .object({
        studioName: z.string().nullish(),
        logo: media.nullish(),
        biography: block.nullish(),
        brandDescription: z.string().nullish(),
        contactEmail: z.string().nullish(),
        instagram: z.string().nullish(),
        youtube: z.string().nullish(),
        linkedin: z.string().nullish(),
        footerContent: z.string().nullish(),
      })
      .nullable(),
    null,
    new URLSearchParams({ "populate[0]": "logo" }),
  );
}
export function safeUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function mediaUrl(value?: string | null, width?: number) {
  const url = safeUrl(value);
  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!url || !endpoint) return undefined;
  try {
    const a = new URL(url),
      b = new URL(endpoint);
    if (
      a.origin !== b.origin ||
      !a.pathname.startsWith(b.pathname.replace(/\/$/, "") + "/")
    )
      return undefined;
    if (width) a.searchParams.set("tr", `w-${width},q-85,f-auto`);
    return a.href;
  } catch {
    return undefined;
  }
}
export function localDestination(
  value: string | null | undefined,
  fallback: string,
) {
  return value && /^\/(?!\/)/.test(value) ? value : fallback;
}
