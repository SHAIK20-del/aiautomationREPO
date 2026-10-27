import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core";
export const inquiryStatus = pgEnum("inquiry_status", [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "CLOSED",
]);
export const contactInquiries = pgTable(
  "contact_inquiries",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 100 }).notNull(),
    email: varchar({ length: 254 }).notNull(),
    company: varchar({ length: 160 }),
    service: varchar({ length: 100 }).notNull(),
    estimatedBudget: varchar("estimated_budget", { length: 100 }).notNull(),
    message: text().notNull(),
    status: inquiryStatus().default("NEW").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("inquiry_status_date_idx").on(t.status, t.createdAt)],
);
export const inquiryActivity = pgTable(
  "inquiry_activity",
  {
    id: uuid().defaultRandom().primaryKey(),
    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => contactInquiries.id, { onDelete: "cascade" }),
    activityType: varchar("activity_type", { length: 80 }).notNull(),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("activity_inquiry_idx").on(t.inquiryId)],
);
export const workflowDemoEvents = pgTable("workflow_demo_events", {
  id: uuid().defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull(),
  eventType: varchar("event_type", { length: 80 }).notNull(),
  payload: jsonb(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const appSettings = pgTable(
  "app_settings",
  {
    id: uuid().defaultRandom().primaryKey(),
    key: varchar({ length: 120 }).notNull(),
    value: jsonb().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("settings_key_idx").on(t.key)],
);
export const auditEvents = pgTable("audit_events", {
  id: uuid().defaultRandom().primaryKey(),
  actorId: varchar("actor_id", { length: 120 }).notNull(),
  action: varchar({ length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 80 }).notNull(),
  targetId: varchar("target_id", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const rateLimits = pgTable("rate_limits", {
  key: varchar({ length: 160 }).primaryKey(),
  count: integer().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
