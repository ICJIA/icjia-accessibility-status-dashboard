/**
 * @fileoverview Scan Management Routes
 * Handles real Lighthouse and Axe accessibility scans with progress tracking.
 *
 * @module routes/scans
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import {
  runLighthouseAudit,
  runMultiPageLighthouseAudit,
} from "../utils/lighthouseRunner.js";
import { runAxeAudit, runMultiPageAxeAudit } from "../utils/axeRunner.js";
import {
  logScanStarted,
  logScanCompleted,
  logScanFailed,
  logLighthouseReport,
  logAxeReport,
} from "../utils/auditLogger.js";
import { parseSitemap } from "../utils/sitemapParser.js";
import { createTimeoutManager } from "../utils/timeoutManager.js";
import {
  saveProgress,
  loadProgress,
  clearProgress,
} from "../utils/progressManager.js";
import { logger } from "../utils/logger.js";

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
  logger.scan(scanId, message);
}

/**
 * Store violations from Axe results
 */
async function storeAxeViolations(
  scanId: string,
  axeReport: any,
  siteUrl: string
) {
  if (!axeReport || !axeReport.results) return;

  const violations: any[] = [];

  // Process violations from each page scan
  axeReport.results.forEach((pageResult: any) => {
    const pageUrl = pageResult.url || siteUrl;

    if (pageResult.violations_list && pageResult.violations_list.length > 0) {
      pageResult.violations_list.forEach((v: any) => {
        violations.push({
          scan_id: scanId,
          violation_type: "axe",
          rule_id: v.id,
          rule_name: v.id.replace(/-/g, " "),
          description: v.message,
          impact_level: v.impact || "minor",
          wcag_level: "AA",
          page_url: pageUrl, // Use the actual page URL from the scan result
          element_selector: "",
          element_count: v.nodes || 1,
          help_url: `https://www.deque.com/axe/devtools/`,
          suggested_fix: "Review the Axe report for detailed remediation steps",
        });
      });
    }
  });

  if (violations.length > 0) {
    logger.info(
      "ScanRunner",
      `Storing ${violations.length} Axe violations with page URLs`
    );
    const { error } = await supabase.from("scan_violations").insert(violations);

    if (error) {
      logger.error("ScanRunner", "Error storing Axe violations", error);
    } else {
      logger.success(
        "ScanRunner",
        `Stored ${violations.length} Axe violations`
      );
      addProgress(scanId, `✅ Stored ${violations.length} Axe violations`);
    }
  }
}

