/*
  ============================================================================
  MIGRATION 07: DEPRECATED - Superseded by Migration 08
  ============================================================================

  This migration has been superseded by Migration 08 (08_create_audit_logs.sql).

  Migration 08 replaces the old activity_log table with a new, simplified
  audit_logs table with a cleaner schema.

  This file is kept for reference only and should not be run.

  ============================================================================
*/

-- This migration is deprecated and should not be executed.
-- Migration 08 (08_create_audit_logs.sql) handles all audit logging needs.

DO $$
BEGIN
  RAISE NOTICE 'Migration 07 is deprecated - use Migration 08 instead';
END $$;

