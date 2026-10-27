import { NextResponse } from "next/server";
export function GET() {
  const url = process.env.CMS_ADMIN_URL;
  if (!url)
    return NextResponse.json(
      { error: "CMS administration is not configured." },
      { status: 503 },
    );
  return NextResponse.redirect(url);
}
