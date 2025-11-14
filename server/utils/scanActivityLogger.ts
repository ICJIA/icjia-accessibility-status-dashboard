/**
 * @fileoverview Scan Activity Logger
 * Logs scan-related activities to the activity_log table
 * Tracks when scans are started, completed, and failed
 */

import { supabase } from "./supabase.js";

export interface ScanActivityLogEntry {
  event_type: string;
  event_description: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string | null;
  api_key_id?: string | null;
  metadata?: Record<string, any>;
  severity?: "info" | "warning" | "error";
}

/**
 * Log a scan activity to the activity_log table
 * Uses the new schema: event_type, event_description, entity_type, entity_id, created_by_user, created_by_api_key, metadata
 */
export async function logScanActivity(
  entry: ScanActivityLogEntry
): Promise<void> {
  try {
    console.log(
      `[Activity Log] Logging ${entry.event_type}:`,
      entry.event_description
    );

    const { error } = await supabase.from("activity_log").insert([
      {
        event_type: entry.event_type,
        event_description: entry.event_description,
        entity_type: entry.entity_type || "scan",
        entity_id: entry.entity_id || null,
        created_by_user: entry.user_id || null,
        created_by_api_key: entry.api_key_id || null,
        metadata: entry.metadata || {},
        severity: entry.severity || "info",
      },
    ]);

    if (error) {
      console.error("[Activity Log] Error logging scan activity:", error);
    } else {
      console.log(`[Activity Log] Successfully logged ${entry.event_type}`);
    }
  } catch (err) {
    console.error("[Activity Log] Error in logScanActivity:", err);
  }
}

/**
 * Log scan started event
 */
export async function logScanStarted(
  scanId: string,
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await logScanActivity({
    event_type: "scan_started",
    event_description: `Scan started for site: ${siteName}`,
    entity_type: "scan",
    entity_id: scanId,
    user_id: userId,
    severity: "info",
    metadata: {
      site_id: siteId,
      site_name: siteName,
    },
  });
}

/**
 * Log scan completed event
 */
export async function logScanCompleted(
  scanId: string,
  siteId: string,
  siteName: string,
  axeScore: number | null,
  lighthouseScore: number | null,
  userId?: string | null
): Promise<void> {
  await logScanActivity({
    event_type: "scan_completed",
    event_description: `Scan completed for site: ${siteName} (Axe: ${axeScore}, Lighthouse: ${lighthouseScore})`,
    entity_type: "scan",
    entity_id: scanId,
    user_id: userId,
    severity: "info",
    metadata: {
      site_id: siteId,
      site_name: siteName,
      axe_score: axeScore,
      lighthouse_score: lighthouseScore,
    },
  });
}

/**
 * Log scan failed event
 */
export async function logScanFailed(
  scanId: string,
  siteId: string,
  siteName: string,
  errorMessage: string,
  userId?: string | null
): Promise<void> {
  await logScanActivity({
    event_type: "scan_failed",
    event_description: `Scan failed for site: ${siteName} - ${errorMessage}`,
    entity_type: "scan",
    entity_id: scanId,
    user_id: userId,
    severity: "error",
    metadata: {
      site_id: siteId,
      site_name: siteName,
      error_message: errorMessage,
    },
  });
}
