import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Application database is not configured");
  if (!url.includes("sslmode=require") && !url.includes("sslmode=verify-full"))
    throw new Error("Database TLS is required");
  return drizzle(neon(url), { schema });
}
export { schema };
