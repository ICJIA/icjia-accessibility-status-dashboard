/*
  ============================================================================
  MIGRATION 10: Add Multi-Page Scanning Support
  ============================================================================
  
  This is the TENTH migration to run.
  
  Adds columns to support multi-page scanning:
  - Track total pages from sitemap
  - Track pages scanned so far
  - Track scan status (pending, in_progress, paused, completed, failed, cancelled)
  - Store worst page URL and violations
  - Track resume point for incomplete scans
  - Store page-level scan results
  
  ============================================================================
*/

-- ============================================================================
-- UPDATE SCANS TABLE FOR MULTI-PAGE SUPPORT
-- ============================================================================

ALTER TABLE scans
ADD COLUMN IF NOT EXISTS pages_total integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pages_scanned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scan_status text DEFAULT 'pending' CHECK (scan_status IN ('pending', 'in_progress', 'paused', 'completed', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS worst_page_url text,
ADD COLUMN IF NOT EXISTS worst_page_violations jsonb,
ADD COLUMN IF NOT EXISTS worst_page_violation_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_violations_sum integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scanned_page_index integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS timeout_at timestamptz,
ADD COLUMN IF NOT EXISTS paused_at timestamptz;

-- ============================================================================
-- CREATE PAGE SCAN RESULTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  page_url text NOT NULL,
  page_index integer NOT NULL,
  scan_type text NOT NULL CHECK (scan_type IN ('lighthouse', 'axe')),
  status text NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  score integer CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  violation_count integer DEFAULT 0,
  violations jsonb,
  error_message text,
  scanned_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_scan_results_scan_id ON page_scan_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_page_scan_results_page_url ON page_scan_results(page_url);
CREATE INDEX IF NOT EXISTS idx_page_scan_results_status ON page_scan_results(status);

-- ============================================================================
-- CREATE SCAN ERRORS TABLE (for logging failed pages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scan_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  page_url text NOT NULL,
  page_index integer NOT NULL,
  error_type text NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scan_errors_scan_id ON scan_errors(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_errors_page_url ON scan_errors(page_url);

-- ============================================================================
-- UPDATE STATUS CHECK CONSTRAINT
-- ============================================================================

-- Update the status check constraint to include new statuses
ALTER TABLE scans
DROP CONSTRAINT IF EXISTS scans_status_check;

ALTER TABLE scans
ADD CONSTRAINT scans_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused', 'cancelled'));

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE page_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_errors ENABLE ROW LEVEL SECURITY;

-- Page Scan Results: Public read, authenticated write
CREATE POLICY "Allow public read access to page_scan_results" ON page_scan_results FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert page_scan_results" ON page_scan_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Scan Errors: Public read, authenticated write
CREATE POLICY "Allow public read access to scan_errors" ON scan_errors FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert scan_errors" ON scan_errors FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DO $$
BEGIN
  RAISE NOTICE 'Migration 10 complete: Multi-page scanning support added';
END $$;

