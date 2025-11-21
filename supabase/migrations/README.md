# Database Migrations

Complete database setup for the ICJIA Accessibility Status Portal. Run these 6 migrations in order on a clean Supabase project.

## 🚀 Quick Start

Run these **6 migrations in order** on a brand new Supabase project:

1. **`01_create_initial_schema.sql`** - Core database structure + RLS policies + admin user
2. **`02_add_api_keys_and_payloads.sql`** - API functionality
3. **`03_add_scans_and_results.sql`** - Scanning functionality
4. **`04_add_scan_violations.sql`** - Detailed violation reporting
5. **`05_final_setup_and_cleanup.sql`** - Final verification and setup
6. **`08_create_audit_logs.sql`** - Audit logging system (replaces activity_log)

**All migrations are idempotent** - safe to run multiple times on the same database.

---

## How to Apply Migrations

### Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Copy and paste the entire contents of `01_create_initial_schema.sql`
6. Click **"Run"** (or Cmd/Ctrl + Enter)
7. Repeat steps 4-6 for migrations 02, 03, 04, 05, and 08 **in order**

### Via Script (if you have direct database access)

```bash
node scripts/apply-migration.js supabase/migrations/01_create_initial_schema.sql
node scripts/apply-migration.js supabase/migrations/02_add_api_keys_and_payloads.sql
node scripts/apply-migration.js supabase/migrations/03_add_scans_and_results.sql
node scripts/apply-migration.js supabase/migrations/04_add_scan_violations.sql
node scripts/apply-migration.js supabase/migrations/05_final_setup_and_cleanup.sql
node scripts/apply-migration.js supabase/migrations/08_create_audit_logs.sql
```

---

## Migration Details

### 01: `01_create_initial_schema.sql`

**Purpose**: Creates the complete initial database schema with RLS policies for custom cookie-based authentication.

**Tables created**:

- `admin_users` - User authentication
- `sessions` - Session management (custom cookie-based, not Supabase Auth)
- `sites` - Website tracking
- `score_history` - Accessibility score trends
- `documentation` - Help content

**What it does**:

- Creates all core database tables with indexes
- Sets up Row Level Security (RLS) policies for custom authentication:
  - `admin_users`: Allows anonymous reads (for login) and updates (for initial password setup)
  - `sessions`: Allows anonymous creates and reads (for custom cookie-based auth)
  - `sites`, `score_history`, `documentation`: Public read access
- Creates admin user (username: `admin`, password: blank - must be set on first login)
- Populates 4 documentation sections
- Database starts with no sites (add via admin interface)

**RLS Policy Details**:

- ✅ Allows anonymous users to authenticate (read admin_users)
- ✅ Allows anonymous users to set initial password (update admin_users)
- ✅ Allows anonymous users to create and read sessions (custom cookie-based auth)
- ✅ Allows public read access to sites and documentation
- ✅ Does NOT use Supabase Auth - uses custom cookie-based sessions

**Idempotent**: Yes - safe to run multiple times

---

### 02: `02_add_api_keys_and_payloads.sql`

**Purpose**: Adds API key management and payload tracking.

**Tables created**:

- `api_keys` - API key management
- `api_payloads` - API submission tracking
- `activity_log` - Audit trail (⚠️ **DEPRECATED** - replaced by `audit_logs` in migration 08)

**What it does**:

- Creates API key authentication system
- Adds API payload tracking for score submissions
- Creates activity log for audit trail (replaced in migration 08)
- Sets up RLS policies for API access

**Note**: The `activity_log` table created here is replaced by the `audit_logs` table in migration 08. Migration 08 will drop this table and create the new one.

**Idempotent**: Yes - safe to run multiple times

---

### 03: `03_add_scans_and_results.sql`

**Purpose**: Adds scanning functionality.

**Tables created**:

- `scans` - Scan jobs and results
- `scan_results` - Detailed scan results

**What it does**:

- Creates scan management tables
- Updates `score_history` with scan_id column
- Adds indexes for performance
- Sets up RLS policies for scan access

**Idempotent**: Yes - safe to run multiple times

---

### 04: `04_add_scan_violations.sql`

**Purpose**: Adds detailed violation reporting.

**Tables created**:

- `scan_violations` - Detailed violation data

**What it does**:

- Creates violation storage with filtering by WCAG level, impact, and page URL
- Adds remediation guidance fields
- Creates indexes for performance
- Sets up RLS policies for violation access

**Idempotent**: Yes - safe to run multiple times

---

### 05: `05_final_setup_and_cleanup.sql`

**Purpose**: Final verification and setup.

**What it does**:

- Verifies all 10 required tables exist (activity_log is replaced by audit_logs in migration 08)
- Verifies all indexes exist
- Final RLS policy adjustments
- Ensures admin user exists
- Ensures documentation is populated

**Idempotent**: Yes - safe to run multiple times

---

### 07: `07_update_activity_log_for_scans.sql` (DEPRECATED)

**Status**: ⚠️ **DEPRECATED** - Superseded by Migration 08

This migration is kept for reference only and should **NOT** be run. It attempted to update the old `activity_log` table, but Migration 08 replaces this entire table with a new, simplified `audit_logs` table.

**Do not run this migration** - Migration 08 handles all audit logging needs.

---

### 08: `08_create_audit_logs.sql`

**Purpose**: Replaces the old `activity_log` table with a new, simplified audit logging system.

**Tables created**:

- `audit_logs` - Simple, reliable audit logging for all admin actions

**What it does**:

- Drops the old `activity_log` table (if it exists)
- Creates new `audit_logs` table with simple schema:
  - `id` - UUID primary key
  - `action` - Action type (e.g., "scan_started", "site_created", "login")
  - `description` - Human-readable description
  - `user_id` - Admin user who performed the action
  - `metadata` - JSONB for additional context (site name, scores, etc.)
  - `created_at` - Timestamp
- Creates indexes for performance (created_at, action, user_id)
- Sets up RLS policies:
  - Authenticated users can read all logs
  - Service role can insert logs
- Grants appropriate permissions

**Logging Coverage**:

- Scans: started, completed, failed
- Sites: created, updated, deleted, data cleared
- Authentication: login, logout

**Idempotent**: Yes - safe to run multiple times

---

## Verification

After running all 6 migrations, you should have **11 tables**:

- `admin_users` - 1 row (admin user)
- `sessions` - 0 rows
- `sites` - 0 rows (add via admin interface)
- `score_history` - 0 rows (created by scans)
- `documentation` - 4 rows
- `api_keys` - 0 rows
- `api_payloads` - 0 rows
- `audit_logs` - 0 rows (populated by admin actions)
- `scans` - 0 rows
- `scan_results` - 0 rows
- `scan_violations` - 0 rows

---

## Next Steps

After migrations are complete:

1. **Start Development Server**: `yarn dev`
2. **Access Frontend**: http://localhost:5173
3. **Login**: Username: `admin`, Password: (blank - set on first login)
4. **Add Sites**: Use admin interface to add websites
5. **Run Scans**: Click "Run Scan" on site detail page
