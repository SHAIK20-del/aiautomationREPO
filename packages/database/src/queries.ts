import { sql } from "drizzle-orm";
export type InquiryRecord = {
  name: string;
  email: string;
  company?: string;
  service: string;
  estimatedBudget: string;
  message: string;
};
export function inquiryStatement(input: InquiryRecord, key: string) {
  return sql`
 WITH gate AS (
 INSERT INTO rate_limits (key,count,expires_at) VALUES (${key},1,now()+interval '1 hour')
 ON CONFLICT (key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.count+1 END, expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+interval '1 hour' ELSE rate_limits.expires_at END RETURNING count
 ), inquiry AS (
 INSERT INTO contact_inquiries (name,email,company,service,estimated_budget,message)
 SELECT ${input.name},${input.email},${input.company ?? ""},${input.service},${input.estimatedBudget},${input.message}
 FROM gate WHERE gate.count<=5 RETURNING id
 ), activity AS (
 INSERT INTO inquiry_activity(inquiry_id,activity_type,notes) SELECT id,'CREATED','Inquiry received through public form' FROM inquiry
 ), audit AS (
 INSERT INTO audit_events(actor_id,action,target_type,target_id) SELECT 'public','inquiry.created','inquiry',id::text FROM inquiry
 ) SELECT id FROM inquiry`;
}
