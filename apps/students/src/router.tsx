import { Suspense, lazy } from "react";
import { Outlet, createRootRoute, createRoute, createRouter, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { BottomNav, GlassCard, StudentShell } from "./components";

const ExercisePlayer = lazy(() => import("./features/attempts/ExercisePlayer").then((m) => ({ default: m.ExercisePlayer })));
const DashboardScreen = lazy(() => import("./screens/DashboardScreen").then((m) => ({ default: m.DashboardScreen })));
const LeaderboardScreen = lazy(() => import("./screens/LeaderboardScreen").then((m) => ({ default: m.LeaderboardScreen })));
const ModulePathScreen = lazy(() => import("./screens/ModulePathScreen").then((m) => ({ default: m.ModulePathScreen })));
const ModulesScreen = lazy(() => import("./screens/ModulesScreen").then((m) => ({ default: m.ModulesScreen })));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen").then((m) => ({ default: m.ProfileScreen })));
const WelcomeScreen = lazy(() => import("./screens/WelcomeScreen").then((m) => ({ default: m.WelcomeScreen })));
const LoginScreen = lazy(() => import("./screens/LoginScreen").then((m) => ({ default: m.LoginScreen })));
const StatsScreen = lazy(() => import("./screens/StatsScreen").then((m) => ({ default: m.StatsScreen })));
const ModuleCompletedScreen = lazy(() => import("./screens/ModuleCompletedScreen").then((m) => ({ default: m.ModuleCompletedScreen })));
const SoundInfoScreen = lazy(() => import("./screens/SoundInfoScreen").then((m) => ({ default: m.SoundInfoScreen })));

function ScreenFallback() {
  return <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>Yuklanmoqda...</div>;
}

const tabs = ["dashboard", "modules", "leaderboard", "profile"];

function RootLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const active = pathname.includes("/practice") || pathname.includes("/quiz")
    ? "learn"
    : tabs.find((tab) => pathname.startsWith(`/${tab}`)) ?? "dashboard";
  const showNav =
    !pathname.includes("/practice") &&
    !pathname.includes("/quiz") &&
    !pathname.startsWith("/welcome") &&
    !pathname.startsWith("/login");

  return <StudentShell>
    <Outlet />
    {showNav && <BottomNav
      active={active}
      onChange={(tab) => {
        if (tab === "learn") {
          navigate({ to: "/modules/$moduleId/practice", params: { moduleId: "module-letters-1" } });
          return;
        }
        navigate({ to: `/${tab}` });
      }}
    />}
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

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  component: () => <Suspense fallback={<ScreenFallback />}><WelcomeScreen /></Suspense>
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <Suspense fallback={<ScreenFallback />}><LoginScreen /></Suspense>
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stats",
  component: () => <Suspense fallback={<ScreenFallback />}><StatsScreen /></Suspense>
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

function ModuleCompletedRouteComponent() {
  const { moduleId } = moduleCompletedRoute.useParams();
  return <Suspense fallback={<ScreenFallback />}><ModuleCompletedScreen moduleId={moduleId} /></Suspense>;
}

const moduleCompletedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules/$moduleId/completed",
  component: ModuleCompletedRouteComponent
});

function SoundInfoRouteComponent() {
  const { moduleId, soundId } = soundInfoRoute.useParams();
  return <Suspense fallback={<ScreenFallback />}><SoundInfoScreen moduleId={moduleId} soundId={soundId} /></Suspense>;
}

const soundInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learn/$moduleId/sounds/$soundId/info",
  component: SoundInfoRouteComponent
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
  welcomeRoute,
  loginRoute,
  dashboardRoute,
  modulesRoute,
  modulePathRoute,
  practiceRoute,
  quizRoute,
  moduleCompletedRoute,
  soundInfoRoute,
  leaderboardRoute,
  profileRoute,
  statsRoute,
  premiumRoute,
  notificationsRoute
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
