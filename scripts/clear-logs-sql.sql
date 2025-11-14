-- Clear all activity logs
-- Run this in Supabase SQL Editor to clear all activity log entries

-- Delete all entries
DELETE FROM activity_log;

-- Verify deletion
SELECT COUNT(*) as remaining_logs FROM activity_log;

-- Show the schema to verify structure
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'activity_log'
ORDER BY ordinal_position;

