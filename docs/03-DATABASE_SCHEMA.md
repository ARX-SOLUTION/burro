# Database Schema

## Enums

```ts
role = 'student' | 'parent' | 'admin'
user_status = 'active' | 'blocked' | 'deleted'
content_status = 'draft' | 'published' | 'archived'
language = 'uz' | 'ru' | 'en'
exercise_type = 'find_letter' | 'find_sound' | 'listen_find_letter' | 'listen_find_sound'
media_type = 'audio' | 'image'
premium_request_status = 'pending' | 'approved' | 'rejected'
premium_grant_status = 'active' | 'expired' | 'revoked'
delete_request_status = 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled'
notification_channel = 'in_app' | 'telegram' | 'websocket'
notification_status = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
leaderboard_period = 'daily' | 'weekly' | 'all_time'
```

## Tables

### users

Primary identity table. Stores Telegram identity and common status.

Fields:

- id uuid pk
- telegram_user_id bigint unique
- telegram_first_name text
- telegram_last_name text
- telegram_username text
- telegram_avatar_url text
- role enum
- status enum default active
- preferred_language enum default uz
- created_at
- updated_at
- deleted_at nullable

Indexes:

- unique telegram_user_id
- role,status

### student_profiles

- id uuid pk
- user_id uuid unique fk users
- full_name text
- display_name text
- age int 4..14
- current_module_id uuid nullable
- created_at
- updated_at

Premium status is derived from active premium grants, not only boolean.

### parent_profiles

- id uuid pk
- user_id uuid unique fk users
- full_name text nullable
- created_at
- updated_at

### admin_profiles

- id uuid pk
- user_id uuid unique fk users
- full_name text nullable

### parent_student_links

- id uuid pk
- parent_user_id uuid fk users
- student_user_id uuid fk users
- status active/removed
- created_at
- removed_at nullable
- removed_by nullable

Rule: max 2 active parents per student. Only admin can remove.

### parent_invites

- id uuid pk
- student_user_id uuid fk users
- invite_code unique
- status pending/approved/rejected/cancelled
- expires_at
- accepted_by_parent_user_id nullable
- accepted_at nullable

### modules

- id uuid pk
- sequence_no int unique
- slug text unique
- status draft/published/archived
- premium_required boolean
- pass_score int default 80
- hearts_count int default 5
- estimated_minutes int nullable
- shuffle_exercises boolean
- shuffle_quiz_questions boolean
- quiz_source random/manual
- quiz_question_count int default 10
- correct_answer_xp int default 10
- practice_completion_xp int default 50
- final_quiz_pass_xp int default 100
- module_completion_xp int default 150
- created_at
- updated_at
- archived_at nullable

### module_translations

- id uuid pk
- module_id fk modules
- language enum
- title text
- description text nullable
- explanation text nullable

Unique: module_id + language.

### module_feedback

Per-module answer feedback copy.

- id uuid pk
- module_id fk modules
- language enum default uz
- correct_title text
- correct_message text
- incorrect_title text
- incorrect_message text

Unique: module_id + language.

### media_assets

- id uuid pk
- type audio/image
- status draft/published/archived
- file_name
- file_path
- public_url nullable
- mime_type
- size_bytes
- created_at
- updated_at
- archived_at nullable

### media_usage

Tracks where media is referenced.

- id uuid pk
- media_id fk media_assets
- entity_type text
- entity_id uuid
- created_at

### exercises

- id uuid pk
- type enum
- status draft/published/archived
- media_id nullable fk media_assets
- tags text[]
- created_at
- updated_at
- archived_at nullable

### exercise_translations

- id uuid pk
- exercise_id fk exercises
- language enum
- question text
- explanation nullable

Unique: exercise_id + language.

### exercise_options

- id uuid pk
- exercise_id fk exercises
- option_text text
- is_correct boolean
- sort_order int

Rule: exactly 4 options, exactly 1 correct.

### module_exercises

Attach reusable exercises to modules.

- id uuid pk
- module_id fk modules
- exercise_id fk exercises
- sort_order int
- is_practice boolean default true

Unique: module_id + exercise_id.

### module_quiz_questions

Used when quiz_source = manual.

- id uuid pk
- module_id fk modules
- exercise_id fk exercises
- sort_order int

### attempts

- id uuid pk
- student_user_id fk users
- module_id fk modules
- attempt_type practice/final_quiz
- status in_progress/completed/failed/passed
- score int nullable
- hearts_start int nullable
- hearts_remaining int nullable
- correct_count int default 0
- xp_earned int default 0
- started_at
- completed_at nullable

### attempt_exercises

