import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validSession } from "./security";
export async function isOwner() {
  return validSession(
    (await cookies()).get("atelier_owner")?.value,
    process.env.OPERATIONS_SESSION_SECRET,
  );
}
export async function requireOwner() {
  if (!(await isOwner())) redirect("/operations/login");
}
