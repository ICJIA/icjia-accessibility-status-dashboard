/**
 * @fileoverview Unified Activity Logger
 * Centralized logging utility for ALL admin actions and system events.
 * Handles scans, sites, users, authentication, and other admin activities.
 * Automatically sanitizes sensitive data before logging.
 *
 * @module utils/activityLogger
 */

import { supabase } from "./supabase.js";
import { Request } from "express";
import { sanitizeObject } from "./sanitizer.js";

/**
 * Core activity log entry interface
 */
export interface ActivityLogEntry {
  event_type: string;
  event_description: string;
  severity: "info" | "warning" | "error";
  entity_type?: string;
  entity_id?: string;
  created_by_user?: string | null;
  created_by_api_key?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Log an activity to the activity_log table
 * This is the core logging function used by all other logging functions
 */
export async function logActivity(entry: ActivityLogEntry): Promise<void> {
  try {
    // Sanitize metadata to remove sensitive data
    const sanitizedMetadata = sanitizeObject(entry.metadata || {});

    const { error } = await supabase.from("activity_log").insert([
      {
        event_type: entry.event_type,
        event_description: entry.event_description,
        severity: entry.severity || "info",
        entity_type: entry.entity_type || null,
        entity_id: entry.entity_id || null,
        created_by_user: entry.created_by_user || null,
        created_by_api_key: entry.created_by_api_key || null,
        metadata: sanitizedMetadata,
      },
    ]);

    if (error) {
      console.error(`[Activity Log] Error logging ${entry.event_type}:`, error);
    } else {
      console.log(
        `[Activity Log] ✓ ${entry.event_type}: ${entry.event_description}`
      );
    }
  } catch (err) {
    console.error(`[Activity Log] Exception in logActivity:`, err);
  }
}

// ============================================================================
// SCAN LOGGING FUNCTIONS
// ============================================================================

/**
 * Log scan started event
 */
export async function logScanStarted(
  scanId: string,
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await logActivity({
    event_type: "scan_started",
    event_description: `Scan started for site: ${siteName}`,
    entity_type: "scan",
    entity_id: scanId,
    created_by_user: userId,
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
  await logActivity({
    event_type: "scan_completed",
    event_description: `Scan completed for site: ${siteName} (Axe: ${axeScore}, Lighthouse: ${lighthouseScore})`,
    entity_type: "scan",
    entity_id: scanId,
    created_by_user: userId,
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
  await logActivity({
    event_type: "scan_failed",
    event_description: `Scan failed for site: ${siteName} - ${errorMessage}`,
    entity_type: "scan",
    entity_id: scanId,
    created_by_user: userId,
    severity: "error",
    metadata: {
      site_id: siteId,
      site_name: siteName,
      error_message: errorMessage,
    },
  });
}

// ============================================================================
// SITE MANAGEMENT LOGGING FUNCTIONS
// ============================================================================

/**
 * Log site created event
 */
export async function logSiteCreated(
  siteId: string,
  siteName: string,
  siteUrl: string,
  userId?: string | null
): Promise<void> {
  await logActivity({
    event_type: "site_created",
    event_description: `Created new site: ${siteName}`,
    entity_type: "site",
    entity_id: siteId,
    created_by_user: userId,
    severity: "info",
    metadata: {
      site_name: siteName,
      site_url: siteUrl,
    },
  });
}

/**
 * Log site updated event
 */
export async function logSiteUpdated(
  siteId: string,
  siteName: string,
  changes: string[],
  userId?: string | null
): Promise<void> {
  await logActivity({
    event_type: "site_updated",
    event_description: `Updated site: ${siteName}${
      changes.length > 0 ? ` (${changes.join(", ")})` : ""
    }`,
    entity_type: "site",
    entity_id: siteId,
    created_by_user: userId,
    severity: "info",
    metadata: {
      site_name: siteName,
      changes: changes,
    },
  });
}

/**
 * Log site deleted event
 */
export async function logSiteDeleted(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await logActivity({
    event_type: "site_deleted",
    event_description: `Deleted site: ${siteName}`,
    entity_type: "site",
    entity_id: siteId,
    created_by_user: userId,
    severity: "warning",
    metadata: {
      site_name: siteName,
    },
  });
}

/**
 * Log site data cleared event
 */
export async function logSiteDataCleared(
  siteId: string,
  siteName: string,
  userId?: string | null
): Promise<void> {
  await logActivity({
    event_type: "site_data_cleared",
    event_description: `All data cleared for site: ${siteName}`,
    entity_type: "site",
    entity_id: siteId,
    created_by_user: userId,
    severity: "warning",
    metadata: {
      site_name: siteName,
    },
  });
}

// ============================================================================
// USER MANAGEMENT LOGGING FUNCTIONS
// ============================================================================

/**
 * Log user created event
 */
export async function logUserCreated(
  userId: string,
  username: string,
  email: string,
  createdByUserId?: string | null
): Promise<void> {
  await logActivity({
    event_type: "user_created",
    event_description: `Created new admin user: ${username}`,
    entity_type: "user",
    entity_id: userId,
    created_by_user: createdByUserId,
    severity: "info",
    metadata: {
      username,
      email,
    },
  });
}

/**
 * Log user deleted event
 */
export async function logUserDeleted(
  userId: string,
  username: string,
  deletedByUserId?: string | null
): Promise<void> {
  await logActivity({
    event_type: "user_deleted",
    event_description: `Deleted admin user: ${username}`,
    entity_type: "user",
    entity_id: userId,
    created_by_user: deletedByUserId,
    severity: "warning",
    metadata: {
      username,
    },
  });
}

/**
 * Log password reset event
 */
export async function logPasswordReset(
  userId: string,
  username: string,
  resetByUserId?: string | null
): Promise<void> {
  await logActivity({
    event_type: "password_reset",
    event_description: `Password reset for user: ${username}`,
    entity_type: "user",
    entity_id: userId,
    created_by_user: resetByUserId,
    severity: "info",
    metadata: {
      username,
    },
  });
}

// ============================================================================
// AUTHENTICATION LOGGING FUNCTIONS
// ============================================================================

/**
 * Log successful login
 */
export async function logSuccessfulLogin(
  userId: string,
  username: string
): Promise<void> {
  await logActivity({
    event_type: "login",
    event_description: `User logged in: ${username}`,
    entity_type: "user",
    entity_id: userId,
    created_by_user: userId,
    severity: "info",
    metadata: {
      username,
    },
  });
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(
  username: string,
  reason: string
): Promise<void> {
  await logActivity({
    event_type: "failed_login",
    event_description: `Failed login attempt for user: ${username} (${reason})`,
    severity: "warning",
    metadata: {
      username,
      reason,
    },
  });
}

/**
 * Log user logout
 */
export async function logLogout(
  userId: string,
  username: string
): Promise<void> {
  await logActivity({
    event_type: "logout",
    event_description: `User logged out: ${username}`,
    entity_type: "user",
    entity_id: userId,
    created_by_user: userId,
    severity: "info",
    metadata: {
      username,
    },
  });
}
