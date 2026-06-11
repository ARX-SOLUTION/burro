CREATE TYPE "public"."attempt_status" AS ENUM('in_progress', 'completed', 'failed', 'passed');--> statement-breakpoint
CREATE TYPE "public"."attempt_type" AS ENUM('practice', 'final_quiz');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."exercise_type" AS ENUM('find_letter', 'find_sound', 'listen_find_letter', 'listen_find_sound');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('uz', 'ru', 'en');--> statement-breakpoint
CREATE TYPE "public"."module_progress_status" AS ENUM('not_started', 'in_progress', 'completed', 'locked');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('student', 'parent', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'blocked', 'deleted');--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"selected_option_id" uuid NOT NULL,
	"correct_option_id" uuid NOT NULL,
	"is_correct" boolean NOT NULL,
	"xp_delta" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_user_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"attempt_type" "attempt_type" NOT NULL,
	"status" "attempt_status" DEFAULT 'in_progress' NOT NULL,
	"score" integer,
	"hearts_start" integer,
	"hearts_remaining" integer,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "exercise_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "exercise_type" NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"media_id" uuid,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_no" integer NOT NULL,
	"slug" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"premium_required" boolean DEFAULT false NOT NULL,
	"pass_score" integer DEFAULT 80 NOT NULL,
	"hearts_count" integer DEFAULT 5 NOT NULL,
	"estimated_minutes" integer,
	"shuffle_exercises" boolean DEFAULT false NOT NULL,
	"shuffle_quiz_questions" boolean DEFAULT false NOT NULL,
	"quiz_source" text DEFAULT 'random' NOT NULL,
	"quiz_question_count" integer DEFAULT 10 NOT NULL,
	"correct_answer_xp" integer DEFAULT 10 NOT NULL,
	"practice_completion_xp" integer DEFAULT 50 NOT NULL,
	"final_quiz_pass_xp" integer DEFAULT 100 NOT NULL,
	"module_completion_xp" integer DEFAULT 150 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "student_module_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_user_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"status" "module_progress_status" DEFAULT 'not_started' NOT NULL,
	"completed_exercises" integer DEFAULT 0 NOT NULL,
	"total_exercises" integer DEFAULT 0 NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"final_quiz_best_score" integer,
	"final_quiz_passed" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "student_xp_totals" (
	"student_user_id" uuid PRIMARY KEY NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_user_id" bigint NOT NULL,
	"telegram_first_name" text NOT NULL,
	"telegram_last_name" text,
	"telegram_username" text,
	"telegram_avatar_url" text,
	"role" "role" NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"preferred_language" "language" DEFAULT 'uz' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "xp_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_user_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid,
	"xp_delta" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_selected_option_id_exercise_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."exercise_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_correct_option_id_exercise_options_id_fk" FOREIGN KEY ("correct_option_id") REFERENCES "public"."exercise_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_exercises" ADD CONSTRAINT "attempt_exercises_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_exercises" ADD CONSTRAINT "attempt_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_options" ADD CONSTRAINT "exercise_options_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_module_progress" ADD CONSTRAINT "student_module_progress_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_module_progress" ADD CONSTRAINT "student_module_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_xp_totals" ADD CONSTRAINT "student_xp_totals_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_answers_attempt_exercise_unique" ON "attempt_answers" USING btree ("attempt_id","exercise_id");--> statement-breakpoint
CREATE INDEX "attempt_answers_attempt_idx" ON "attempt_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_exercises_attempt_exercise_unique" ON "attempt_exercises" USING btree ("attempt_id","exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_exercises_attempt_sort_unique" ON "attempt_exercises" USING btree ("attempt_id","sort_order");--> statement-breakpoint
CREATE INDEX "attempts_student_module_idx" ON "attempts" USING btree ("student_user_id","module_id");--> statement-breakpoint
CREATE INDEX "attempts_status_idx" ON "attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exercise_options_exercise_idx" ON "exercise_options" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_module_progress_student_module_unique" ON "student_module_progress" USING btree ("student_user_id","module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_telegram_user_id_unique" ON "users" USING btree ("telegram_user_id");--> statement-breakpoint
CREATE INDEX "users_role_status_idx" ON "users" USING btree ("role","status");--> statement-breakpoint
CREATE UNIQUE INDEX "xp_transactions_student_source_unique" ON "xp_transactions" USING btree ("student_user_id","source_type","source_id");--> statement-breakpoint
CREATE INDEX "xp_transactions_student_idx" ON "xp_transactions" USING btree ("student_user_id");