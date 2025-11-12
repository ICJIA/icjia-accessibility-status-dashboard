-- ============================================================================
-- MIGRATION: Add Scans Table for Accessibility Scanning Feature
-- ============================================================================
-- This migration adds support for automated Lighthouse and Axe scans.
-- Scans are triggered by authenticated users and results are stored with
-- detailed reports for analysis.
--
-- Tables created:
-- - scans: Stores scan jobs and results
-- - scan_results: Stores detailed scan results (violations, warnings)
--
-- ============================================================================

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  lighthouse_score integer CHECK (lighthouse_score IS NULL OR (lighthouse_score >= 0 AND lighthouse_score <= 100)),
  axe_score integer CHECK (axe_score IS NULL OR (axe_score >= 0 AND axe_score <= 100)),
  lighthouse_report jsonb,
  axe_report jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create scan_results table for detailed results
CREATE TABLE IF NOT EXISTS scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE NOT NULL,
  result_type text NOT NULL CHECK (result_type IN ('lighthouse', 'axe')),
  score integer CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  violations jsonb,
  warnings jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_site_id ON scans(site_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_results_scan_id ON scan_results(scan_id);

-- Enable RLS on scans table
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to view scans
CREATE POLICY "Allow authenticated users to view scans"
  ON scans FOR SELECT
  USING (auth.role() = 'authenticated_user');

-- RLS Policy: Allow authenticated users to view scan results
CREATE POLICY "Allow authenticated users to view scan results"
  ON scan_results FOR SELECT
  USING (auth.role() = 'authenticated_user');

-- RLS Policy: Allow authenticated users to insert scans
CREATE POLICY "Allow authenticated users to insert scans"
  ON scans FOR INSERT
  WITH CHECK (auth.role() = 'authenticated_user');

-- RLS Policy: Allow authenticated users to insert scan results
CREATE POLICY "Allow authenticated users to insert scan results"
  ON scan_results FOR INSERT
  WITH CHECK (auth.role() = 'authenticated_user');

-- RLS Policy: Allow authenticated users to update scans
CREATE POLICY "Allow authenticated users to update scans"
  ON scans FOR UPDATE
  USING (auth.role() = 'authenticated_user')
  WITH CHECK (auth.role() = 'authenticated_user');

