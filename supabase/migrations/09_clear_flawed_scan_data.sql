-- Migration 09: Clear Flawed Scan Data
-- Purpose: Remove all scan results, violations, and audit logs while keeping sites intact
-- Reason: Axe score calculation bug was fixed - need fresh data for accurate testing
-- Date: 2025-11-15

-- Clear scan violations (dependent on scans)
DELETE FROM scan_violations;

-- Clear score history (dependent on scans)
DELETE FROM score_history;

-- Clear scans
DELETE FROM scans;

-- Clear audit logs (starting fresh with correct metrics)
DELETE FROM audit_logs;

-- Reset sites to have no scores (they will be populated by new scans)
UPDATE sites
SET
  axe_score = NULL,
  lighthouse_score = NULL,
  axe_last_updated = NULL,
  lighthouse_last_updated = NULL,
  updated_at = NOW()
WHERE axe_score IS NOT NULL OR lighthouse_score IS NOT NULL;

-- Verify sites still exist
SELECT COUNT(*) as site_count FROM sites;

-- Log the cleanup (this is the only audit log entry - marking the fresh start)
INSERT INTO audit_logs (action, description, metadata)
VALUES (
  'data_cleanup',
  'Cleared all flawed scan data and audit logs to start fresh with fixed score calculation',
  jsonb_build_object(
    'reason', 'Axe score calculation bug fixed - fresh start with correct metrics',
    'timestamp', NOW()
  )
);

