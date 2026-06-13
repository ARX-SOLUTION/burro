import { createHash } from "node:crypto";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { DEMO_STUDENT_ID } from "../modules/auth/dev-header.adapter";
import * as schema from "./schema";

/**
 * Idempotent demo seed. Re-running upserts the same deterministic rows rather
 * than duplicating or hard-deleting learning progress: every id is derived from
 * a stable logical key via `det()`, and every write is an upsert.
 *
 * Run: DATABASE_URL=... pnpm --filter @burro/backend db:seed
 */

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed.");
}

// 1x1 sample silent MP3 (very short) as a playable data URI. Static serving is
// not set up yet; a data URI is playable so the play/playing UI states work.
const PLACEHOLDER_AUDIO_URL =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

const db = drizzle(new Pool({ connectionString: DATABASE_URL }), { schema });

const LANGS = ["uz", "ru", "en"] as const;
type Lang = (typeof LANGS)[number];

const EXERCISE_TYPES = ["find_letter", "find_sound", "listen_find_letter", "listen_find_sound"] as const;
type ExType = (typeof EXERCISE_TYPES)[number];

const GLYPHS = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د"];

/** Deterministic uuid from a logical key, so re-seeding upserts the same rows. */
function det(key: string): string {
  const h = createHash("sha1").update(key).digest("hex");
  return [h.slice(0, 8), h.slice(8, 12), "5" + h.slice(13, 16), "8" + h.slice(17, 20), h.slice(20, 32)].join("-");
}

const MODULE_COUNT = 8;
const EXERCISES_PER_MODULE = 6;

const AUDIO_MEDIA_ID = det("media:placeholder-audio");

function moduleTitles(seq: number): Record<Lang, { title: string; description: string }> {
  return {
    uz: { title: `Modul ${seq}: Arab harflari`, description: `${seq}-modulda arab tovushlari va harflarini o'rganamiz.` },
    ru: { title: `Модуль ${seq}: Арабские буквы`, description: `В модуле ${seq} учим арабские звуки и буквы.` },
    en: { title: `Module ${seq}: Arabic letters`, description: `Module ${seq} covers Arabic sounds and letters.` }
  };
}

function exercisePrompt(seq: number, type: ExType): Record<Lang, string> {
  const glyph = GLYPHS[(seq - 1) % GLYPHS.length];
  switch (type) {
    case "find_letter":
      return {
        uz: `Qaysi harf "${glyph}" ga mos keladi?`,
        ru: `Какая буква соответствует "${glyph}"?`,
        en: `Which letter matches "${glyph}"?`
      };
    case "find_sound":
      return {
        uz: `"${glyph}" qaysi tovushni beradi?`,
        ru: `Какой звук даёт "${glyph}"?`,
        en: `Which sound does "${glyph}" make?`
      };
    case "listen_find_letter":
      return {
        uz: "Tinglang va to'g'ri harfni tanlang",
        ru: "Послушайте и выберите правильную букву",
        en: "Listen and pick the correct letter"
      };
    case "listen_find_sound":
      return {
        uz: "Tinglang va to'g'ri tovushni tanlang",
        ru: "Послушайте и выберите правильный звук",
        en: "Listen and pick the correct sound"
      };
  }
}

function moduleFeedbackText(lang: Lang) {
  const text = {
    uz: { ct: "Ajoyib!", cm: "To'g'ri javob", it: "Yana urinib ko'ramiz", im: "Noto'g'ri javob" },
    ru: { ct: "Отлично!", cm: "Правильный ответ", it: "Попробуем ещё", im: "Неправильный ответ" },
    en: { ct: "Great!", cm: "Correct answer", it: "Let's try again", im: "Wrong answer" }
  } as const;
  return text[lang];
}

type ModuleProgressStatus = "not_started" | "in_progress" | "completed" | "locked";

