import {
  bigint,
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "parent", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "blocked", "deleted"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "published", "archived"]);
export const languageEnum = pgEnum("language", ["uz", "ru", "en"]);
export const exerciseTypeEnum = pgEnum("exercise_type", [
  "find_letter",
  "find_sound",
  "listen_find_letter",
  "listen_find_sound"
]);
export const attemptTypeEnum = pgEnum("attempt_type", ["practice", "final_quiz"]);
export const attemptStatusEnum = pgEnum("attempt_status", ["in_progress", "completed", "failed", "passed"]);
export const moduleProgressStatusEnum = pgEnum("module_progress_status", [
  "not_started",
  "in_progress",
  "completed",
  "locked"
]);
export const premiumGrantStatusEnum = pgEnum("premium_grant_status", ["active", "expired", "revoked"]);
export const premiumRequestStatusEnum = pgEnum("premium_request_status", ["pending", "approved", "rejected"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    telegramUserId: bigint("telegram_user_id", { mode: "number" }).notNull(),
    telegramFirstName: text("telegram_first_name").notNull(),
    telegramLastName: text("telegram_last_name"),
    telegramUsername: text("telegram_username"),
    telegramAvatarUrl: text("telegram_avatar_url"),
    role: roleEnum("role").notNull(),
    status: userStatusEnum("status").notNull().default("active"),
    preferredLanguage: languageEnum("preferred_language").notNull().default("uz"),
    ...timestamps,
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (table) => [
    uniqueIndex("users_telegram_user_id_unique").on(table.telegramUserId),
    index("users_role_status_idx").on(table.role, table.status)
  ]
);

export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequenceNo: integer("sequence_no").notNull(),
  slug: text("slug").notNull(),
  status: contentStatusEnum("status").notNull().default("draft"),
  premiumRequired: boolean("premium_required").notNull().default(false),
  passScore: integer("pass_score").notNull().default(80),
  heartsCount: integer("hearts_count").notNull().default(5),
  estimatedMinutes: integer("estimated_minutes"),
  shuffleExercises: boolean("shuffle_exercises").notNull().default(false),
  shuffleQuizQuestions: boolean("shuffle_quiz_questions").notNull().default(false),
  quizSource: text("quiz_source").notNull().default("random"),
  quizQuestionCount: integer("quiz_question_count").notNull().default(10),
  correctAnswerXp: integer("correct_answer_xp").notNull().default(10),
  practiceCompletionXp: integer("practice_completion_xp").notNull().default(50),
  finalQuizPassXp: integer("final_quiz_pass_xp").notNull().default(100),
  moduleCompletionXp: integer("module_completion_xp").notNull().default(150),
  ...timestamps,
  archivedAt: timestamp("archived_at", { withTimezone: true })
});

export const moduleFeedback = pgTable(
  "module_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id),
    language: languageEnum("language").notNull().default("uz"),
    correctTitle: text("correct_title").notNull(),
    correctMessage: text("correct_message").notNull(),
    incorrectTitle: text("incorrect_title").notNull(),
    incorrectMessage: text("incorrect_message").notNull()
  },
  (table) => [uniqueIndex("module_feedback_module_language_unique").on(table.moduleId, table.language)]
);

export const moduleTranslations = pgTable(
  "module_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id),
    language: languageEnum("language").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull()
  },
  (table) => [uniqueIndex("module_translations_module_language_unique").on(table.moduleId, table.language)]
);

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  mimeType: text("mime_type"),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: exerciseTypeEnum("type").notNull(),
  status: contentStatusEnum("status").notNull().default("draft"),
  mediaId: uuid("media_id").references(() => media.id),
  tags: text("tags").array().notNull().default([]),
  ...timestamps,
  archivedAt: timestamp("archived_at", { withTimezone: true })
});

export const exerciseTranslations = pgTable(
  "exercise_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id),
    language: languageEnum("language").notNull(),
    prompt: text("prompt").notNull()
  },
  (table) => [uniqueIndex("exercise_translations_exercise_language_unique").on(table.exerciseId, table.language)]
);

export const moduleExercises = pgTable(
  "module_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id),
    sortOrder: integer("sort_order").notNull()
  },
  (table) => [
    uniqueIndex("module_exercises_module_exercise_unique").on(table.moduleId, table.exerciseId),
    uniqueIndex("module_exercises_module_sort_unique").on(table.moduleId, table.sortOrder)
  ]
);

