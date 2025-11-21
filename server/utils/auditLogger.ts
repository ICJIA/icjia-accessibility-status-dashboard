/**
 * Simple, reliable audit logger
 * Logs all admin actions to audit_logs table
 */

import { supabase } from "./supabase.js";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
};

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
      console.error(
        `${colors.red}[AUDIT LOG ERROR]${colors.reset} Failed to log ${entry.action}:`,
        error
      );
    } else {
      console.log(
        `${colors.cyan}${colors.bright}[AUDIT LOG]${colors.reset} ${colors.green}✓${colors.reset} ${colors.cyan}${entry.action}${colors.reset}: ${entry.description}`
      );
    }
  } catch (err) {
    console.error(
      `${colors.red}[AUDIT LOG EXCEPTION]${colors.reset} ${entry.action}:`,
      err
    );
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
  userId?: string | null,
  additionalData?: Record<string, any>
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
      ...additionalData,
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

export async function logScanCancelled(
  scanId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await log({
    action: "scan_cancelled",
    description: `Scan manually stopped by user for ${siteName}`,
    userId,
    metadata: { scan_id: scanId, site_name: siteName },
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

export async function logLighthouseReport(
  scanId: string,
  siteName: string,
  lighthouseReport: Record<string, any>,
  userId?: string | null
): Promise<void> {
  await log({
    action: "lighthouse_report",
    description: `Lighthouse report for ${siteName}`,
    userId,
    metadata: {
      scan_id: scanId,
      site_name: siteName,
      report: lighthouseReport,
    },
  });
}

export async function logAxeReport(
  scanId: string,
  siteName: string,
  axeReport: Record<string, any>,
  userId?: string | null
): Promise<void> {
  await log({
    action: "axe_report",
    description: `Axe report for ${siteName}`,
    userId,
    metadata: {
      scan_id: scanId,
      site_name: siteName,
      report: axeReport,
    },
  });
}
