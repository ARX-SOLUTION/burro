# BURRO FONETIKA
# 13-STUDENT_FLOW_IMPLEMENTATION.md

## 1. Purpose

This file maps the Figma mobile flow into React routes, components, API calls, and state machines.

Related docs:

- [12-FIGMA_FLOW_DESIGN.md](12-FIGMA_FLOW_DESIGN.md)
- [04-API_SPEC.md](04-API_SPEC.md)
- [06-WEBSOCKET_EVENTS.md](06-WEBSOCKET_EVENTS.md)
- [apps/students/DESIGN.md](../apps/students/DESIGN.md)

## 2. Student App Folder Structure

Recommended structure:

```txt
apps/students/src/
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── App.tsx
├── assets/
│   ├── backgrounds/
│   ├── icons/
│   └── avatars/
├── components/
│   ├── background/AppBackground.tsx
│   ├── buttons/PrimaryGlowButton.tsx
│   ├── cards/GlassCard.tsx
│   ├── nav/BottomNav.tsx
│   ├── quiz/QuizShell.tsx
│   ├── quiz/ChoiceButton.tsx
│   ├── quiz/AudioCircleButton.tsx
│   ├── modules/ModuleCard.tsx
│   ├── modules/LearningPathNode.tsx
│   ├── leaderboard/Podium.tsx
│   ├── leaderboard/RankListItem.tsx
│   └── sheets/BottomSheet.tsx
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── modules/
│   ├── learning/
│   ├── leaderboard/
│   ├── profile/
│   └── stats/
├── lib/
│   ├── api.ts
│   ├── telegram.ts
│   ├── queryClient.ts
│   └── cn.ts
└── styles/
    └── globals.css
```

## 3. Routes

Use TanStack Router or React Router. Keep route constants in one file.

```ts
export const studentRoutes = {
  welcome: '/welcome',
  login: '/login',
  home: '/',
  modules: '/modules',
  learnCurrent: '/learn/current',
  attemptQuestion: '/learn/:moduleId/attempt/:attemptId/question/:questionNo',
  soundInfo: '/learn/:moduleId/sounds/:soundId/info',
  moduleCompleted: '/modules/:moduleId/completed',
  stats: '/stats',
  leaderboard: '/leaderboard',
  profile: '/profile',
} as const;
```

## 4. API Mapping

| Screen | API |
|---|---|
| Welcome | `POST /auth/telegram-miniapp/login` |
| Login | `POST /auth/web-code/verify` |
| Home | `GET /student/dashboard` |
| Modules Grid/Path | `GET /student/modules` |
| Start/Continue Module | `POST /learning/modules/:moduleId/start` |
| Current Question | `GET /learning/attempts/:attemptId/current-question` |
| Submit Answer | `POST /learning/attempts/:attemptId/answers` |
| Sound Info | `GET /learning/sounds/:soundId` |
| Completion | `GET /learning/modules/:moduleId/completion-summary` |
| Stats | `GET /student/stats/summary` |
| Leaderboard | `GET /leaderboards/global?period=all_time&limit=10` |
| Profile | `GET /student/profile` |
| Language | `PATCH /student/profile/language` |

## 5. Exercise Submit Contract

Figma flow requires a submit button.

Frontend request:

```ts
type SubmitAnswerRequest = {
  exerciseId: string;
  selectedOptionId: string;
  clientAnswerId: string;
};
```

Backend response:

```ts
type SubmitAnswerResponse = {
  isCorrect: boolean;
  correctOptionId: string;
  selectedOptionId: string;
  xpDelta: number;
  heartsRemaining: number | null;
  attemptCompleted: boolean;
  moduleCompleted: boolean;
  nextQuestionNo: number | null;
};
```

Idempotency:

- `clientAnswerId` must be unique per answer submit.
- Repeated submit with same `clientAnswerId` returns the same result.
- Never grant XP twice for the same answer.

## 6. Student Dashboard Data Shape

```ts
type StudentDashboardDto = {
  profile: {
    displayName: string;
    avatarUrl: string | null;
    activeDays: number;
    language: 'uz' | 'ru' | 'en';
  };
  lastActivity: {
    moduleId: string;
    title: string;
    progressText: string;
    progressPercent: number;
    estimatedMinutes: number;
  } | null;
  dailyTask: {
    title: string;
    rewardXp: number;
    completed: boolean;
  };
  today: {
    learningMinutes: number;
    xp: number;
  };
  modulesPreview: ModuleCardDto[];
};
```

## 7. Module DTO

```ts
type ModuleCardDto = {
  id: string;
  sequenceNo: number;
  title: string;
  description: string;
  estimatedMinutes: number | null;
  status: 'completed' | 'current' | 'available' | 'locked' | 'premium_locked';
  progressPercent: number;
  premiumRequired: boolean;
};
```

## 8. Leaderboard DTO

```ts
type LeaderboardResponse = {
  period: 'daily' | 'weekly' | 'all_time';
  entries: LeaderboardEntryDto[];
  currentStudentRank: LeaderboardEntryDto | null;
  cursor: string | null;
};

type LeaderboardEntryDto = {
  rank: number;
  studentUserId: string;
  telegramFirstName: string;
  telegramUsername: string | null;
  avatarUrl: string | null;
  score: number;
  totalXp: number;
  completedModules: number;
  activeDays: number;
  isCurrentStudent?: boolean;
};
```

## 9. View Toggle Rule

Modules screen supports two views:

```txt
grid
path
```

Store preference locally:

```ts
localStorage.setItem('burro.modules.view', 'path')
```

Default:

```txt
path
```

## 10. Audio Playback Rule

Only one audio can play at a time.

Implementation:

```txt
AudioProvider
├── currentAudioId
├── play(audioId, url)
├── stop()
└── isPlaying(audioId)
```

## 11. Bottom Navigation Visibility

Show bottom nav on:

- home
- modules
- stats
- leaderboard
- profile

Hide bottom nav on:

- welcome
- login
- active exercise
- module completion if CTA bottom is present

## 12. MVP / Post-MVP Flags

```ts
export const featureFlags = {
  pronunciation: false,
  arabicUiLanguage: false,
  confetti: false,
  videoLessons: false,
};
```

## 13. QA Acceptance

- Dashboard matches Figma spacing visually on 402px width.
- Bottom nav never overlaps scroll content.
- Exercise selected state appears before submit.
- Correct answer uses green state.
- Wrong answer uses red state and shows correct answer.
- Audio button has idle and playing states.
- Module completion shows XP and accuracy.
- Leaderboard current student rank card is pinned if outside top list.
- Language bottom sheet overlays profile screen.
- All routes handle loading, empty, error, forbidden states.
