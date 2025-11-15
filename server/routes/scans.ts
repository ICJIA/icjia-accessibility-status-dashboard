/**
 * @fileoverview Scan Management Routes
 * Handles real Lighthouse and Axe accessibility scans with progress tracking.
 *
 * @module routes/scans
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { runLighthouseAudit } from "../utils/lighthouseRunner.js";
import { runAxeAudit } from "../utils/axeRunner.js";
import {
  logScanStarted,
  logScanCompleted,
  logScanFailed,
} from "../utils/auditLogger.js";

const router = Router();

// Store progress updates for each scan
const scanProgress = new Map<string, string[]>();

// Scan rate limiting: track scans per site per hour
const scanRateLimits = new Map<string, number[]>(); // site_id -> array of scan timestamps

/**
 * Get the scan rate limit based on environment
 * Production: 10 scans per hour
 * Development: 50 scans per hour
 */
function getScanRateLimit(): number {
  return process.env.NODE_ENV === "production" ? 10 : 50;
}

/**
 * Check if a site has exceeded its scan rate limit
 */
function checkScanRateLimit(siteId: string): {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
} {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const limit = getScanRateLimit();

  // Get or initialize scan timestamps for this site
  let timestamps = scanRateLimits.get(siteId) || [];

  // Remove timestamps older than 1 hour
  timestamps = timestamps.filter((ts) => ts > oneHourAgo);

  // Update the map
  scanRateLimits.set(siteId, timestamps);

  const scansInLastHour = timestamps.length;
  const allowed = scansInLastHour < limit;
  const remaining = Math.max(0, limit - scansInLastHour);

  // Calculate reset time (when the oldest scan expires)
  let resetTime = new Date(now + 60 * 60 * 1000); // Default to 1 hour from now
  if (timestamps.length > 0) {
    resetTime = new Date(timestamps[0] + 60 * 60 * 1000);
  }

  return { allowed, remaining, resetTime };
}

/**
 * Record a scan for rate limiting
 */
function recordScan(siteId: string): void {
  const timestamps = scanRateLimits.get(siteId) || [];
  timestamps.push(Date.now());
  scanRateLimits.set(siteId, timestamps);
}

/**
 * Store progress message for a scan
 */
function addProgress(scanId: string, message: string) {
  if (!scanProgress.has(scanId)) {
    scanProgress.set(scanId, []);
  }
  scanProgress.get(scanId)!.push(message);
  console.log(`[Scan ${scanId}] ${message}`);
}

/**
 * Store violations from Axe results
 */
async function storeAxeViolations(
  scanId: string,
  axeReport: any,
  siteUrl: string
) {
  if (!axeReport || !axeReport.violations_list) return;

  const violations = axeReport.violations_list.map((v: any) => ({
    scan_id: scanId,
    violation_type: "axe",
    rule_id: v.id,
    rule_name: v.id.replace(/-/g, " "),
    description: v.message,
    impact_level: v.impact || "minor",
    wcag_level: "AA",
    page_url: siteUrl,
    element_selector: "",
    element_count: v.nodes || 1,
    help_url: `https://www.deque.com/axe/devtools/`,
    suggested_fix: "Review the Axe report for detailed remediation steps",
  }));

  if (violations.length > 0) {
    const { error } = await supabase.from("scan_violations").insert(violations);

    if (error) {
      console.error("Error storing Axe violations:", error);
    } else {
      addProgress(scanId, `✅ Stored ${violations.length} Axe violations`);
    }
  }
}

/**
 * POST /api/scans
 * Trigger a new real accessibility scan
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { site_id, scan_type = "both" } = req.body;

    if (!site_id) {
      return res.status(400).json({ error: "site_id is required" });
    }

    if (!["lighthouse", "axe", "both"].includes(scan_type)) {
      return res.status(400).json({ error: "Invalid scan_type" });
    }

    // Verify site exists
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, url, title")
      .eq("id", site_id)
      .single();

    if (siteError || !site) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Check scan rate limit
    const rateLimit = checkScanRateLimit(site_id);
    if (!rateLimit.allowed) {
      const limit = getScanRateLimit();
      return res.status(429).json({
        error: `Rate limit exceeded. Maximum ${limit} scans per hour per site.`,
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
      });
    }

    // Create scan record with status='pending'
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .insert([
        {
          site_id,
          status: "pending",
          scan_type,
          admin_id: req.userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (scanError || !scan) {
      console.error("Error creating scan:", scanError);
      return res.status(500).json({ error: "Failed to create scan" });
    }

    // Record the scan for rate limiting
    recordScan(site_id);

    addProgress(scan.id, `🚀 Scan started for ${site.url}`);

    // Log scan started activity
    await logScanStarted(scan.id, site_id, site.title, req.userId);

    // Run scan in background
    runScanAsync(scan.id, site.id, site.url, scan_type, site.title, req.userId);

    return res.status(201).json({ scan });
  } catch (error) {
    console.error("Create scan error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Run scan asynchronously
 */
