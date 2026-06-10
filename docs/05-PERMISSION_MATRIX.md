# Permission Matrix

| Capability | Student | Parent | Admin |
|---|---:|---:|---:|
| Login | yes | yes | yes |
| View own dashboard | yes | no | admin view |
| View child dashboard | no | linked only | yes |
| View learning path | own | linked child readonly | yes |
| Start module | own if allowed | no | no |
| Submit exercise answer | own | no | no |
| View leaderboard | yes | yes | yes |
| Highlight self/child | self | selected child | no |
| Request premium | yes | no | yes grant |
| Approve premium | no | no | yes |
| Reject premium | no | no | yes |
| Revoke premium | no | no | yes |
| Submit delete request | yes | no | no |
| Cancel delete request | pending only | no | no |
| Approve delete request | no | no | yes |
| Restore deleted student | no | no | yes |
| Invite parent | yes | no | yes/manual |
| Accept parent invite | no | yes | no |
| Unlink parent-child | no | no | yes |
| Manage modules | no | no | yes |
| Manage exercises | no | no | yes |
| Manage media | no | no | yes |
| View audit logs | no | no | yes |
| Block student | no | no | yes |

## Core rules

- Parent is read-only.
- Admin controls content, premium, moderation and parent links.
- Student can affect only own learning and own requests.
- Full name is admin/parent/report field, not public leaderboard field.
- Public leaderboard is authenticated-only and shows Telegram first name, username, avatar.