// Demo student status plan: m1 completed, m2 in_progress, m3-5 not_started,
// m6 premiumRequired+locked, m7-8 locked.
function demoModuleStatus(seq: number): { status: ModuleProgressStatus; premium: boolean } {
  if (seq === 1) return { status: "completed", premium: false };
  if (seq === 2) return { status: "in_progress", premium: false };
  if (seq >= 3 && seq <= 5) return { status: "not_started", premium: false };
  if (seq === 6) return { status: "locked", premium: true };
  return { status: "locked", premium: false };
}

interface OtherStudent {
  id: string;
  firstName: string;
  username: string;
  avatar: string;
  totalXp: number;
}

// Demo student lands mid-pack (rank 6 of 11) so the pinned-rank UI is exercised.
const OTHER_STUDENTS: OtherStudent[] = [
  { id: det("user:amina"), firstName: "Amina", username: "amina", avatar: "https://i.pravatar.cc/100?img=1", totalXp: 1400 },
  { id: det("user:yusuf"), firstName: "Yusuf", username: "yusuf", avatar: "https://i.pravatar.cc/100?img=2", totalXp: 1180 },
  { id: det("user:zaynab"), firstName: "Zaynab", username: "zaynab", avatar: "https://i.pravatar.cc/100?img=3", totalXp: 980 },
  { id: det("user:ibrohim"), firstName: "Ibrohim", username: "ibrohim", avatar: "https://i.pravatar.cc/100?img=4", totalXp: 720 },
  { id: det("user:maryam"), firstName: "Maryam", username: "maryam", avatar: "https://i.pravatar.cc/100?img=5", totalXp: 560 },
  // demo student (~430) sits here, rank 6
  { id: det("user:omar"), firstName: "Omar", username: "omar", avatar: "https://i.pravatar.cc/100?img=6", totalXp: 360 },
  { id: det("user:fotima"), firstName: "Fotima", username: "fotima", avatar: "https://i.pravatar.cc/100?img=7", totalXp: 280 },
  { id: det("user:said"), firstName: "Said", username: "said", avatar: "https://i.pravatar.cc/100?img=8", totalXp: 190 },
  { id: det("user:layla"), firstName: "Layla", username: "layla", avatar: "https://i.pravatar.cc/100?img=9", totalXp: 120 },
  { id: det("user:bilol"), firstName: "Bilol", username: "bilol", avatar: "https://i.pravatar.cc/100?img=10", totalXp: 60 }
];

