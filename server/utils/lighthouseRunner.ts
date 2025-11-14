/**
 * Lighthouse Runner - Executes real Lighthouse audits
 */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

export interface LighthouseResult {
  score: number;
  categories: Record<string, { score: number }>;
  audits: Record<string, any>;
}

export async function runLighthouseAudit(
  url: string,
  onProgress?: (message: string) => void
): Promise<LighthouseResult> {
  let chrome: any = null;

  try {
    onProgress?.("🚀 Launching Chrome...");
    console.log(`[Lighthouse] Launching Chrome for URL: ${url}`);

    // Launch Chrome
    chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

    onProgress?.("📊 Running Lighthouse audit...");
    console.log("[Lighthouse] Starting Lighthouse audit");

    // Run Lighthouse
    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      port: chrome.port,
      onlyCategories: ["accessibility", "performance", "best-practices", "seo"],
    };

    const runnerResult = await lighthouse(url, options);

    if (!runnerResult) {
      throw new Error("Lighthouse audit failed - no result returned");
    }

    const lhr = runnerResult.lhr;

    onProgress?.("✅ Lighthouse audit complete");
    console.log("[Lighthouse] Audit complete - processing results");

    const result = {
      score: Math.round((lhr.categories.accessibility.score || 0) * 100),
      categories: {
        accessibility: {
          score: Math.round((lhr.categories.accessibility.score || 0) * 100),
        },
        performance: {
          score: Math.round((lhr.categories.performance.score || 0) * 100),
        },
        "best-practices": {
          score: Math.round(
            (lhr.categories["best-practices"].score || 0) * 100
          ),
        },
        seo: { score: Math.round((lhr.categories.seo.score || 0) * 100) },
      },
      audits: lhr.audits,
    };

    // Count failed audits
    const failedAudits = Object.entries(lhr.audits)
      .filter(
        ([_, audit]: [string, any]) => audit.score !== null && audit.score < 1
      )
      .map(([id, audit]: [string, any]) => ({
        id,
        title: audit.title,
        score: audit.score,
      }));

    console.log(
      "[Lighthouse] Final result:",
      JSON.stringify(
        {
          url,
          score: result.score,
          categories: result.categories,
          auditCount: Object.keys(result.audits).length,
          failedAuditCount: failedAudits.length,
          failedAudits: failedAudits.slice(0, 10), // Log first 10 failed audits
        },
        null,
        2
      )
    );

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[Lighthouse] Error:", errorMsg);
    onProgress?.(`❌ Lighthouse error: ${errorMsg}`);
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}
