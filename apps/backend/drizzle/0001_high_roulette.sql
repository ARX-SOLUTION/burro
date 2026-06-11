CREATE TABLE "module_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"language" "language" DEFAULT 'uz' NOT NULL,
	"correct_title" text NOT NULL,
	"correct_message" text NOT NULL,
	"incorrect_title" text NOT NULL,
	"incorrect_message" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "xp_transactions" ALTER COLUMN "source_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "module_feedback" ADD CONSTRAINT "module_feedback_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "module_feedback_module_language_unique" ON "module_feedback" USING btree ("module_id","language");