const DEMO_TOTAL_XP = 430;

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function timestampDaysAgo(daysAgo: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

async function seedMedia() {
  await db
    .insert(schema.media)
    .values({ id: AUDIO_MEDIA_ID, url: PLACEHOLDER_AUDIO_URL, mimeType: "audio/mpeg", kind: "audio" })
    .onConflictDoUpdate({ target: schema.media.id, set: { url: PLACEHOLDER_AUDIO_URL, mimeType: "audio/mpeg", kind: "audio" } });
}

async function seedModules() {
  for (let seq = 1; seq <= MODULE_COUNT; seq += 1) {
    const moduleId = det(`module:${seq}`);
    const { premium } = demoModuleStatus(seq);

    await db
      .insert(schema.modules)
      .values({ id: moduleId, sequenceNo: seq, slug: `module-${seq}`, status: "published", premiumRequired: premium, estimatedMinutes: 10 })
      .onConflictDoUpdate({
        target: schema.modules.id,
        set: { sequenceNo: seq, slug: `module-${seq}`, status: "published", premiumRequired: premium }
      });

    const titles = moduleTitles(seq);
    for (const lang of LANGS) {
      await db
        .insert(schema.moduleTranslations)
        .values({ id: det(`module-tr:${seq}:${lang}`), moduleId, language: lang, title: titles[lang].title, description: titles[lang].description })
        .onConflictDoUpdate({
          target: [schema.moduleTranslations.moduleId, schema.moduleTranslations.language],
          set: { title: titles[lang].title, description: titles[lang].description }
        });

      const fb = moduleFeedbackText(lang);
      await db
        .insert(schema.moduleFeedback)
        .values({ id: det(`module-fb:${seq}:${lang}`), moduleId, language: lang, correctTitle: fb.ct, correctMessage: fb.cm, incorrectTitle: fb.it, incorrectMessage: fb.im })
        .onConflictDoUpdate({
          target: [schema.moduleFeedback.moduleId, schema.moduleFeedback.language],
          set: { correctTitle: fb.ct, correctMessage: fb.cm, incorrectTitle: fb.it, incorrectMessage: fb.im }
        });
    }

    await seedModuleExercises(seq, moduleId);
  }
}

async function seedModuleExercises(seq: number, moduleId: string) {
  for (let i = 0; i < EXERCISES_PER_MODULE; i += 1) {
    const type: ExType = EXERCISE_TYPES[i % EXERCISE_TYPES.length];
    const exerciseId = det(`exercise:${seq}:${i}`);
    const needsAudio = type === "listen_find_letter" || type === "listen_find_sound";

    await db
      .insert(schema.exercises)
      .values({ id: exerciseId, type, status: "published", mediaId: needsAudio ? AUDIO_MEDIA_ID : null, tags: [`module-${seq}`, type] })
      .onConflictDoUpdate({
        target: schema.exercises.id,
        set: { type, status: "published", mediaId: needsAudio ? AUDIO_MEDIA_ID : null, tags: [`module-${seq}`, type] }
      });

    const prompts = exercisePrompt(seq, type);
    for (const lang of LANGS) {
      await db
        .insert(schema.exerciseTranslations)
        .values({ id: det(`exercise-tr:${seq}:${i}:${lang}`), exerciseId, language: lang, prompt: prompts[lang] })
        .onConflictDoUpdate({
          target: [schema.exerciseTranslations.exerciseId, schema.exerciseTranslations.language],
          set: { prompt: prompts[lang] }
        });
    }

    // 4 options; the correct glyph rotates with the exercise index.
    const correctIndex = i % 4;
    for (let o = 0; o < 4; o += 1) {
      const glyph = GLYPHS[(seq - 1 + o) % GLYPHS.length];
      const optionId = det(`option:${seq}:${i}:${o}`);
      await db
        .insert(schema.exerciseOptions)
        .values({ id: optionId, exerciseId, optionText: glyph, isCorrect: o === correctIndex, sortOrder: o })
        .onConflictDoUpdate({
          target: schema.exerciseOptions.id,
          set: { optionText: glyph, isCorrect: o === correctIndex, sortOrder: o }
        });
    }

    await db
      .insert(schema.moduleExercises)
      .values({ id: det(`module-exercise:${seq}:${i}`), moduleId, exerciseId, sortOrder: i })
      .onConflictDoUpdate({
        target: [schema.moduleExercises.moduleId, schema.moduleExercises.exerciseId],
        set: { sortOrder: i }
      });
  }
}

async function seedSounds() {
  for (let i = 0; i < 4; i += 1) {
    const soundId = det(`sound:${i}`);
    const glyph = GLYPHS[i];
    await db
      .insert(schema.sounds)
      .values({ id: soundId, slug: `sound-${i}`, mediaId: AUDIO_MEDIA_ID, glyph, sequenceNo: i + 1 })
      .onConflictDoUpdate({ target: schema.sounds.slug, set: { mediaId: AUDIO_MEDIA_ID, glyph, sequenceNo: i + 1 } });

    const names: Record<Lang, { name: string; description: string }> = {
      uz: { name: `Tovush ${glyph}`, description: `"${glyph}" harfining tovushi` },
      ru: { name: `Звук ${glyph}`, description: `Звук буквы "${glyph}"` },
      en: { name: `Sound ${glyph}`, description: `The sound of letter "${glyph}"` }
    };
    for (const lang of LANGS) {
      await db
        .insert(schema.soundTranslations)
        .values({ id: det(`sound-tr:${i}:${lang}`), soundId, language: lang, name: names[lang].name, description: names[lang].description })
        .onConflictDoUpdate({
          target: [schema.soundTranslations.soundId, schema.soundTranslations.language],
          set: { name: names[lang].name, description: names[lang].description }
        });
    }
  }
}

async function upsertStudent(id: string, firstName: string, username: string, avatar: string, telegramUserId: number) {
  await db
    .insert(schema.users)
    .values({ id, telegramUserId, telegramFirstName: firstName, telegramUsername: username, telegramAvatarUrl: avatar, role: "student", status: "active" })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: { telegramFirstName: firstName, telegramUsername: username, telegramAvatarUrl: avatar }
    });
}

