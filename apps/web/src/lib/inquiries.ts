import "server-only";
import { database, schema } from "@atelier/database";
import { sql, desc, eq } from "drizzle-orm";
import { inquiryStatement } from "@atelier/database/queries";
import type { InquiryInput } from "@atelier/shared";
export async function saveInquiry(input: InquiryInput, key: string) {
  const db = database();
  // One SQL statement: shared database limit, inquiry, activity and audit are atomic.
  const result = await db.execute(inquiryStatement(input, key));
  return result.rows[0]?.id as string | undefined;
}
export async function consumeLoginLimit(key: string) {
  const result = await database().execute(
    sql`INSERT INTO rate_limits(key,count,expires_at) VALUES(${key},1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.count+1 END,expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE rate_limits.expires_at END RETURNING count`,
  );
  return Number(result.rows[0]?.count) <= 8;
}
export async function listInquiries() {
  return database()
    .select()
    .from(schema.contactInquiries)
    .orderBy(desc(schema.contactInquiries.createdAt))
    .limit(100);
}
export async function getInquiry(id: string) {
  const db = database();
  const record = await db
    .select()
    .from(schema.contactInquiries)
    .where(eq(schema.contactInquiries.id, id))
    .limit(1);
  const activity = await db
    .select()
    .from(schema.inquiryActivity)
    .where(eq(schema.inquiryActivity.inquiryId, id))
    .orderBy(desc(schema.inquiryActivity.createdAt));
  return { record: record[0], activity };
}
export async function changeStatus(id: string, status: string, notes: string) {
  await database().execute(
    sql`WITH changed AS (UPDATE contact_inquiries SET status=${status}::inquiry_status,updated_at=now() WHERE id=${id}::uuid RETURNING id),activity AS (INSERT INTO inquiry_activity(inquiry_id,activity_type,notes) SELECT id,'STATUS_CHANGED',${status + ": " + notes} FROM changed) INSERT INTO audit_events(actor_id,action,target_type,target_id) SELECT 'studio-owner',${"inquiry.status." + status},'inquiry',id::text FROM changed`,
  );
}
