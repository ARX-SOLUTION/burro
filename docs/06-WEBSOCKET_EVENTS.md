# WebSocket Events

Transport: Socket.IO.

## Rooms

```txt
student:{studentId}
parent:{parentId}
admin
leaderboard:global:{period}
leaderboard:module:{moduleId}:{period}
```

## Auth

Socket connection must be authenticated with same session/JWT context as HTTP.

## Events

### leaderboard.global.updated

Sent when global leaderboard entry changes.

Payload:

```json
{
  "period": "daily",
  "entry": {},
  "changedRank": true
}
```

### leaderboard.module.updated

```json
{
  "moduleId": "uuid",
  "period": "weekly",
  "entry": {}
}
```

### leaderboard.student_rank.updated

```json
{
  "studentId": "uuid",
  "scope": "global",
  "rank": 48,
  "score": 1840
}
```

### notification.created

```json
{
  "notificationId": "uuid",
  "receiverUserId": "uuid",
  "templateCode": "achievement_unlocked"
}
```

### notification.unread_count.updated

```json
{
  "receiverUserId": "uuid",
  "unreadCount": 3
}
```

### achievement.unlocked

```json
{
  "studentId": "uuid",
  "achievementCode": "first_module_completed",
  "xpReward": 100
}
```

### premium.request.created

Admin room event.

### premium.request.updated

Admin + student + linked parent event.

### premium.approved

Student + parent + admin event.

### premium.rejected

Student + parent + admin event.

### premium.revoked

Student + parent + admin event.

### delete_request.created

Admin + parent notification event.

### delete_request.updated

Student + parent + admin event.

### student.blocked

Student + parent + admin event.

### student.restored

Student + parent + admin event.

## Anti-pattern

Never broadcast full leaderboard on every answer. Emit changed entry and let client refetch if needed.
