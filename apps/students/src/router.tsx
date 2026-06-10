import { Outlet, createRootRoute, createRoute, createRouter, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { BottomNav, GlassCard, StudentShell, XpCounter } from "./components";
import { ExercisePlayer } from "./features/attempts/ExercisePlayer";
import { DashboardScreen } from "./screens/DashboardScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { ModulePathScreen } from "./screens/ModulePathScreen";
import { ModulesScreen } from "./screens/ModulesScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

const tabs = ["dashboard", "modules", "leaderboard", "profile"];

function RootLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const active = tabs.find((tab) => pathname.startsWith(`/${tab}`)) ?? "dashboard";

  return <StudentShell>
    <div className="top-row"><h1>Burro</h1><XpCounter xp={1280} /></div>
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
  component: DashboardScreen
});

const modulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules",
  component: ModulesScreen
});

function ModulePathRouteComponent() {
  const { moduleId } = modulePathRoute.useParams();
  return <ModulePathScreen moduleId={moduleId} />;
}

const modulePathRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules/$moduleId",
  component: ModulePathRouteComponent
});

function PracticeRouteComponent() {
  const { moduleId } = practiceRoute.useParams();
  return <ExercisePlayer moduleId={moduleId} mode="practice" />;
}

const practiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules/$moduleId/practice",
  component: PracticeRouteComponent
});

function QuizRouteComponent() {
  const { moduleId } = quizRoute.useParams();
  return <ExercisePlayer moduleId={moduleId} mode="final_quiz" />;
}

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/modules/$moduleId/quiz",
  component: QuizRouteComponent
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboard",
  component: LeaderboardScreen
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfileScreen
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
