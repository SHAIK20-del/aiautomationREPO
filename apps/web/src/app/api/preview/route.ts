import { NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { equalSecret } from "@/lib/security";
export async function GET(request: Request) {
  const url = new URL(request.url),
    slug = url.searchParams.get("slug"),
    secret = process.env.STRAPI_PREVIEW_SECRET;
  if (
    !secret ||
    secret.length < 32 ||
    !equalSecret(url.searchParams.get("secret"), secret) ||
    !slug ||
    !/^[-a-z0-9]+$/.test(slug)
  )
    return NextResponse.json(
      { error: "Unauthorized preview" },
      { status: 401 },
    );
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(`/projects/${slug}`, request.url));
}
