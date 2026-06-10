# Backend Source Structure

Recommended structure:

```txt
src/
├─ main.ts
├─ app.module.ts
├─ config/
├─ common/
│  ├─ guards/
│  ├─ decorators/
│  ├─ filters/
│  └─ interceptors/
├─ db/
│  ├─ schema/
│  ├─ migrations/
│  └─ drizzle.ts
└─ modules/
   ├─ auth/
   ├─ users/
   ├─ learning/
   ├─ exercises/
   ├─ media/
   ├─ quiz/
   ├─ xp/
   ├─ achievements/
   ├─ leaderboard/
   ├─ parent/
   ├─ premium/
   ├─ moderation/
   ├─ notifications/
   ├─ telegram/
   ├─ realtime/
   ├─ audit/
   └─ analytics/
```
