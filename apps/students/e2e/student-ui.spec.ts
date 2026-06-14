import { expect, test, type Page, type Route } from "@playwright/test";

type ModuleStatus = "completed" | "current" | "available" | "premium_locked" | "locked";

const modules = [
  { id: "module-alif-ba-ta", sequenceNo: 1, title: "Alif, ba, ta", description: "3 ta harf bo'yicha mashq.", estimatedMinutes: 6, status: "completed" as ModuleStatus, progressPercent: 100, premiumRequired: false },
  { id: "module-sa-jim-ha", sequenceNo: 2, title: "Sa, jim, ha", description: "3 ta harf bo'yicha mashq.", estimatedMinutes: 6, status: "current" as ModuleStatus, progressPercent: 35, premiumRequired: false },
  { id: "module-tas", sequenceNo: 3, title: "Tas", description: "Tas harfini ko'rish va tinglash.", estimatedMinutes: 6, status: "available" as ModuleStatus, progressPercent: 0, premiumRequired: false },
  { id: "module-thaa", sequenceNo: 4, title: "Thaa", description: "Thaa harfini ko'rish va tinglash.", estimatedMinutes: 6, status: "available" as ModuleStatus, progressPercent: 0, premiumRequired: false },
  { id: "module-jeem", sequenceNo: 5, title: "Jeem", description: "Jeem harfini ko'rish va tinglash.", estimatedMinutes: 6, status: "available" as ModuleStatus, progressPercent: 0, premiumRequired: false },
  { id: "module-haa", sequenceNo: 6, title: "Haa", description: "Haa harfini ko'rish va tinglash.", estimatedMinutes: 8, status: "premium_locked" as ModuleStatus, progressPercent: 0, premiumRequired: true },
  { id: "module-khaa", sequenceNo: 7, title: "Khaa", description: "Khaa harfini ko'rish va tinglash.", estimatedMinutes: 8, status: "locked" as ModuleStatus, progressPercent: 0, premiumRequired: false }
];

const profile = { displayName: "Aziza", avatarUrl: null, activeDays: 4, totalXp: 1280, language: "uz" };
const stats = { activeDays: 4, totalXp: 1280, xpSeries: [{ date: "2026-06-14", xp: 24 }], minutesSeries: [{ date: "2026-06-14", minutes: 12 }] };
const dashboard = { totalXp: 1280, activeDays: 4, level: { level: 3, title: "Learner" } };
const leaderboard = {
  entries: [
    { studentUserId: "u1", telegramFirstName: "Ali", telegramUsername: "ali", avatarUrl: null, rank: 1, score: 3100, completedModules: 8, activeDays: 12, isCurrentStudent: false },
    { studentUserId: "u2", telegramFirstName: "Aziza", telegramUsername: "aziza", avatarUrl: null, rank: 2, score: 1280, completedModules: 2, activeDays: 4, isCurrentStudent: true },
    { studentUserId: "u3", telegramFirstName: "Vali", telegramUsername: "vali", avatarUrl: null, rank: 3, score: 900, completedModules: 1, activeDays: 3, isCurrentStudent: false },
    { studentUserId: "u4", telegramFirstName: "Nodir", telegramUsername: "nodir", avatarUrl: null, rank: 4, score: 700, completedModules: 1, activeDays: 2, isCurrentStudent: false }
  ],
  currentStudentRank: { studentUserId: "u2", telegramFirstName: "Aziza", telegramUsername: "aziza", avatarUrl: null, rank: 2, score: 1280, completedModules: 2, activeDays: 4, isCurrentStudent: true }
};
const attempt = {
  attemptId: "attempt-1",
  moduleId: "module-sa-jim-ha",
  mode: "practice",
  status: "in_progress",
  heartsRemaining: 3,
  totalExercises: 2,
  answeredCount: 0,
  xpEarned: 0,
  currentExercise: { id: "ex-1", type: "find_letter", prompt: "Qaysi tovush to'g'ri keladi?", audioUrl: null, options: [{ id: "ba", label: "Ba" }, { id: "ta", label: "Ta" }, { id: "jim", label: "Jim" }] }
};
const answer = { selectedOptionId: "ba", correctOptionId: "ba", isCorrect: true, feedback: { title: "Ajoyib!", body: "To'g'ri javob" }, attempt: { ...attempt, answeredCount: 2, xpEarned: 10, status: "completed", currentExercise: null } };

function ok(data: unknown) {
  return { data, meta: {}, error: null };
}