export const exerciseOptions = pgTable(
  "exercise_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id),
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    sortOrder: integer("sort_order").notNull()
  },
  (table) => [index("exercise_options_exercise_idx").on(table.exerciseId)]
);

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id),
    attemptType: attemptTypeEnum("attempt_type").notNull(),
    status: attemptStatusEnum("status").notNull().default("in_progress"),
    score: integer("score"),
    heartsStart: integer("hearts_start"),
    heartsRemaining: integer("hearts_remaining"),
    correctCount: integer("correct_count").notNull().default(0),
    xpEarned: integer("xp_earned").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true })
  },
  (table) => [
    index("attempts_student_module_idx").on(table.studentUserId, table.moduleId),
    index("attempts_status_idx").on(table.status)
  ]
);

export const attemptExercises = pgTable(
  "attempt_exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id),
    sortOrder: integer("sort_order").notNull()
  },
  (table) => [
    uniqueIndex("attempt_exercises_attempt_exercise_unique").on(table.attemptId, table.exerciseId),
    uniqueIndex("attempt_exercises_attempt_sort_unique").on(table.attemptId, table.sortOrder)
  ]
);

export const attemptAnswers = pgTable(
  "attempt_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id),
    clientAnswerId: text("client_answer_id").notNull(),
    selectedOptionId: uuid("selected_option_id")
      .notNull()
      .references(() => exerciseOptions.id),
    correctOptionId: uuid("correct_option_id")
      .notNull()
      .references(() => exerciseOptions.id),
    isCorrect: boolean("is_correct").notNull(),
    xpDelta: integer("xp_delta").notNull().default(0),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("attempt_answers_attempt_exercise_unique").on(table.attemptId, table.exerciseId),
    uniqueIndex("attempt_answers_attempt_client_answer_unique").on(table.attemptId, table.clientAnswerId),
    index("attempt_answers_attempt_idx").on(table.attemptId)
  ]
);

export const studentModuleProgress = pgTable(
  "student_module_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id),
    status: moduleProgressStatusEnum("status").notNull().default("not_started"),
    completedExercises: integer("completed_exercises").notNull().default(0),
    totalExercises: integer("total_exercises").notNull().default(0),
    progressPercent: integer("progress_percent").notNull().default(0),
    finalQuizBestScore: integer("final_quiz_best_score"),
    finalQuizPassed: boolean("final_quiz_passed").notNull().default(false),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true })
  },
  (table) => [uniqueIndex("student_module_progress_student_module_unique").on(table.studentUserId, table.moduleId)]
);

export const xpTransactions = pgTable(
  "xp_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id),
    sourceType: text("source_type").notNull(),
    sourceId: uuid("source_id").notNull(),
    xpDelta: integer("xp_delta").notNull(),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("xp_transactions_student_source_unique").on(table.studentUserId, table.sourceType, table.sourceId),
    index("xp_transactions_student_idx").on(table.studentUserId)
  ]
);

export const studentXpTotals = pgTable("student_xp_totals", {
  studentUserId: uuid("student_user_id")
    .primaryKey()
    .references(() => users.id),
  totalXp: integer("total_xp").notNull().default(0)
});

export const studentActiveDays = pgTable(
  "student_active_days",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id),
    activityDate: date("activity_date", { mode: "string" }).notNull(),
    answersCount: integer("answers_count").notNull().default(0),
    isActiveDay: boolean("is_active_day").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("student_active_days_student_date_unique").on(table.studentUserId, table.activityDate),
    index("student_active_days_student_idx").on(table.studentUserId)
  ]
);

export const sounds = pgTable(
  "sounds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    mediaId: uuid("media_id").references(() => media.id),
    glyph: text("glyph").notNull(),
    sequenceNo: integer("sequence_no").notNull().default(0),
    ...timestamps
  },
  (table) => [uniqueIndex("sounds_slug_unique").on(table.slug)]
);

export const soundTranslations = pgTable(
  "sound_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    soundId: uuid("sound_id")
      .notNull()
      .references(() => sounds.id),
    language: languageEnum("language").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull()
  },
  (table) => [uniqueIndex("sound_translations_sound_language_unique").on(table.soundId, table.language)]
);

export const premiumGrants = pgTable(
  "premium_grants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id),
    status: premiumGrantStatusEnum("status").notNull().default("active"),
    source: text("source").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true })
  },
  (table) => [index("premium_grants_student_idx").on(table.studentUserId)]
);

export const premiumRequests = pgTable(
  "premium_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentUserId: uuid("student_user_id")
      .notNull()
      .references(() => users.id),
    status: premiumRequestStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true })
  },
  (table) => [index("premium_requests_student_idx").on(table.studentUserId)]
);
