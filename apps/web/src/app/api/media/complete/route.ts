import { NextResponse } from "next/server";
import { isOwner } from "@/lib/operations";
import { sameOrigin } from "@/lib/security";
export async function POST(request: Request) {
  if (!(await isOwner()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await request.json();
    if (
      typeof body.fileId !== "string" ||
      !/^\w{10,80}$/.test(body.fileId) ||
      typeof body.documentId !== "string" ||
      !/^\w{10,40}$/.test(body.documentId)
    )
      return NextResponse.json(
        { error: "Invalid media reference" },
        { status: 400 },
      );
    const base = process.env.STRAPI_URL,
      token = process.env.STRAPI_MEDIA_API_TOKEN;
    if (!base || !token) throw new Error("Missing configuration");
    const result = await fetch(`${base}/api/studio-media/attach`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileId: body.fileId,
        documentId: body.documentId,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!result.ok) throw new Error("Attachment rejected");
    return NextResponse.json({ attached: true, draft: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "The upload could not be attached. The draft has not been published. Check the CMS and retry attachment.",
      },
      { status: 503 },
    );
  }
}
