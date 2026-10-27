import {
  createHash,
  createHmac,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";
export function equalSecret(
  a: string | null | undefined,
  b: string | null | undefined,
) {
  if (!a || !b) return false;
  const x = createHash("sha256").update(a).digest(),
    y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return (
    origin ===
    (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    )
  );
}
export function sessionToken(secret: string, now = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({
      exp: now + 8 * 60 * 60 * 1000,
      nonce: randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");
  return (
    payload +
    "." +
    createHmac("sha256", secret).update(payload).digest("base64url")
  );
}
export function validSession(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
) {
  if (!token || !secret || secret.length < 32) return false;
  const [payload, sig, ...rest] = token.split(".");
  if (!payload || !sig || rest.length) return false;
  if (
    !equalSecret(
      sig,
      createHmac("sha256", secret).update(payload).digest("base64url"),
    )
  )
    return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (
      typeof data.exp === "number" &&
      data.exp > now &&
      data.exp <= now + 8 * 60 * 60 * 1000
    );
  } catch {
    return false;
  }
}
export function rateKey(request: Request, prefix: string) {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt || salt.length < 32)
    throw new Error("Abuse protection is not configured");
  // Trust platform-normalized headers only on Vercel; local/self-hosted traffic shares a bucket.
  const ip = process.env.VERCEL
    ? (request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown")
    : "self-hosted";
  return prefix + ":" + createHmac("sha256", salt).update(ip).digest("hex");
}

export class BodyTooLarge extends Error {}
export async function readTextBounded(request: Request, maxBytes = 16000) {
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw new BodyTooLarge("Request too large");
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new BodyTooLarge("Request too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}
