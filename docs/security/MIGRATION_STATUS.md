# 🔄 Database Migration Status

**Date**: November 11, 2024
**Status**: ⚠️ **REQUIRES MANUAL APPLICATION**

---

## Migration Overview

The new `step_5_api_key_rotation.sql` migration adds support for API key rotation with grace periods and automatic deactivation.

---

## Migration Details

**File**: `supabase/migrations/step_5_api_key_rotation.sql`
**Size**: 3,045 bytes
**Created**: November 11, 2024

### Changes Included

1. **New Columns on `api_keys` Table**:

   - `rotation_scheduled_at` (TIMESTAMP) - For future scheduled rotations
   - `rotated_from_key_id` (UUID) - References previous key for lineage tracking
   - `grace_period_expires_at` (TIMESTAMP) - When old key will be deactivated

2. **Database Indexes**:

   - Index on `grace_period_expires_at` for efficient querying of expired keys
   - Index on `rotation_scheduled_at` for future scheduled rotations

3. **PostgreSQL Function**:

   - `deactivate_expired_grace_period_keys()` - Automatically deactivates old keys after grace period

4. **Database Trigger**:
   - `log_key_deactivation()` - Logs key deactivations to `audit_logs` table

---

## ⚠️ **IMPORTANT: Migration Status**

### Current Status: **NOT YET APPLIED**

The migration file has been created but **has NOT been automatically applied** to your Supabase database. You need to manually apply it.

### Why Manual Application is Required

Supabase migrations are not automatically applied when files are added to the repository. You must:

1. **Option A: Apply via Supabase Dashboard** (Recommended for development)

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/step_5_api_key_rotation.sql`
   - Execute the SQL

2. **Option B: Apply via Supabase CLI** (Recommended for production)

   ```bash
   supabase migration up
   ```

3. **Option C: Apply via Direct Database Connection**
   - Connect to your Supabase PostgreSQL database
   - Execute the SQL from `supabase/migrations/step_5_api_key_rotation.sql`

---

## How to Apply the Migration

### Step 1: Verify Migration File Exists

```bash
ls -la supabase/migrations/step_5_api_key_rotation.sql
```

### Step 2: Apply Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Apply pending migrations
supabase migration up
```

### Step 3: Verify Migration Applied

After applying, verify the changes in your database:

```sql
-- Check if new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'api_keys'
AND column_name IN ('rotation_scheduled_at', 'rotated_from_key_id', 'grace_period_expires_at');

-- Check if function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'deactivate_expired_grace_period_keys';

-- Check if trigger exists
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'log_key_deactivation';
```

---

## What Happens After Migration

Once the migration is applied:

1. ✅ API key rotation endpoint becomes fully functional
2. ✅ Automatic deactivation job can run
3. ✅ Grace period functionality works
4. ✅ Key lineage tracking is available
5. ✅ All rotation events are logged to `audit_logs`

---

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Drop trigger
DROP TRIGGER IF EXISTS log_key_deactivation ON api_keys;

-- Drop function
DROP FUNCTION IF EXISTS deactivate_expired_grace_period_keys();

-- Drop indexes
DROP INDEX IF EXISTS idx_api_keys_grace_period_expires_at;
DROP INDEX IF EXISTS idx_api_keys_rotation_scheduled_at;

-- Drop columns
ALTER TABLE api_keys
DROP COLUMN IF EXISTS rotation_scheduled_at,
DROP COLUMN IF EXISTS rotated_from_key_id,
DROP COLUMN IF EXISTS grace_period_expires_at;
```

---

## Next Steps

1. **Apply the migration** using one of the methods above
2. **Verify** the migration was applied successfully
3. **Test** the API key rotation endpoint: `POST /api/api-keys/:id/rotate`
4. **Monitor** the automatic deactivation job in logs

---

## Support

If you encounter issues applying the migration:

1. Check the Supabase dashboard for error messages
2. Verify your database connection
3. Ensure you have proper permissions
4. Review the migration SQL for any syntax errors
5. Check the `docs/security/RLS_SECURITY_AUDIT.md` for additional context

---

**Last Updated**: November 11, 2024
