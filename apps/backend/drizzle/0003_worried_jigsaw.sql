CREATE TABLE "student_active_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_user_id" uuid NOT NULL,
	"activity_date" date NOT NULL,
	"answers_count" integer DEFAULT 0 NOT NULL,
	"is_active_day" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_active_days" ADD CONSTRAINT "student_active_days_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "student_active_days_student_date_unique" ON "student_active_days" USING btree ("student_user_id","activity_date");--> statement-breakpoint
CREATE INDEX "student_active_days_student_idx" ON "student_active_days" USING btree ("student_user_id");