-- Migration: Create audit_logs table
-- Description: Simple, clean audit logging for all admin actions
-- Date: 2025-01-15

-- Drop old activity_log table if it exists
DROP TABLE IF EXISTS activity_log CASCADE;

-- Create new audit_logs table with simple schema
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all logs
CREATE POLICY "Allow authenticated users to read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role to insert logs
CREATE POLICY "Allow service role to insert audit logs"
  ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON audit_logs TO authenticated;
GRANT ALL ON audit_logs TO service_role;

-- Add comment
COMMENT ON TABLE audit_logs IS 'Audit log for all admin actions and system events';