Frozen exercise order for an attempt. Required because practice and quiz attempts may shuffle or sample questions, and a student must resume the same attempt order after a process restart.

- id uuid pk
- attempt_id fk attempts
- exercise_id fk exercises
- sort_order int

Unique:

- attempt_id + exercise_id
- attempt_id + sort_order

### attempt_answers

- id uuid pk
- attempt_id fk attempts
- exercise_id fk exercises
- client_answer_id text
- selected_option_id fk exercise_options
- correct_option_id fk exercise_options
- is_correct boolean
- xp_delta int default 0
- answered_at

Unique:

- attempt_id + exercise_id
- attempt_id + client_answer_id

### student_module_progress

- id uuid pk
- student_user_id fk users
- module_id fk modules
- status not_started/in_progress/completed/locked
- completed_exercises int
- total_exercises int
- progress_percent int
- final_quiz_best_score int nullable
- final_quiz_passed boolean
- started_at nullable
- completed_at nullable

Unique: student_user_id + module_id.

### xp_transactions

Immutable ledger.

- id uuid pk
- student_user_id fk users
- source_type text
- source_id uuid not null
- xp_delta int
- reason text
- created_at

Unique anti-duplication: student_user_id + source_type + source_id. source_id must be NOT NULL: Postgres treats NULLs as distinct in unique indexes, so nullable source_id would allow duplicate grants.

### student_xp_totals

- student_user_id pk fk users
- total_xp int
- updated_at

**Note:** Student level is derived from `total_xp` using `xpForLevel(n) = 50 × n × (n − 1)`. No `student_levels` table exists. Computation is in `@burro/shared/contracts/levels`.

### student_active_days

- id uuid pk
- student_user_id fk users
- activity_date date
- answers_count int
- is_active_day boolean
- created_at
- updated_at

Unique: student_user_id + activity_date.

### achievements

- id uuid pk
- code unique
- status published/archived
- xp_reward int

### achievement_translations

- achievement_id
- language
- title
- description

### student_achievements

- student_user_id
- achievement_id
- xp_transaction_id nullable
- unlocked_at

Unique: student_user_id + achievement_id.

### leaderboard_entries

- id uuid pk
- scope_type global/module
- scope_id nullable
- period daily/weekly/all_time
- student_user_id fk users
- score int
- total_xp int
- completed_modules int
- active_days int
- rank int
- calculated_at

Indexes: scope_type + scope_id + period + rank.

### premium_requests

- id uuid pk
- student_user_id fk users
- status pending/approved/rejected
- source module_completed/bot/manual
- reject_reason nullable
- last_admin_decision_by nullable
- created_at
- updated_at
- decided_at nullable

### premium_grants

- id uuid pk
- student_user_id fk users
- granted_by fk users
- status active/expired/revoked
- start_at
- end_at nullable
- grant_reason nullable
- revoke_reason nullable required on revoke
- revoked_by nullable
- revoked_at nullable

### premium_grace_modules

Allows current premium module finish after revoke.

- student_user_id
- module_id
- premium_grant_id
- active boolean
- created_at
- completed_at nullable

### delete_requests

- id uuid pk
- student_user_id fk users
- status pending/under_review/approved/rejected/cancelled
- reason nullable
- review_started_at nullable
- reviewed_by nullable
- internal_reject_reason nullable
- created_at
- updated_at
- decided_at nullable

### notification_templates

- id uuid pk
- code unique
- status published/archived

### notification_template_translations

- template_id
- language
- title
- body

### notifications

- id uuid pk
- receiver_user_id fk users
- template_code text
- channel in_app/telegram/websocket
- status pending/processing/sent/failed/cancelled
- payload jsonb
- read_at nullable
- created_at
- sent_at nullable
- failed_at nullable

### notification_delivery_attempts

- notification_id
- attempt_no int
- status
- error_message nullable
- created_at

### bot_chat_bindings

- user_id fk users unique
- telegram_user_id bigint
- chat_id bigint
- created_at
- updated_at

### web_login_codes

- telegram_user_id bigint
- code_hash text
- used_at nullable
- expires_at
- attempts int
- created_at

### audit_logs

Immutable.

- id uuid pk
- actor_user_id nullable fk users
- action text
- entity_type text
- entity_id uuid nullable
- old_value jsonb nullable
- new_value jsonb nullable
- reason text nullable
- ip_address text nullable
- user_agent text nullable
- created_at

## DB rules

- Never hard delete learning data.
- Soft delete users by `status=deleted`.
- Archive content using `status=archived`.
- Audit logs are immutable.
- Add indexes before launch.
- Backup before production migration.