/**
 * Splits a student's total XP across the last 7 days as deterministic
 * xp_transactions (one synthetic source per day) plus matching active-day rows,
 * so weekly/daily leaderboards and the 7-day stats chart have real data.
 */
async function seedStudentActivity(studentId: string, totalXp: number) {
  const perDay = Math.floor(totalXp / 7);
  const remainder = totalXp - perDay * 7;
  let running = 0;

  for (let day = 6; day >= 0; day -= 1) {
    const dayXp = perDay + (day === 0 ? remainder : 0);
    if (dayXp <= 0) {
      continue;
    }
    running += dayXp;

    await db
      .insert(schema.xpTransactions)
      .values({
        id: det(`xp:${studentId}:day-${day}`),
        studentUserId: studentId,
        sourceType: "seed_daily",
        sourceId: det(`xp-src:${studentId}:day-${day}`),
        xpDelta: dayXp,
        reason: "seed_daily",
        createdAt: timestampDaysAgo(day)
      })
      .onConflictDoUpdate({
        target: [schema.xpTransactions.studentUserId, schema.xpTransactions.sourceType, schema.xpTransactions.sourceId],
        set: { xpDelta: dayXp, createdAt: timestampDaysAgo(day) }
      });

    await db
      .insert(schema.studentActiveDays)
      .values({
        id: det(`active:${studentId}:day-${day}`),
        studentUserId: studentId,
        activityDate: isoDateDaysAgo(day),
        answersCount: Math.max(1, Math.round(dayXp / 10)),
        isActiveDay: true
      })
      .onConflictDoUpdate({
        target: [schema.studentActiveDays.studentUserId, schema.studentActiveDays.activityDate],
        set: { answersCount: Math.max(1, Math.round(dayXp / 10)), isActiveDay: true }
      });
  }

  await db
    .insert(schema.studentXpTotals)
    .values({ studentUserId: studentId, totalXp: running })
    .onConflictDoUpdate({ target: schema.studentXpTotals.studentUserId, set: { totalXp: running } });
}

async function seedDemoModuleProgress(studentId: string) {
  for (let seq = 1; seq <= MODULE_COUNT; seq += 1) {
    const moduleId = det(`module:${seq}`);
    const { status } = demoModuleStatus(seq);
    const completed = status === "completed";
    const inProgress = status === "in_progress";
    const completedExercises = completed ? EXERCISES_PER_MODULE : inProgress ? 2 : 0;
    const progressPercent = Math.round((completedExercises / EXERCISES_PER_MODULE) * 100);

    await db
      .insert(schema.studentModuleProgress)
      .values({
        id: det(`progress:${studentId}:${seq}`),
        studentUserId: studentId,
        moduleId,
        status,
        completedExercises,
        totalExercises: EXERCISES_PER_MODULE,
        progressPercent,
        finalQuizBestScore: completed ? 100 : null,
        finalQuizPassed: completed,
        startedAt: completed || inProgress ? timestampDaysAgo(seq) : null,
        completedAt: completed ? timestampDaysAgo(seq - 1) : null
      })
      .onConflictDoUpdate({
        target: [schema.studentModuleProgress.studentUserId, schema.studentModuleProgress.moduleId],
        set: { status, completedExercises, totalExercises: EXERCISES_PER_MODULE, progressPercent, finalQuizPassed: completed }
      });
  }
}