async function runScanAsync(
  scanId: string,
  siteId: string,
  siteUrl: string,
  scanType: string,
  siteName: string,
  userId?: string | null
) {
  try {
    // Update scan status to running
    await supabase
      .from("scans")
      .update({
        status: "running",
        started_at: new Date().toISOString(),
      })
      .eq("id", scanId);

    let lighthouseScore: number | null = null;
    let lighthouseReport: any = null;
    let axeScore: number | null = null;
    let axeReport: any = null;

    // Run scans in parallel if both are needed
    if (scanType === "both") {
      addProgress(scanId, "📊 Starting Lighthouse audit...");
      addProgress(scanId, "🔍 Starting Axe accessibility scan...");

      const [lighthouseResult, axeResult] = await Promise.allSettled([
        runLighthouseAudit(siteUrl, (msg) => addProgress(scanId, msg)),
        runAxeAudit(siteUrl, (msg) => addProgress(scanId, msg)),
      ]).then((results) => [results[0], results[1]]);

      // Handle Lighthouse result
      if (lighthouseResult.status === "fulfilled") {
        try {
          lighthouseReport = lighthouseResult.value;
          lighthouseScore = lighthouseReport.score;
          addProgress(scanId, `✅ Lighthouse score: ${lighthouseScore}/100`);
        } catch (error) {
          addProgress(
            scanId,
            `❌ Lighthouse processing failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      } else {
        addProgress(
          scanId,
          `❌ Lighthouse failed: ${
            lighthouseResult.reason instanceof Error
              ? lighthouseResult.reason.message
              : String(lighthouseResult.reason)
          }`
        );
      }

      // Handle Axe result
      if (axeResult.status === "fulfilled") {
        try {
          axeReport = axeResult.value;
          axeScore = Math.max(0, 100 - axeReport.violations * 5);
          addProgress(scanId, `✅ Axe score: ${axeScore}/100`);
        } catch (error) {
          addProgress(
            scanId,
            `❌ Axe processing failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      } else {
        addProgress(
          scanId,
          `❌ Axe failed: ${
            axeResult.reason instanceof Error
              ? axeResult.reason.message
              : String(axeResult.reason)
          }`
        );
      }
    } else {
      // Run single scan type
      if (scanType === "lighthouse") {
        try {
          addProgress(scanId, "📊 Starting Lighthouse audit...");
          lighthouseReport = await runLighthouseAudit(siteUrl, (msg) =>
            addProgress(scanId, msg)
          );
          lighthouseScore = lighthouseReport.score;
          addProgress(scanId, `✅ Lighthouse score: ${lighthouseScore}/100`);
        } catch (error) {
          addProgress(
            scanId,
            `❌ Lighthouse failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      } else if (scanType === "axe") {
        try {
          addProgress(scanId, "🔍 Starting Axe accessibility scan...");
          axeReport = await runAxeAudit(siteUrl, (msg) =>
            addProgress(scanId, msg)
          );
          axeScore = Math.max(0, 100 - axeReport.violations * 5);
          addProgress(scanId, `✅ Axe score: ${axeScore}/100`);
        } catch (error) {
          addProgress(
            scanId,
            `❌ Axe failed: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    }

    const completedAt = new Date().toISOString();

    // Log final scan results
    console.log(`[Scan ${scanId}] Final Results:`, {
      url: siteUrl,
      lighthouseScore,
      axeScore,
      lighthouseReportSize: lighthouseReport
        ? JSON.stringify(lighthouseReport).length
        : 0,
      axeReportSize: axeReport ? JSON.stringify(axeReport).length : 0,
    });

    // Update scan with results
    const { error: updateError } = await supabase
      .from("scans")
      .update({
        status: "completed",
        lighthouse_score: lighthouseScore,
        axe_score: axeScore,
        lighthouse_report: lighthouseReport,
        axe_report: axeReport,
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq("id", scanId);

    if (updateError) {
      addProgress(scanId, `❌ Error updating scan: ${updateError.message}`);
      return;
    }

    // Create score history record
    const { error: historyError } = await supabase
      .from("score_history")
      .insert({
        site_id: siteId,
        scan_id: scanId,
        axe_score: axeScore,
        lighthouse_score: lighthouseScore,
        recorded_at: completedAt,
      });

    if (historyError) {
      addProgress(scanId, `❌ Error creating history: ${historyError.message}`);
      return;
    }

    // Update site with new scores
    const updateData: any = {
      updated_at: completedAt,
    };

    if (lighthouseScore !== null) {
      updateData.lighthouse_score = lighthouseScore;
      updateData.lighthouse_last_updated = completedAt;
    }

    if (axeScore !== null) {
      updateData.axe_score = axeScore;
      updateData.axe_last_updated = completedAt;
    }

    const { error: siteUpdateError } = await supabase
      .from("sites")
      .update(updateData)
      .eq("id", siteId);

    if (siteUpdateError) {
      addProgress(scanId, `❌ Error updating site: ${siteUpdateError.message}`);
      return;
    }

    // Store violations
    if (axeReport) {
      await storeAxeViolations(scanId, axeReport, siteUrl);
    }

    addProgress(scanId, "✨ Scan complete!");

    // Log scan completed activity
    await logScanCompleted(
      scanId,
      siteId,
      siteName,
      axeScore,
      lighthouseScore,
      userId
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addProgress(scanId, `❌ Scan error: ${errorMessage}`);

    // Mark scan as failed
    await supabase
      .from("scans")
      .update({
        status: "failed",
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanId);

    // Log scan failed activity
    await logScanFailed(scanId, siteId, siteName, errorMessage, userId);
  }
}

/**
 * GET /api/scans/:scanId/progress
 * Fetch progress updates for a scan
 */
router.get("/:scanId/progress", async (req: AuthRequest, res) => {
  try {
    const { scanId } = req.params;
    const progress = scanProgress.get(scanId) || [];
    return res.json({ progress });
  } catch (error) {
    console.error("Fetch progress error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/scans/:scanId/violations
 * Fetch all violations for a specific scan
 */
router.get("/:scanId/violations", async (req: AuthRequest, res) => {
  try {
    const { scanId } = req.params;

    const { data: violations, error } = await supabase
      .from("scan_violations")
      .select("*")
      .eq("scan_id", scanId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching violations:", error);
      return res.status(500).json({ error: "Failed to fetch violations" });
    }

    return res.json({ violations: violations || [] });
  } catch (error) {
    console.error("Fetch violations error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
