// Dashboard aggregator: combines real backend endpoints into the
// StudentDashboardDto shape from doc 13 §6. Each subcall is fault-tolerant so
// the home screen still renders meaningful empty states when one source 404s
// (e.g. /student/profile before the row is seeded) or returns zeros.

import type {
  ModuleCardDto,
  StudentDashboardSummary,
  StudentPathResponse,
  StudentProfileDto,
  StudentStatsSummaryDto
} from "@burro/shared";
import { api } from "../../lib/api";

export type DashboardDailyTask = {
  title: string;
  rewardXp: number;
  completed: boolean;
};

export type DashboardLastActivity = {
  moduleId: string;
  sequenceNo: number;
  title: string;
  progressText: string;
  progressPercent: number;
  estimatedMinutes: number;
} | null;

export type DashboardProfile = {
  displayName: string;
  avatarUrl: string | null;
  activeDays: number;
  language: "uz" | "ru" | "en";
};

export type DashboardToday = {
  learningMinutes: number;
  xp: number;
};

export type DashboardData = {
  profile: DashboardProfile;
  lastActivity: DashboardLastActivity;
  dailyTask: DashboardDailyTask;
  today: DashboardToday;
  modulesPreview: ModuleCardDto[];
  totalXp: number;
  level: number;
};

async function tryGet<T>(path: string): Promise<T | null> {
  try {
    return await api.get<T>(path);
  } catch {
    return null;
  }
}

/** Some legacy endpoints double-wrap the envelope. Defensively unwrap. */
function unwrap<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === "object" && value !== null && "data" in value) {
    return (value as { data: T }).data ?? null;
  }
  return value as T;
}

function pickLastActivity(modules: ModuleCardDto[]): DashboardLastActivity {
  if (modules.length === 0) return null;
  const current = modules.find((m) => m.status === "current");
  const fallback = current ?? modules.find((m) => m.status === "available") ?? modules[0];
  if (!fallback) return null;
  const total = 10; // questions per module — UI hint only when backend has no progress yet
  const answered = Math.round((fallback.progressPercent / 100) * total);
  return {
    moduleId: fallback.id,
    sequenceNo: fallback.sequenceNo,
    title: fallback.title,
    progressText: `${answered}/${total} savol`,
    progressPercent: fallback.progressPercent,
    estimatedMinutes: fallback.estimatedMinutes ?? 6
  };
}

function todayXpFromStats(stats: StudentStatsSummaryDto | null): number {
  if (!stats?.xpSeries?.length) return 0;
  return stats.xpSeries[stats.xpSeries.length - 1]?.xp ?? 0;
}

export async function fetchDashboard(): Promise<DashboardData> {
  const [pathRes, profileRes, statsRes, summaryRes] = await Promise.all([
    tryGet<StudentPathResponse>("/student/path"),
    tryGet<StudentProfileDto>("/student/profile"),
    tryGet<StudentStatsSummaryDto>("/student/stats/summary"),
    tryGet<StudentDashboardSummary | { data: StudentDashboardSummary }>("/student/dashboard")
  ]);

  const modules = pathRes?.modules ?? [];
  const profile = profileRes;
  const stats = statsRes;
  const summary = unwrap<StudentDashboardSummary>(summaryRes);

  const totalXp = summary?.totalXp ?? profile?.totalXp ?? 0;
  const level = summary?.level?.level ?? 1;
  const activeDays = summary?.activeDays ?? profile?.activeDays ?? 0;

  return {
    profile: {
      displayName: profile?.displayName ?? "Talaba",
      avatarUrl: profile?.avatarUrl ?? null,
      activeDays,
      language: (profile?.language ?? "uz") as "uz" | "ru" | "en"
    },
    lastActivity: pickLastActivity(modules),
    dailyTask: {
      title: "10 ta savol yechin",
      rewardXp: 20,
      completed: todayXpFromStats(stats) >= 20
    },
    today: {
      learningMinutes: 0, // backend doesn't track learning minutes yet
      xp: todayXpFromStats(stats)
    },
    modulesPreview: modules.slice(0, 5),
    totalXp,
    level
  };
}
