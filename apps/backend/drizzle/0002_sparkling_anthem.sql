ALTER TABLE "attempt_answers" ADD COLUMN "client_answer_id" text;--> statement-breakpoint
UPDATE "attempt_answers" SET "client_answer_id" = "id"::text WHERE "client_answer_id" IS NULL;--> statement-breakpoint
ALTER TABLE "attempt_answers" ALTER COLUMN "client_answer_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_answers_attempt_client_answer_unique" ON "attempt_answers" USING btree ("attempt_id","client_answer_id");
