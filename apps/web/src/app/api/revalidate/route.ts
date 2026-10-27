import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { equalSecret } from "@/lib/security";
export async function POST(request: Request) {
  const secret = process.env.STRAPI_REVALIDATION_SECRET;
  if (
    !secret ||
    secret.length < 32 ||
    !equalSecret(request.headers.get("authorization"), `Bearer ${secret}`)
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
  if (
    ![
      "entry.publish",
      "entry.unpublish",
      "entry.delete",
      "entry.update",
      "entry.create",
    ].includes(body.event) ||
    ![
      "project",
      "project-category",
      "service",
      "homepage",
      "studio-setting",
    ].includes(body.model)
  )
    return NextResponse.json({ ignored: true });
  revalidateTag("cms", { expire: 0 });
  ["/", "/projects", "/services", "/studio", "/sitemap.xml"].forEach((p) =>
    revalidatePath(p),
  );
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/services/[slug]", "page");
  return NextResponse.json({ revalidated: true });
}