async function seedPremium(studentId: string) {
  // Demo student has a pending premium request (m6 premium gate) and no active grant.
  await db
    .insert(schema.premiumRequests)
    .values({ id: det(`premium-req:${studentId}`), studentUserId: studentId, status: "pending", createdAt: timestampDaysAgo(1) })
    .onConflictDoUpdate({ target: schema.premiumRequests.id, set: { status: "pending" } });

  // One other student has an active grant so the approved/active path has data.
  const grantee = OTHER_STUDENTS[0].id;
  await db
    .insert(schema.premiumGrants)
    .values({ id: det(`premium-grant:${grantee}`), studentUserId: grantee, status: "active", source: "seed", grantedAt: timestampDaysAgo(10), expiresAt: null })
    .onConflictDoUpdate({ target: schema.premiumGrants.id, set: { status: "active", source: "seed" } });
}

async function seedAttempts(studentId: string) {
  // A completed practice attempt on module 1 so attempt history has data. XP for
  // it is folded into the demo student's seeded total above; we do not add new
  // xp_transactions here to keep the total deterministic.
  const moduleId = det("module:1");
  const exerciseIds = Array.from({ length: EXERCISES_PER_MODULE }, (_, i) => det(`exercise:1:${i}`));
  const attemptId = det(`attempt:${studentId}:module-1-practice`);

  await db
    .insert(schema.attempts)
    .values({
      id: attemptId,
      studentUserId: studentId,
      moduleId,
      attemptType: "practice",
      status: "completed",
      score: 100,
      heartsStart: 5,
      heartsRemaining: 5,
      correctCount: EXERCISES_PER_MODULE,
      xpEarned: EXERCISES_PER_MODULE * 10 + 50,
      startedAt: timestampDaysAgo(2),
      completedAt: timestampDaysAgo(2)
    })
    .onConflictDoUpdate({
      target: schema.attempts.id,
      set: { status: "completed", score: 100, correctCount: EXERCISES_PER_MODULE, xpEarned: EXERCISES_PER_MODULE * 10 + 50 }
    });

  for (let i = 0; i < exerciseIds.length; i += 1) {
    await db
      .insert(schema.attemptExercises)
      .values({ id: det(`attempt-ex:${attemptId}:${i}`), attemptId, exerciseId: exerciseIds[i], sortOrder: i })
      .onConflictDoNothing({ target: [schema.attemptExercises.attemptId, schema.attemptExercises.exerciseId] });
  }
}

async function rowCounts() {
  const tables = [
    "users",
    "modules",
    "module_translations",
    "module_feedback",
    "exercises",
    "exercise_translations",
    "exercise_options",
    "module_exercises",
    "media",
    "sounds",
    "sound_translations",
    "student_module_progress",
    "student_xp_totals",
    "xp_transactions",
    "student_active_days",
    "premium_grants",
    "premium_requests",
    "attempts",
    "attempt_exercises"
  ];
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const result = await db.execute<{ count: string }>(sql.raw(`select count(*)::int as count from ${table}`));
    const rows = (result as unknown as { rows?: Array<{ count: number }> }).rows ?? (result as unknown as Array<{ count: number }>);
    counts[table] = Number(rows[0]?.count ?? 0);
  }
  return counts;
}

async function main() {
  await seedMedia();
  await seedModules();
  await seedSounds();

  // Insert all student users first so later FK-bearing rows (premium, XP,
  // progress) always reference an existing user regardless of seed order.
  await upsertStudent(DEMO_STUDENT_ID, "Demo Student", "demo_student", "https://i.pravatar.cc/100?img=12", 100000001);
  for (let i = 0; i < OTHER_STUDENTS.length; i += 1) {
    const s = OTHER_STUDENTS[i];
    await upsertStudent(s.id, s.firstName, s.username, s.avatar, 100000100 + i);
  }

  // Demo student derived data.
  await seedStudentActivity(DEMO_STUDENT_ID, DEMO_TOTAL_XP);
  await seedDemoModuleProgress(DEMO_STUDENT_ID);
  await seedPremium(DEMO_STUDENT_ID);
  await seedAttempts(DEMO_STUDENT_ID);

  // Other students' XP/activity.
  for (const s of OTHER_STUDENTS) {
    await seedStudentActivity(s.id, s.totalXp);
  }

  const counts = await rowCounts();
  console.log("Seed complete. Demo student id:", DEMO_STUDENT_ID);
  console.log("Row counts:");
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(26)} ${count}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
