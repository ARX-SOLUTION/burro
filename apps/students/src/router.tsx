import { Suspense, lazy } from "react";
import { Outlet, createRootRoute, createRoute, createRouter, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { BottomNav, GlassCard, LevelBadge, StudentShell, XpCounter } from "./components";
import { useXpTotal } from "./features/xp/hooks";
import { useLevel } from "./features/level/hooks";

const ExercisePlayer = lazy(() => import("./features/attempts/ExercisePlayer").then((m) => ({ default: m.ExercisePlayer })));
const DashboardScreen = lazy(() => import("./screens/DashboardScreen").then((m) => ({ default: m.DashboardScreen })));
const LeaderboardScreen = lazy(() => import("./screens/LeaderboardScreen").then((m) => ({ default: m.LeaderboardScreen })));
const ModulePathScreen = lazy(() => import("./screens/ModulePathScreen").then((m) => ({ default: m.ModulePathScreen })));
const ModulesScreen = lazy(() => import("./screens/ModulesScreen").then((m) => ({ default: m.ModulesScreen })));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen").then((m) => ({ default: m.ProfileScreen })));

function ScreenFallback() {
  return <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>Yuklanmoqda...</div>;
}

const tabs = ["dashboard", "modules", "leaderboard", "profile"];

function RootLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const active = tabs.find((tab) => pathname.startsWith(`/${tab}`)) ?? "dashboard";
  const { data: xpTotal } = useXpTotal();
  const { data: levelInfo } = useLevel();

  return <StudentShell>
    <div className="top-row"><h1>Burro</h1><div className="top-row__stats"><LevelBadge level={levelInfo?.level ?? 1} progressPercent={levelInfo?.progressPercent ?? 0} /><XpCounter xp={xpTotal?.totalXp ?? 0} /></div></div>
    <Outlet />
    <BottomNav active={active} onChange={(tab) => navigate({ to: `/${tab}` })} />
  </StudentShell>;
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  }
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => <Suspense fallback={<ScreenFallback />}><DashboardScreen /></Suspense>
});

const modulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules",
  component: () => <Suspense fallback={<ScreenFallback />}><ModulesScreen /></Suspense>
});

function ModulePathRouteComponent() {
  const { moduleId } = modulePathRoute.useParams();
  return <Suspense fallback={<ScreenFallback />}><ModulePathScreen moduleId={moduleId} /></Suspense>;
}

const modulePathRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules/$moduleId",
  component: ModulePathRouteComponent
});

function PracticeRouteComponent() {
  const { moduleId } = practiceRoute.useParams();
  return <Suspense fallback={<ScreenFallback />}><ExercisePlayer moduleId={moduleId} mode="practice" /></Suspense>;
}

const practiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules/$moduleId/practice",
  component: PracticeRouteComponent
});

function QuizRouteComponent() {
  const { moduleId } = quizRoute.useParams();
  return <Suspense fallback={<ScreenFallback />}><ExercisePlayer moduleId={moduleId} mode="final_quiz" /></Suspense>;
}

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules/$moduleId/quiz",
  component: QuizRouteComponent
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: () => <Suspense fallback={<ScreenFallback />}><LeaderboardScreen /></Suspense>
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => <Suspense fallback={<ScreenFallback />}><ProfileScreen /></Suspense>
});

const premiumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/premium",
  component: () => <GlassCard><h2>Premium Center — tez kunda</h2></GlassCard>
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: () => <GlassCard><h2>Bildirishnomalar — tez kunda</h2></GlassCard>
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  modulesRoute,
  modulePathRoute,
  practiceRoute,
  quizRoute,
  leaderboardRoute,
  profileRoute,
  premiumRoute,
  notificationsRoute
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
