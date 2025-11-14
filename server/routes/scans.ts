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

const router = Router();

// Store progress updates for each scan
const scanProgress = new Map<string, string[]>();

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
      .select("id, url")
      .eq("id", site_id)
      .single();

    if (siteError || !site) {
      return res.status(404).json({ error: "Site not found" });
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

    addProgress(scan.id, `🚀 Scan started for ${site.url}`);

    // Run scan in background
    runScanAsync(scan.id, site.id, site.url, scan_type);

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
  scanType: string
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

    // Run Lighthouse if needed
    if (scanType === "lighthouse" || scanType === "both") {
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
    }

    // Run Axe if needed
    if (scanType === "axe" || scanType === "both") {
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

    const completedAt = new Date().toISOString();

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
  } catch (error) {
    addProgress(
      scanId,
      `❌ Scan error: ${error instanceof Error ? error.message : String(error)}`
    );

    // Mark scan as failed
    await supabase
      .from("scans")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanId);
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
