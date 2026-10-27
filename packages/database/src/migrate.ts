import { existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
async function main() {
  if (!process.env.DATABASE_URL && existsSync("../../apps/web/.env"))
    process.loadEnvFile("../../apps/web/.env");
  if (
    !process.env.DATABASE_URL ||
    !["require", "verify-full"].includes(
      new URL(process.env.DATABASE_URL).searchParams.get("sslmode") ?? "",
    )
  )
    throw new Error(
      "Set the application Neon DATABASE_URL with TLS before migrating. Never target studio_cms.",
    );
  await migrate(drizzle(neon(process.env.DATABASE_URL)), {
    migrationsFolder: "./migrations",
  });
  console.log("Application migrations applied.");
}
main().catch(() => {
  console.error(
    "Application migration failed. Check the studio_app Neon URL, TLS, and database access.",
  );
  process.exitCode = 1;
});
