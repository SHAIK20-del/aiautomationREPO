import { NextResponse } from "next/server";
import {
  readTextBounded,
  sameOrigin,
  equalSecret,
  sessionToken,
  rateKey,
} from "@/lib/security";
import { consumeLoginLimit } from "@/lib/inquiries";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const password = process.env.OPERATIONS_PASSWORD,
    secret = process.env.OPERATIONS_SESSION_SECRET;
  if (!password || password.length < 20 || !secret || secret.length < 32)
    return NextResponse.json(
      { error: "Owner access is not configured." },
      { status: 503 },
    );
  try {
    if (!(await consumeLoginLimit(rateKey(request, "login"))))
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    const data = new URLSearchParams(await readTextBounded(request, 1024));
    if (!equalSecret(String(data.get("password") ?? ""), password))
      return NextResponse.redirect(
        new URL("/operations/login?error=1", request.url),
        303,
      );
    const res = NextResponse.redirect(new URL("/operations", request.url), 303);
    res.cookies.set("atelier_owner", sessionToken(secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60,
      path: "/",
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return NextResponse.json(
      { error: "Private operations are unavailable." },
      { status: 503 },
    );
  }
}