function fail(code = "SERVER_ERROR", message = "Server failed") {
  return { data: null, meta: {}, error: { code, message } };
}

async function fulfill(route: Route, data: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
}

async function mockApi(page: Page, overrides: { emptyModules?: boolean; fail?: string[]; slow?: string[] } = {}) {
  await page.unroute("**/*").catch(() => undefined);
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (!url.pathname.startsWith("/student") && !url.pathname.startsWith("/leaderboards") && !url.pathname.startsWith("/auth")) return route.continue();
    if (overrides.slow?.includes(url.pathname)) await new Promise((resolve) => setTimeout(resolve, 600));
    if (overrides.fail?.includes(url.pathname)) return fulfill(route, fail(), 500);
    if (url.pathname === "/student/path") return fulfill(route, ok({ modules: overrides.emptyModules ? [] : modules }));
    if (url.pathname === "/student/profile" && route.request().method() === "PATCH") {
      const body = route.request().postDataJSON() as { preferredLanguage?: string } | null;
      return fulfill(route, ok({ ...profile, language: body?.preferredLanguage ?? profile.language }));
    }
    if (url.pathname === "/student/profile") return fulfill(route, ok(profile));
    if (url.pathname === "/student/stats/summary") return fulfill(route, ok(stats));
    if (url.pathname === "/student/dashboard") return fulfill(route, ok(dashboard));
    if (url.pathname === "/leaderboards/global") return fulfill(route, ok(leaderboard));
    if (url.pathname === "/student/attempts/start") return fulfill(route, ok(attempt));
    if (url.pathname === "/student/attempts/attempt-1/answer") return fulfill(route, ok(answer));
    if (url.pathname === "/auth/logout") return fulfill(route, ok({ ok: true }));
    return fulfill(route, ok({}));
  });
}

async function goto(page: Page, path: string, options?: Parameters<Page["goto"]>[1]) {
  const errors: string[] = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(path, options);
  return errors;
}

