# Activity Log Fix - Instructions

## Summary of Changes

Two issues have been fixed:

### 1. ✅ Removed Full Page Refreshes (COMPLETE)
- **Commit**: `cbaea11`
- SitesManagement component now updates site scores in React state instead of calling `loadSites()`
- Scan counts update dynamically without page reloads
- Smooth, modern SPA experience

### 2. 🔄 Activity Log RLS Policy Update (REQUIRES MANUAL MIGRATION)
- **Commit**: `8746e06`
- Updated RLS policy in migration 07 to allow activity log inserts
- Added debug logging to track logging calls

## What You Need to Do

### Step 1: Run Migration 07 in Supabase

The RLS policy for the `activity_log` table needs to be updated. Run this migration in your Supabase project:

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Open `supabase/migrations/07_update_activity_log_for_scans.sql`
6. Copy the entire contents
7. Paste into the SQL Editor
8. Click **"Run"** (or Cmd/Ctrl + Enter)

**Option B: Via Script (if you have database password)**

```bash
node scripts/apply-migration.js supabase/migrations/07_update_activity_log_for_scans.sql
```

### Step 2: Verify the Fix

After running the migration:

1. Restart your backend: `yarn dev:backend`
2. Run a scan from the admin dashboard
3. Check the "Recent Activity" section
4. You should see:
   - "Scan started for site: [site name]"
   - "Scan completed for site: [site name] (Axe: X, Lighthouse: Y)"

## Debug Logging

The backend now logs activity log operations:

```
[Activity Log] Logging scan_started: Scan started for site: Example Site
[Activity Log] Successfully logged scan_started
[Activity Log API] Fetched 5 total entries, 5 with valid event_type
```

Check backend logs with: `yarn logs`

## What Was Fixed

### Backend Changes
- Added debug logging to `scanActivityLogger.ts`
- Added debug logging to `activityLog.ts` API endpoint
- Updated RLS policy in migration 07

### Frontend Changes
- Removed `loadSites()` call after scan completion
- Now updates site scores directly in React state
- Scan count increments dynamically
- No full page refresh

## Testing Checklist

- [ ] Run migration 07 in Supabase
- [ ] Restart backend
- [ ] Run a scan from admin dashboard
- [ ] Verify spinner shows "Starting scan..." → "Running scan..." → "Scan completed!"
- [ ] Verify scores update without page refresh
- [ ] Verify activity log shows scan events
- [ ] Check backend logs for debug messages

