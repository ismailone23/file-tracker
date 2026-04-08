CREATE TYPE "public"."file_status" AS ENUM('Pending', 'Approved', 'Forwarded');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('RECEPTION', 'OFFICER', 'MANAGER', 'RECORDS_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."stage" AS ENUM('reception', 'officer', 'manager', 'final');--> statement-breakpoint
CREATE TYPE "public"."workflow_action_type" AS ENUM('approved-forwarded', 'forwarded');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"event" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_records" (
	"id" text PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"current_stage" "stage" NOT NULL,
	"assigned_to" text NOT NULL,
	"status" "file_status" DEFAULT 'Pending' NOT NULL,
	"created_by_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" NOT NULL,
	"allowed_stages" "stage"[] NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"by_user_id" text NOT NULL,
	"type" "workflow_action_type" NOT NULL,
	"from_stage" "stage" NOT NULL,
	"to_stage" "stage" NOT NULL,
	"note" text,
	"signature" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_records" ADD CONSTRAINT "file_records_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_actions" ADD CONSTRAINT "workflow_actions_file_id_file_records_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_actions" ADD CONSTRAINT "workflow_actions_by_user_id_users_id_fk" FOREIGN KEY ("by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "file_records_external_id_unique" ON "file_records" USING btree ("external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");