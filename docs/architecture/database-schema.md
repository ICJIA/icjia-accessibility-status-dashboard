# Database Schema

Overview of the ICJIA Accessibility Portal database schema.

## Tables

### admin_users

Stores admin user accounts.

| Column          | Type      | Description           |
| --------------- | --------- | --------------------- |
| `id`            | UUID      | Primary key           |
| `username`      | VARCHAR   | Unique username       |
| `password_hash` | VARCHAR   | Bcrypt password hash  |
| `created_at`    | TIMESTAMP | Creation timestamp    |
| `updated_at`    | TIMESTAMP | Last update timestamp |

**Constraints:**

- `username` is unique
- `password_hash` is required

### sessions

Stores active user sessions.

| Column          | Type      | Description                |
| --------------- | --------- | -------------------------- |
| `id`            | UUID      | Primary key                |
| `admin_user_id` | UUID      | Foreign key to admin_users |
| `token`         | VARCHAR   | Session token              |
| `expires_at`    | TIMESTAMP | Session expiration time    |
| `created_at`    | TIMESTAMP | Creation timestamp         |

**Constraints:**

- `admin_user_id` references `admin_users.id`
- `token` is unique
- Sessions expire after 15 days

### sites

Stores monitored websites.

| Column             | Type      | Description                     |
| ------------------ | --------- | ------------------------------- |
| `id`               | UUID      | Primary key                     |
| `name`             | VARCHAR   | Site name                       |
| `url`              | VARCHAR   | Site URL                        |
| `axe_score`        | INTEGER   | Axe accessibility score (0-100) |
| `lighthouse_score` | INTEGER   | Lighthouse score (0-100)        |
| `created_at`       | TIMESTAMP | Creation timestamp              |
| `updated_at`       | TIMESTAMP | Last update timestamp           |

**Constraints:**

- `name` is unique
- `url` is unique
- Scores are between 0-100

### score_history

Stores historical accessibility scores.

| Column             | Type      | Description                   |
| ------------------ | --------- | ----------------------------- |
| `id`               | UUID      | Primary key                   |
| `site_id`          | UUID      | Foreign key to sites          |
| `axe_score`        | INTEGER   | Axe score at this time        |
| `lighthouse_score` | INTEGER   | Lighthouse score at this time |
| `recorded_at`      | TIMESTAMP | When score was recorded       |
| `created_at`       | TIMESTAMP | Creation timestamp            |

**Constraints:**

- `site_id` references `sites.id`
- Scores are between 0-100

### api_keys

Stores API keys for programmatic access.

| Column          | Type      | Description                |
| --------------- | --------- | -------------------------- |
| `id`            | UUID      | Primary key                |
| `admin_user_id` | UUID      | Foreign key to admin_users |
| `name`          | VARCHAR   | Key name                   |
| `key_hash`      | VARCHAR   | Hashed API key             |
| `scopes`        | TEXT[]    | Array of permission scopes |
| `expires_at`    | TIMESTAMP | Optional expiration date   |
| `last_used_at`  | TIMESTAMP | Last usage timestamp       |
| `created_at`    | TIMESTAMP | Creation timestamp         |

**Constraints:**

- `admin_user_id` references `admin_users.id`
- `key_hash` is unique
- Scopes: `sites:read`, `sites:write`, `sites:delete`

### audit_logs

Stores audit trail of all admin actions and system events.

| Column        | Type         | Description                                                 |
| ------------- | ------------ | ----------------------------------------------------------- |
| `id`          | UUID         | Primary key                                                 |
| `action`      | VARCHAR(100) | Action type (e.g., "scan_started", "site_created", "login") |
| `description` | TEXT         | Human-readable description of the action                    |
| `user_id`     | UUID         | Foreign key to admin_users (nullable)                       |
| `metadata`    | JSONB        | Additional context (site name, scores, etc.)                |
| `created_at`  | TIMESTAMPTZ  | Creation timestamp                                          |

**Constraints:**

- `user_id` references `admin_users.id` ON DELETE SET NULL
- RLS enabled: Authenticated users can read, service_role can insert

### api_payloads

Stores API request payloads for audit trail.

| Column            | Type      | Description                  |
| ----------------- | --------- | ---------------------------- |
| `id`              | UUID      | Primary key                  |
| `api_key_id`      | UUID      | Foreign key to api_keys      |
| `endpoint`        | VARCHAR   | API endpoint called          |
| `method`          | VARCHAR   | HTTP method (GET, POST, etc) |
| `payload`         | JSONB     | Request payload              |
| `response_status` | INTEGER   | HTTP response status         |
| `description`     | TEXT      | User-provided description    |
| `created_at`      | TIMESTAMP | Creation timestamp           |

**Constraints:**

- `api_key_id` references `api_keys.id`

## Relationships

```
admin_users
  ├─ sessions (1:N)
  ├─ api_keys (1:N)
  └─ audit_logs (1:N)

sites
  └─ score_history (1:N)

api_keys
  └─ api_payloads (1:N)
```

## Row Level Security (RLS)

All tables have RLS policies enabled:

- **admin_users**: Only authenticated admins can read
- **sessions**: Only the session owner can read
- **sites**: Authenticated admins can read/write
- **score_history**: Authenticated admins can read/write
- **api_keys**: Only the key owner can read
- **audit_logs**: Authenticated admins can read
- **api_payloads**: Authenticated admins can read

## Indexes

Indexes are created for frequently queried columns:

- `admin_users.username` - For login queries
- `sessions.token` - For session validation
- `sites.name` - For site lookup
- `sites.url` - For duplicate detection
- `api_keys.key_hash` - For API key validation
- `audit_logs.user_id` - For audit trail
- `api_payloads.api_key_id` - For payload lookup

## Migrations

Database schema is created and updated via migration files:

1. **01_create_initial_schema.sql**

   - Creates all tables
   - Sets up RLS policies
   - Creates indexes

2. **02_add_api_keys_and_payloads.sql**

   - Adds API keys table
   - Adds API payloads support
   - Fixes RLS policies
   - Adds activity logging

3. **03_add_scans_and_results.sql** (optional)

   - Adds scan and result tables
   - Updates RLS policies

4. **04_add_scan_violations.sql** (optional)

   - Adds scan violation tracking

5. **05_final_setup_and_cleanup.sql** (optional)
   - Final setup and cleanup

## Backup Strategy

- Supabase provides automated daily backups
- Backups are retained for 7 days
- Manual backups can be created anytime
- Export data regularly for archival

## See Also

- [Setup Guide](./setup-guide) - How to set up the database
- [API Documentation](./api/overview) - API reference
- [Database Errors](./troubleshooting/database-errors) - Troubleshooting