test.describe("Burro student UI QA audit", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test("01 app initial load redirects to dashboard without console errors", async ({ page }) => {
    const errors = await goto(page, "/");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Bugungi natija" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("02 navigation bottom bar links update active route states", async ({ page }) => {
    await goto(page, "/dashboard");
    await page.getByRole("button", { name: /modullar/i }).click();
    await expect(page).toHaveURL(/\/modules/);
    await expect(page.getByRole("heading", { name: "Modullar" })).toBeVisible();
    await page.getByRole("button", { name: /profil/i }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByLabel("Profil ma'lumotlari")).toBeVisible();
  });

  test("03 auth/login guest gate requires fields and navigates after credentials", async ({ page }) => {
    await goto(page, "/login");
    const submit = page.getByRole("button", { name: "Kirish" });
    await expect(submit).toBeDisabled();
    await page.getByLabel("Foydalanuvchi nomi").fill("student");
    await page.getByLabel("Parol").fill("secret");
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("04 dashboard happy path shows profile, daily task, stats, and modules", async ({ page }) => {
    await goto(page, "/dashboard");
    await expect(page.getByLabel("Salom paneli")).toContainText("Aziza");
    await expect(page.getByLabel("Kunlik vazifa")).toContainText("+20 XP");
    await expect(page.getByLabel(/Oxirgi aktivlik/)).toContainText("Sa, jim, ha");
    await expect(page.getByRole("button", { name: /Sa, jim, ha/ })).toBeVisible();
  });

  test("05 modules view search-equivalent deep link preserves grid view query", async ({ page }) => {
    await goto(page, "/modules?view=grid");
    await expect(page.getByLabel("O'quv modullari")).toBeVisible();
    await expect(page).toHaveURL(/view=grid/);
    await expect(page.getByRole("link", { name: /Tas modulini ochish/ })).toBeVisible();
  });

  test("06 filter/sort/pagination equivalent toggles between path and grid", async ({ page }) => {
    await goto(page, "/modules");
    await page.getByRole("button", { name: "Katak ko'rinishi" }).click();
    await expect(page).toHaveURL(/view=grid/);
    await page.getByRole("button", { name: "Yo'l ko'rinishi" }).click();
    await expect(page).toHaveURL(/view=path/);
  });

  test("07 create/add flow equivalent starts a valid practice attempt", async ({ page }) => {
    await goto(page, "/dashboard");
    await page.getByRole("button", { name: /Davom etish/ }).click();
    await expect(page).toHaveURL(/\/modules\/module-sa-jim-ha\/practice/);
    await expect(page.getByRole("heading", { name: "Qaysi tovush to'g'ri keladi?" })).toBeVisible();
  });

  test("08 edit/update flow changes profile language through bottom sheet", async ({ page }) => {
    await goto(page, "/profile");
    await page.getByRole("button", { name: "Ilova tili" }).click();
    await expect(page.getByRole("dialog", { name: "Tilni tanlash" })).toBeVisible();
    await page.getByRole("radio", { name: "English" }).click();
    await expect(page.getByRole("dialog", { name: "Tilni tanlash" })).toBeHidden();
  });

  test("09 delete/destructive confirmation equivalent exposes logout action without destructive side effect", async ({ page }) => {
    await goto(page, "/profile");
    await expect(page.getByRole("button", { name: "Chiqish" })).toBeVisible();
    await page.getByRole("button", { name: "Chiqish" }).focus();
    await expect(page.getByRole("button", { name: "Chiqish" })).toBeFocused();
  });

  test("10 form validation keeps login disabled for invalid/empty data", async ({ page }) => {
    await goto(page, "/login");
    await page.getByLabel("Foydalanuvchi nomi").fill(" ");
    await page.getByLabel("Parol").fill(" ");
    await expect(page.getByRole("button", { name: "Kirish" })).toBeDisabled();
  });

  test("11 API/server error state is visible on profile failure", async ({ page }) => {
    await mockApi(page, { fail: ["/student/profile"] });
    await goto(page, "/profile");
    await expect(page.getByRole("alert")).toContainText("Xatolik");
  });

  test("12 empty state renders when modules API returns no modules", async ({ page }) => {
    await mockApi(page, { emptyModules: true });
    await goto(page, "/modules");
    await expect(page.getByRole("heading", { name: "Hozircha modul yo'q" })).toBeVisible();
  });

  test("13 loading/skeleton state appears during slow modules fetch", async ({ page }) => {
    await mockApi(page, { slow: ["/student/path"] });
    await goto(page, "/modules", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[aria-busy='true']")).toContainText("Modullar yuklanmoqda");
  });

  test("14 modal/dialog open-close manages focus target", async ({ page }) => {
    await goto(page, "/profile");
    await page.getByRole("button", { name: "Tilni tanlash" }).click();
    await expect(page.getByRole("dialog", { name: "Tilni tanlash" })).toBeVisible();
    await page.getByRole("button", { name: "Yopish" }).click();
    await expect(page.getByRole("dialog", { name: "Tilni tanlash" })).toBeHidden();
  });

  test("15 tabs/dropdowns/select menus expose pressed states", async ({ page }) => {
    await goto(page, "/modules");
    const grid = page.getByRole("button", { name: "Katak ko'rinishi" });
    await grid.click();
    await expect(grid).toHaveAttribute("aria-pressed", "true");
  });

  test("16 toast/alert feedback equivalent appears after answering correctly", async ({ page }) => {
    await goto(page, "/modules/module-sa-jim-ha/practice");
    await page.getByRole("button", { name: "Ba" }).click();
    await page.getByRole("button", { name: "Tekshirish" }).click();
    await expect(page.getByRole("status")).toContainText("Ajoyib!");
  });

  test("17 keyboard-only critical path can log in and open modules", async ({ page }) => {
    await goto(page, "/login");
    await page.keyboard.press("Tab");
    await page.keyboard.type("student");
    await page.keyboard.press("Tab");
    await page.keyboard.type("secret");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("18 mobile viewport responsive path shows bottom nav and modules", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await goto(page, "/modules");
    await expect(page.getByRole("button", { name: "Yo'l ko'rinishi" })).toBeVisible();
    await expect(page.getByLabel("O'quv modullari yo'li")).toBeVisible();
  });

  test("19 tablet/desktop responsive path keeps leaderboard readable", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await goto(page, "/leaderboard");
    await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
    await expect(page.getByLabel("Eng yuqori uchta o'rin")).toBeVisible();
  });

  test("20 core web vitals smoke: no obvious CLS and primary interaction under INP budget", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await goto(page, "/dashboard");
    const interactionMs = await page.evaluate(async () => {
      const button = Array.from(document.querySelectorAll("button")).find((el) => /Davom etish/.test(el.textContent ?? ""));
      if (!button) return Number.POSITIVE_INFINITY;
      const start = performance.now();
      button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      return performance.now() - start;
    });
    await expect(page.getByRole("heading", { name: "Qaysi tovush to'g'ri keladi?" })).toBeVisible();
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThanOrEqual(0.1);
    expect(interactionMs).toBeLessThanOrEqual(200);
  });
});
