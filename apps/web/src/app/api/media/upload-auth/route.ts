import { NextResponse } from "next/server";
import { isOwner } from "@/lib/operations";
import { sameOrigin, rateKey } from "@/lib/security";
import { consumeLoginLimit } from "@/lib/inquiries";
import { mediaProject, uploadCredentials } from "@/lib/imagekit";
export async function POST(request: Request) {
  if (!(await isOwner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { documentId } = await request.json();
    if (typeof documentId !== "string" || !/^\w{10,40}$/.test(documentId))
      return NextResponse.json(
        { error: "Invalid project document ID" },
        { status: 400 },
      );
    if (!(await consumeLoginLimit(rateKey(request, "upload"))))
      return NextResponse.json(
        { error: "Too many upload requests. Try later." },
        { status: 429 },
      );
    const p = await mediaProject(documentId);
    return NextResponse.json(
      { ...uploadCredentials(), folder: `/studio/projects/${p.slug}/videos/` },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Upload authorization is unavailable. Check the ImageKit and CMS configuration.",
      },
      { status: 503 },
    );
  }
}
