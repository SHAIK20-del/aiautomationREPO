"use server";
import { requireOwner } from "@/lib/operations";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { changeStatus } from "@/lib/inquiries";
export async function logout() {
  (await cookies()).delete("atelier_owner");
  redirect("/operations/login");
}
export async function updateInquiry(data: FormData) {
  await requireOwner();
  const parsed = z
    .object({
      id: z.uuid(),
      status: z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "CLOSED"]),
      notes: z.string().trim().max(2000),
    })
    .parse(Object.fromEntries(data));
  await changeStatus(parsed.id, parsed.status, parsed.notes);
  revalidatePath("/operations");
  revalidatePath(`/operations/${parsed.id}`);
}
