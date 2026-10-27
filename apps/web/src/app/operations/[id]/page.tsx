import { notFound } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/lib/operations";
import { getInquiry } from "@/lib/inquiries";
import { updateInquiry } from "../actions";
export const metadata = {
  title: "Private Inquiry",
  robots: { index: false, follow: false },
};
export default async function Inquiry({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { record: i, activity } = await getInquiry(id);
  if (!i) notFound();
  return (
    <main id="main" className="operations ops-detail">
      <a className="text-link" href="/operations">
        ← All inquiries
      </a>
      <h1>{i.name}</h1>
      <p>
        <a href={`mailto:${i.email}`}>{i.email}</a>
        <br />
        {i.company}
        <br />
        {i.service} / {i.estimatedBudget}
      </p>
      <p>{i.message}</p>
      <form action={updateInquiry}>
        <input type="hidden" name="id" value={id} />
        <label>
          Status
          <select name="status" defaultValue={i.status}>
            {["NEW", "CONTACTED", "IN_PROGRESS", "CLOSED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Activity note
          <textarea name="notes" maxLength={2000} rows={3} />
        </label>
        <button className="button">Save status</button>
      </form>
      <h2>Activity</h2>
      {activity.map((a) => (
        <p key={a.id}>
          <small>
            {a.createdAt.toLocaleString()} / {a.activityType}
          </small>
          <br />
          {a.notes}
        </p>
      ))}
    </main>
  );
}
