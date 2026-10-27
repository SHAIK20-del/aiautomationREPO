import { NextResponse } from "next/server";
import { inquirySchema } from "@atelier/shared";
import {
  sameOrigin,
  rateKey,
  readTextBounded,
  BodyTooLarge,
} from "@/lib/security";
import { saveInquiry } from "@/lib/inquiries";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "This request could not be verified." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return NextResponse.json(
      { error: "JSON input is required." },
      { status: 415 },
    );
  if (Number(request.headers.get("content-length")) > 16000)
    return NextResponse.json(
      { error: "This message is too large." },
      { status: 413 },
    );
  let parsed;
  try {
    const body = await readTextBounded(request);
    if (body.length > 16000)
      return NextResponse.json(
        { error: "This message is too large." },
        { status: 413 },
      );
    parsed = inquirySchema.safeParse(JSON.parse(body));
  } catch (error) {
    if (error instanceof BodyTooLarge)
      return NextResponse.json(
        { error: "This message is too large." },
        { status: 413 },
      );
    return NextResponse.json(
      { error: "Please send a valid inquiry." },
      { status: 400 },
    );
  }
  if (!parsed.success)
    return NextResponse.json(
      {
        error: "Please check the form and try again.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  try {
    const id = await saveInquiry(parsed.data, rateKey(request, "contact"));
    if (!id)
      return NextResponse.json(
        { error: "A few too many messages. Please try again in an hour." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error:
          "We couldn’t save your inquiry right now. Please try again later.",
      },
      { status: 503 },
    );
  }
}
