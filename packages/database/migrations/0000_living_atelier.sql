CREATE TYPE "public"."inquiry_status" AS ENUM('NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(120) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" varchar(120) NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(80) NOT NULL,
	"target_id" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(254) NOT NULL,
	"company" varchar(160),
	"service" varchar(100) NOT NULL,
	"estimated_budget" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"activity_type" varchar(80) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" varchar(160) PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_demo_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"event_type" varchar(80) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiry_activity" ADD CONSTRAINT "inquiry_activity_inquiry_id_contact_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."contact_inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "settings_key_idx" ON "app_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "inquiry_status_date_idx" ON "contact_inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "activity_inquiry_idx" ON "inquiry_activity" USING btree ("inquiry_id");