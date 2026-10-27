import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
const secret = () => randomBytes(32).toString("hex");
const root = resolve(import.meta.dirname, "..");
const files = ["apps/web/.env", "apps/cms/.env"];
const existing = files
  .filter((p) => existsSync(resolve(root, p)))
  .map((p) => readFileSync(resolve(root, p), "utf8"));
const preview =
  existing
    .map((s) => s.match(/^STRAPI_PREVIEW_SECRET=(.+)$/m)?.[1])
    .find(Boolean) ?? secret();
const generated = {
  STRAPI_PREVIEW_SECRET: preview,
  STRAPI_REVALIDATION_SECRET: secret(),
  OPERATIONS_PASSWORD: secret(),
  OPERATIONS_SESSION_SECRET: secret(),
  RATE_LIMIT_SALT: secret(),
  APP_KEYS: `${secret()},${secret()}`,
  API_TOKEN_SALT: secret(),
  ADMIN_JWT_SECRET: secret(),
  TRANSFER_TOKEN_SALT: secret(),
  JWT_SECRET: secret(),
  ENCRYPTION_KEY: secret(),
};
for (const path of files) {
  const dest = resolve(root, path);
  if (existsSync(dest)) {
    console.log(`Preserved ${path}`);
    continue;
  }
  const template = readFileSync(dest + ".example", "utf8").replace(
    /^(\w+)=$/gm,
    (line, key) => (generated[key] ? `${key}=${generated[key]}` : line),
  );
  writeFileSync(dest, template, { mode: 0o600, flag: "wx" });
  console.log(
    `Created ${path} with local application secrets. Hosted credentials remain empty.`,
  );
}
