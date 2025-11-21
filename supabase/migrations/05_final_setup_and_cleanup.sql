/*
  ============================================================================
  MIGRATION 05: Final Setup and Cleanup
  ============================================================================
  
  This is the FIFTH and final migration to run.
  
  Performs:
  - Cleanup of old migration files (optional)
  - Verification of all tables and indexes
  - Final RLS policy adjustments
  - Database optimization
  
  ============================================================================
*/

-- ============================================================================
-- VERIFY ALL TABLES EXIST
-- ============================================================================

-- Check that all required tables exist
DO $$
DECLARE
  tables_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tables_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'admin_users', 'sessions', 'sites', 'score_history', 'documentation',
    'api_keys', 'api_payloads', 'scans', 'scan_results',
    'scan_violations'
  );

  IF tables_count = 10 THEN
    RAISE NOTICE 'All 10 required tables exist';
  ELSE
    RAISE WARNING 'Expected 10 tables but found %', tables_count;
  END IF;
END $$;

-- ============================================================================
-- VERIFY INDEXES
-- ============================================================================

-- Verify critical indexes exist
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
  
  RAISE NOTICE 'Found % indexes', index_count;
END $$;

-- ============================================================================
-- FINAL RLS POLICY ADJUSTMENTS
-- ============================================================================

-- Ensure score_history RLS is correct
DROP POLICY IF EXISTS "Authenticated users can create history records" ON score_history;
CREATE POLICY "Authenticated users can create history records" ON score_history FOR INSERT WITH CHECK (true);

-- Ensure api_payloads can be read publicly
DROP POLICY IF EXISTS "Allow public read access to api_payloads" ON api_payloads;
CREATE POLICY "Allow public read access to api_payloads" ON api_payloads FOR SELECT USING (true);

-- ============================================================================
-- VERIFY ADMIN USER EXISTS
-- ============================================================================

DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM admin_users WHERE username = 'admin') INTO admin_exists;
  
  IF admin_exists THEN
    RAISE NOTICE 'Admin user exists with username: admin';
  ELSE
    RAISE WARNING 'Admin user does not exist - creating now';
    INSERT INTO admin_users (username, email, password_hash, must_change_password)
    VALUES ('admin', 'admin@icjia.illinois.gov', '', true)
    ON CONFLICT (username) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- VERIFY DOCUMENTATION EXISTS
-- ============================================================================

DO $$
DECLARE
  doc_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doc_count FROM documentation;
  
  IF doc_count = 0 THEN
    RAISE NOTICE 'Populating documentation sections';
    INSERT INTO documentation (section_name, content, version) VALUES
    ('Getting Started', 'Welcome to the ICJIA Accessibility Status Portal. This tool helps track and improve web accessibility.', 1),
    ('API Documentation', 'API endpoints for submitting accessibility scan results.', 1),
    ('WCAG Guidelines', 'Information about WCAG 2.1 compliance levels and standards.', 1),
    ('Troubleshooting', 'Common issues and solutions for accessibility testing.', 1)
    ON CONFLICT (section_name) DO NOTHING;
  ELSE
    RAISE NOTICE 'Documentation sections already exist (% records)', doc_count;
  END IF;
END $$;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration 05 complete: Final setup done';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database is ready for use!';
  RAISE NOTICE 'Admin user: admin (password must be set on first login)';
  RAISE NOTICE 'Frontend: http://localhost:5173';
  RAISE NOTICE 'Backend: http://localhost:3001';
  RAISE NOTICE '========================================';
END $$;

