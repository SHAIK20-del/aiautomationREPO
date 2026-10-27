import "server-only";
import { randomUUID, createHmac } from "node:crypto";
export function uploadCredentials() {
  const key = process.env.IMAGEKIT_PRIVATE_KEY,
    publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!key || !publicKey) throw new Error("ImageKit is not configured");
  const token = randomUUID(),
    expire = Math.floor(Date.now() / 1000) + 600;
  return {
    token,
    expire,
    signature: createHmac("sha1", key)
      .update(token + expire)
      .digest("hex"),
    publicKey,
  };
}
export async function mediaProject(documentId: string) {
  const base = process.env.STRAPI_URL,
    token = process.env.STRAPI_MEDIA_API_TOKEN;
  if (!base || !token) throw new Error("CMS media access is not configured");
  const res = await fetch(
    `${base}/api/projects/${encodeURIComponent(documentId)}?status=draft`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    },
  );
  if (!res.ok) throw new Error("Project is unavailable");
  const { data } = await res.json();
  if (!data?.slug || !/^[-a-z0-9]+$/.test(data.slug))
    throw new Error("Invalid project");
  return data as { documentId: string; slug: string };
}
