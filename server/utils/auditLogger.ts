/**
 * Simple, reliable audit logger
 * Logs all admin actions to audit_logs table
 */

import { supabase } from "./supabase.js";

interface AuditLogEntry {
  action: string;
  description: string;
  userId?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Log an action to the audit_logs table
 */
export async function log(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from("audit_logs").insert([
      {
        action: entry.action,
        description: entry.description,
        user_id: entry.userId || null,
        metadata: entry.metadata || {},
      },
    ]);

    if (error) {
      console.error(`[AUDIT LOG ERROR] Failed to log ${entry.action}:`, error);
    } else {
      console.log(`[AUDIT LOG] ✓ ${entry.action}: ${entry.description}`);
    }
  } catch (err) {
    console.error(`[AUDIT LOG EXCEPTION] ${entry.action}:`, err);
  }
}

// Convenience functions for common actions

export async function logScanStarted(
  scanId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await log({
    action: "scan_started",
    description: `Scan started for ${siteName}`,
    userId,
    metadata: { scan_id: scanId, site_name: siteName },
  });
}

export async function logScanCompleted(
  scanId: string,
  siteName: string,
  axeScore: number | null,
  lighthouseScore: number | null,
  userId?: string | null
): Promise<void> {
  await log({
    action: "scan_completed",
    description: `Scan completed for ${siteName} (Axe: ${axeScore}, Lighthouse: ${lighthouseScore})`,
    userId,
    metadata: {
      scan_id: scanId,
      site_name: siteName,
      axe_score: axeScore,
      lighthouse_score: lighthouseScore,
    },
  });
}

export async function logScanFailed(
  scanId: string,
  siteName: string,
  error: string,
  userId?: string | null
): Promise<void> {
  await log({
    action: "scan_failed",
    description: `Scan failed for ${siteName}: ${error}`,
    userId,
    metadata: { scan_id: scanId, site_name: siteName, error },
  });
}

export async function logSiteCreated(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await log({
    action: "site_created",
    description: `Created site: ${siteName}`,
    userId,
    metadata: { site_id: siteId, site_name: siteName },
  });
}

export async function logSiteUpdated(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await log({
    action: "site_updated",
    description: `Updated site: ${siteName}`,
    userId,
    metadata: { site_id: siteId, site_name: siteName },
  });
}

export async function logSiteDeleted(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await log({
    action: "site_deleted",
    description: `Deleted site: ${siteName}`,
    userId,
    metadata: { site_id: siteId, site_name: siteName },
  });
}

export async function logSiteDataCleared(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await log({
    action: "site_data_cleared",
    description: `Cleared data for site: ${siteName}`,
    userId,
    metadata: { site_id: siteId, site_name: siteName },
  });
}

export async function logLogin(
  userId: string,
  username: string
): Promise<void> {
  await log({
    action: "login",
    description: `User logged in: ${username}`,
    userId,
    metadata: { username },
  });
}

export async function logLogout(
  userId: string,
  username: string
): Promise<void> {
  await log({
    action: "logout",
    description: `User logged out: ${username}`,
    userId,
    metadata: { username },
  });
}