/**
 * GET /api/scans
 * List scans with optional status filter
 */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;

    logger.info("ScanAPI", `GET /api/scans - status: ${status || "all"}`);

    let query = supabase
      .from("scans")
      .select(
        `
        id,
        site_id,
        status,
        scan_type,
        pages_scanned,
        pages_total,
        total_violations_sum,
        worst_page_url,
        worst_page_violations,
        created_at,
        updated_at,
        sites(title)
      `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: scans, error } = await query;

    if (error) {
      logger.error("ScanAPI", "Failed to fetch scans", error);
      return res.status(500).json({ error: "Failed to fetch scans" });
    }

    // Map site data
    const mappedScans = (scans || []).map((scan: any) => ({
      ...scan,
      site_name: scan.sites?.title || "Unknown Site",
    }));

    logger.success("ScanAPI", `Fetched ${mappedScans.length} scans`);
    return res.json({ scans: mappedScans });
  } catch (error) {
    logger.error("ScanAPI", "Error fetching scans", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/scans
 * Trigger a new real accessibility scan
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { site_id, scan_type = "both" } = req.body;

    logger.info(
      "ScanAPI",
      `POST /api/scans - site_id: ${site_id}, scan_type: ${scan_type}`
    );

    if (!site_id) {
      logger.warn("ScanAPI", "Missing site_id in request");
      return res.status(400).json({ error: "site_id is required" });
    }

    if (!["lighthouse", "axe", "both"].includes(scan_type)) {
      logger.warn("ScanAPI", `Invalid scan_type: ${scan_type}`);
      return res.status(400).json({ error: "Invalid scan_type" });
    }

    // Verify site exists and get sitemap_url
    logger.debug("ScanAPI", `Fetching site: ${site_id}`);
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, url, title, sitemap_url")
      .eq("id", site_id)
      .single();

    if (siteError || !site) {
      logger.error("ScanAPI", `Site not found: ${site_id}`, siteError);
      return res.status(404).json({ error: "Site not found" });
    }

    logger.success("ScanAPI", `Found site: ${site.title} (${site.url})`);

    if (!site.sitemap_url) {
      logger.warn(
        "ScanAPI",
        `Site ${site.title} has no sitemap URL configured`
      );
      return res
        .status(400)
        .json({ error: "Site does not have a sitemap URL configured" });
    }

    // Check scan rate limit
    const rateLimit = checkScanRateLimit(site_id);
    if (!rateLimit.allowed) {
      const limit = getScanRateLimit();
      logger.warn(
        "ScanAPI",
        `Rate limit exceeded for site ${site.title}. Remaining: ${rateLimit.remaining}`
      );
      return res.status(429).json({
        error: `Rate limit exceeded. Maximum ${limit} scans per hour per site.`,
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
      });
    }

    logger.debug(
      "ScanAPI",
      `Rate limit OK. Remaining scans: ${rateLimit.remaining}`
    );

    // Create scan record with status='pending'
    logger.info("ScanAPI", `Creating scan record for ${site.title}`);
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
      logger.error("ScanAPI", "Failed to create scan record", scanError);
      return res.status(500).json({ error: "Failed to create scan" });
    }

    logger.success("ScanAPI", `Scan record created: ${scan.id}`);

    // Record the scan for rate limiting
    // For "both" scans, count as 2 scans (one for Lighthouse, one for Axe)
    recordScan(site_id);
    if (scan_type === "both") {
      recordScan(site_id);
    }

    addProgress(scan.id, `🚀 Scan started for ${site.url}`);

    // Log scan started activity
    await logScanStarted(scan.id, site.title, req.userId);

    logger.info("ScanAPI", `Scheduling background scan for ${scan.id}`);

    // Run multi-page scan in background (Phase 1: in-app scanning for all sites)
    // Use setImmediate to ensure it runs after response is sent
    setImmediate(() => {
      logger.info("ScanAPI", `Background scan starting for ${scan.id}`);
      runMultiPageScanAsync(
        scan.id,
        site.id,
        site.url,
        site.sitemap_url,
        scan_type,
        site.title,
        req.userId,
        0, // resumeFromIndex
        false // restartScan
      ).catch((error) => {
        logger.error("ScanAPI", `Background scan error for ${scan.id}`, error);
        addProgress(scan.id, `❌ Background scan error: ${error.message}`);
      });
    });

    logger.success("ScanAPI", `Scan ${scan.id} queued successfully`);
    return res.status(201).json({ scan });
  } catch (error) {
    logger.error("ScanAPI", "Create scan error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Run multi-page scan asynchronously
 */
async function runMultiPageScanAsync(
  scanId: string,
  siteId: string,
  siteUrl: string,
  sitemapUrl: string,
  scanType: string,
  siteName: string,
  userId?: string | null,
  resumeFromIndex: number = 0,
  restartScan: boolean = false
) {
  try {
    logger.section(`SCAN STARTED: ${siteName}`);
    logger.info("ScanRunner", `Scan ID: ${scanId}`);
    logger.info("ScanRunner", `Site: ${siteName} (${siteUrl})`);
    logger.info("ScanRunner", `Scan Type: ${scanType}`);

    // Clear progress if restarting
    if (restartScan) {
      logger.info("ScanRunner", "Restarting scan from beginning...");
      await clearProgress(scanId);
      resumeFromIndex = 0;
      addProgress(scanId, "🔄 Restarting scan from beginning...");
    } else if (resumeFromIndex > 0) {
      logger.info("ScanRunner", `Resuming from page ${resumeFromIndex + 1}...`);
      addProgress(
        scanId,
        `▶️ Resuming scan from page ${resumeFromIndex + 1}...`
      );
    }

    // Update scan status to running
    logger.info("ScanRunner", "Updating scan status to in_progress...");
    await supabase
      .from("scans")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", scanId);
    logger.success("ScanRunner", "Scan status updated to in_progress");

    // Parse sitemap to get all URLs
    logger.info("ScanRunner", `Parsing sitemap: ${sitemapUrl}`);
    addProgress(scanId, "📋 Parsing sitemap...");
    const sitemapResult = await parseSitemap(sitemapUrl);

    if (sitemapResult.error || sitemapResult.urls.length === 0) {
      const errorMsg = sitemapResult.error || "No URLs found";
      logger.error("ScanRunner", `Failed to parse sitemap: ${errorMsg}`);
      throw new Error(`Failed to parse sitemap: ${errorMsg}`);
    }

    const urls = sitemapResult.urls;
    logger.success("ScanRunner", `Found ${urls.length} pages in sitemap`);
    addProgress(scanId, `✅ Found ${urls.length} pages in sitemap`);

    // Create timeout manager (2 hours for Phase 1)
    logger.info("ScanRunner", "Creating timeout manager (2 hours)");
    const timeout = createTimeoutManager(2);

    let lighthouseResult: any = null;
    let axeResult: any = null;

    // Run multi-page scans based on scan type
    if (scanType === "lighthouse" || scanType === "both") {
      try {
        logger.section("LIGHTHOUSE AUDIT");
        logger.info(
          "ScanRunner",
          `Starting Lighthouse audit for ${urls.length} pages`
        );
        addProgress(scanId, "📊 Starting Lighthouse multi-page audit...");
        lighthouseResult = await runMultiPageLighthouseAudit(
          urls,
          resumeFromIndex,
          (msg) => {
            addProgress(scanId, msg);
            // Check timeout every 10 seconds
            if (timeout.checkTimeout()) {
              throw new Error("Scan timeout exceeded (2 hours)");
            }
          }
        );
        logger.success(
          "ScanRunner",
          `Lighthouse audit complete: ${lighthouseResult.averageScore}/100 average`
        );

        // Log failed audits with page URLs
        if (lighthouseResult.results && lighthouseResult.results.length > 0) {
          lighthouseResult.results.forEach((pageResult: any, idx: number) => {
            const pageUrl = pageResult.url || urls[idx];
            const failedAudits = Object.entries(pageResult.audits || {})
              .filter(
                ([_, audit]: [string, any]) =>
                  audit.score !== null && audit.score < 1
              )
              .map(([id, audit]: [string, any]) => ({
                id,
                title: audit.title,
                score: audit.score,
              }));

            if (failedAudits.length > 0) {
              logger.info(
                "ScanRunner",
                `Page ${idx + 1}: ${pageUrl} - Score: ${
                  pageResult.score
                }/100, ${failedAudits.length} failed audits`
              );
              failedAudits.forEach((audit: any) => {
                logger.warn(
                  "ScanRunner",
                  `  [${audit.id}] ${audit.title} (score: ${audit.score}) - ${pageUrl}`
                );
              });
            }
          });
        }

        addProgress(
          scanId,
          `✅ Lighthouse audit complete: ${lighthouseResult.averageScore}/100 average`
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error(
          "ScanRunner",
          `Lighthouse audit failed: ${errorMsg}`,
          error
        );
        addProgress(scanId, `❌ Lighthouse failed: ${errorMsg}`);
        if (errorMsg.includes("timeout")) {
          addProgress(
            scanId,
            `⏸️ Scan paused at page ${
              lighthouseResult?.pagesScanned || resumeFromIndex
            }. You can resume later.`
          );
        }
      }
    }

    if (scanType === "axe" || scanType === "both") {
      try {
        logger.section("AXE AUDIT");
        logger.info(
          "ScanRunner",
          `Starting Axe audit for ${urls.length} pages`
        );
        addProgress(scanId, "🔍 Starting Axe multi-page accessibility scan...");
        axeResult = await runMultiPageAxeAudit(urls, resumeFromIndex, (msg) => {
          addProgress(scanId, msg);
          // Check timeout every 10 seconds
          if (timeout.checkTimeout()) {
            throw new Error("Scan timeout exceeded (2 hours)");
          }
        });
        logger.success(
          "ScanRunner",
          `Axe audit complete: ${axeResult.averageScore}/100 average, ${axeResult.totalViolations} violations`
        );

        // Log violations with page URLs
        if (axeResult.results && axeResult.results.length > 0) {
          axeResult.results.forEach((pageResult: any, idx: number) => {
            if (
              pageResult.violations_list &&
              pageResult.violations_list.length > 0
            ) {
              const pageUrl = pageResult.url || urls[idx];
              logger.info(
                "ScanRunner",
                `Page ${idx + 1}: ${pageUrl} - ${
                  pageResult.violations_list.length
                } violations`
              );
              pageResult.violations_list.forEach((v: any) => {
                logger.warn(
                  "ScanRunner",
                  `  [${v.impact}] ${v.id}: ${v.message} (${v.nodes} nodes) - ${pageUrl}`
                );
              });
            }
          });
        }

        addProgress(
          scanId,
          `✅ Axe audit complete: ${axeResult.averageScore}/100 average, ${axeResult.totalViolations} total violations`
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error("ScanRunner", `Axe audit failed: ${errorMsg}`, error);
        addProgress(scanId, `❌ Axe failed: ${errorMsg}`);
        if (errorMsg.includes("timeout")) {
          addProgress(
            scanId,
            `⏸️ Scan paused at page ${
              axeResult?.pagesScanned || resumeFromIndex
            }. You can resume later.`
          );
        }
      }
    }

    // Save final results
    logger.section("SAVING RESULTS");
    const completedAt = new Date().toISOString();

    const updateData: any = {
      status: "completed",
      completed_at: completedAt,
      updated_at: completedAt,
      pages_total: urls.length,
    };

    if (lighthouseResult) {
      updateData.lighthouse_score = lighthouseResult.averageScore;
      updateData.lighthouse_report = lighthouseResult;
      logger.info(
        "ScanRunner",
        `Lighthouse score: ${lighthouseResult.averageScore}/100`
      );
    }

    if (axeResult) {
      updateData.axe_score = axeResult.averageScore;
      updateData.axe_report = axeResult;
      updateData.total_violations_sum = axeResult.totalViolations;
      updateData.worst_page_url = axeResult.worstPageUrl;
      updateData.worst_page_violation_count = axeResult.worstPageViolationCount;
      updateData.worst_page_violations = axeResult.worstPageViolations;
      logger.info(
        "ScanRunner",
        `Axe score: ${axeResult.averageScore}/100, Violations: ${axeResult.totalViolations}`
      );
    }

    logger.info("ScanRunner", "Updating scan record in database...");
    const { error: updateError } = await supabase
      .from("scans")
      .update(updateData)
      .eq("id", scanId);

    if (updateError) {
      logger.error("ScanRunner", "Error updating scan record", updateError);
      addProgress(scanId, `❌ Error updating scan: ${updateError.message}`);
      return;
    }

    logger.success("ScanRunner", "Scan record updated");

    // Update site with new scores
    logger.info("ScanRunner", "Updating site record with new scores...");
    const siteUpdateData: any = {
      updated_at: completedAt,
    };

    if (lighthouseResult) {
      siteUpdateData.lighthouse_score = lighthouseResult.averageScore;
      siteUpdateData.lighthouse_last_updated = completedAt;
    }

    if (axeResult) {
      siteUpdateData.axe_score = axeResult.averageScore;
      siteUpdateData.axe_last_updated = completedAt;
    }

    const { error: siteUpdateError } = await supabase
      .from("sites")
      .update(siteUpdateData)
      .eq("id", siteId);

    if (siteUpdateError) {
      logger.error("ScanRunner", "Error updating site record", siteUpdateError);
      addProgress(scanId, `❌ Error updating site: ${siteUpdateError.message}`);
      return;
    }

    logger.success("ScanRunner", "Site record updated");
    addProgress(scanId, "✨ Multi-page scan complete!");

    // Log detailed reports
    if (lighthouseResult) {
      await logLighthouseReport(
        scanId,
        siteName,
        {
          score: lighthouseResult.averageScore,
          pages_scanned: lighthouseResult.pagesScanned || urls.length,
          report: lighthouseResult,
        },
        userId
      );
    }

    if (axeResult) {
      await logAxeReport(
        scanId,
        siteName,
        {
          score: axeResult.averageScore,
          total_violations: axeResult.totalViolations,
          pages_scanned: axeResult.pagesScanned || urls.length,
          worst_page_url: axeResult.worstPageUrl,
          worst_page_violations: axeResult.worstPageViolationCount,
          report: axeResult,
        },
        userId
      );
    }

    // Log scan completed activity with additional data
    await logScanCompleted(
      scanId,
      siteName,
      axeResult?.averageScore || null,
      lighthouseResult?.averageScore || null,
      userId,
      {
        pages_scanned: urls.length,
        total_violations: axeResult?.totalViolations || 0,
        worst_page_url: axeResult?.worstPageUrl,
        worst_page_violations: axeResult?.worstPageViolationCount,
        duration_seconds: Math.round(
          (new Date().getTime() - new Date(completedAt).getTime()) / 1000
        ),
      }
    );

    logger.section(`SCAN COMPLETED: ${siteName}`);
    logger.success("ScanRunner", `Scan ${scanId} completed successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("ScanRunner", `Scan error: ${errorMessage}`, error);
    addProgress(scanId, `❌ Scan error: ${errorMessage}`);

    // Mark scan as failed
    logger.info("ScanRunner", "Marking scan as failed...");
    await supabase
      .from("scans")
      .update({
        status: "failed",
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanId);

    // Log scan failed activity
    await logScanFailed(scanId, siteName, errorMessage, userId);
  }
}

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
          axeScore = axeReport.score; // Use the score calculated by axeRunner
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
          axeScore = axeReport.score; // Use the score calculated by axeRunner
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

    // Log detailed reports
    if (lighthouseReport) {
      await logLighthouseReport(
        scanId,
        siteName,
        {
          score: lighthouseScore,
          pages_scanned: 1,
          report: lighthouseReport,
        },
        userId
      );
    }

    if (axeReport) {
      await logAxeReport(
        scanId,
        siteName,
        {
          score: axeScore,
          total_violations: axeReport.violations?.length || 0,
          pages_scanned: 1,
          report: axeReport,
        },
        userId
      );
    }

    // Log scan completed activity with additional data
    await logScanCompleted(
      scanId,
      siteName,
      axeScore,
      lighthouseScore,
      userId,
      {
        pages_scanned: 1,
        total_violations: axeReport?.violations?.length || 0,
        duration_seconds: Math.round(
          (new Date().getTime() - new Date(completedAt).getTime()) / 1000
        ),
      }
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
    await logScanFailed(scanId, siteName, errorMessage, userId);
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

/**
 * POST /api/scans/:id/cancel
 * Cancel a running scan and clean up partial results
 */
router.post("/:id/cancel", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    logger.info("ScanAPI", `POST /api/scans/:id/cancel - scan_id: ${id}`);

    // Get the scan
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("id, status, site_id, sites(title)")
      .eq("id", id)
      .single();

    if (scanError || !scan) {
      logger.error("ScanAPI", `Scan not found: ${id}`, scanError);
      return res.status(404).json({ error: "Scan not found" });
    }

    // Only allow cancelling scans that are pending or in_progress
    if (!["pending", "in_progress", "running"].includes(scan.status)) {
      logger.warn(
        "ScanAPI",
        `Cannot cancel scan ${id} with status ${scan.status}`
      );
      return res.status(400).json({
        error: `Cannot cancel scan with status '${scan.status}'`,
      });
    }

    // Update scan status to cancelled
    const { error: updateError } = await supabase
      .from("scans")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      logger.error("ScanAPI", "Failed to update scan status", updateError);
      return res.status(500).json({ error: "Failed to cancel scan" });
    }

    // Delete partial scan results
    const { error: resultsError } = await supabase
      .from("scan_results")
      .delete()
      .eq("scan_id", id);

    if (resultsError) {
      logger.warn("ScanAPI", "Failed to delete scan results", resultsError);
      // Don't fail the request, just log the warning
    }

    // Delete partial scan violations
    const { error: violationsError } = await supabase
      .from("scan_violations")
      .delete()
      .eq("scan_id", id);

    if (violationsError) {
      logger.warn(
        "ScanAPI",
        "Failed to delete scan violations",
        violationsError
      );
      // Don't fail the request, just log the warning
    }

    // Log the cancellation
    const { logScanCancelled } = await import("../utils/auditLogger.js");
    await logScanCancelled(id, scan.sites?.title || "Unknown Site", req.userId);

    logger.success("ScanAPI", `Scan ${id} cancelled successfully`);
    return res.json({
      message: "Scan cancelled successfully",
      scan_id: id,
      status: "cancelled",
    });
  } catch (error) {
    logger.error("ScanAPI", "Error cancelling scan", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
