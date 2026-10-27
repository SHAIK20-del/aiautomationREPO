import Link from "next/link";
import { requireOwner } from "@/lib/operations";
import { listInquiries } from "@/lib/inquiries";
import { logout } from "./actions";
import { MediaUploader } from "@/components/media-uploader";
export const metadata = {
  title: "Private Operations",
  robots: { index: false, follow: false },
};
export default async function Operations() {
  await requireOwner();
  const inquiries = await listInquiries();
  return (
    <main id="main" className="operations">
      <div className="ops-top">
        <span className="eyebrow">Private / Inquiry management</span>
        <form action={logout}>
          <button className="text-link">Sign out</button>
        </form>
      </div>
      <h1>The conversations.</h1>
      <p>
        Latest 100 inquiries. Project editing lives in{" "}
        <Link href="/admin" className="text-link">
          Strapi ↗
        </Link>
      </p>
      <table className="ops-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Service</th>
            <th>Status</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((i) => (
            <tr key={i.id}>
              <td>
                <Link href={`/operations/${i.id}`} className="text-link">
                  {i.name} ↗
                </Link>
              </td>
              <td>{i.service}</td>
              <td>{i.status}</td>
              <td>{i.createdAt.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!inquiries.length && <p>No inquiries yet.</p>}
      <MediaUploader />
    </main>
  );
}
