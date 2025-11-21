/**
 * Lighthouse Runner - Executes real Lighthouse audits
 */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

export interface LighthouseResult {
  url: string; // Page URL that was scanned
  score: number;
  categories: Record<string, { score: number }>;
  audits: Record<string, any>;
}

export interface MultiPageLighthouseResult {
  totalPages: number;
  pagesScanned: number;
  averageScore: number;
  worstPageUrl: string;
  worstPageScore: number;
  results: LighthouseResult[];
  errors: Array<{
    url: string;
    error: string;
  }>;
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

    // Run Lighthouse - ONLY accessibility audit
    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      port: chrome.port,
      onlyCategories: ["accessibility"],
    };

    const runnerResult = await lighthouse(url, options);

    if (!runnerResult) {
      throw new Error("Lighthouse audit failed - no result returned");
    }

    const lhr = runnerResult.lhr;

    onProgress?.("✅ Lighthouse audit complete");
    console.log("[Lighthouse] Audit complete - processing results");

    const result = {
      url, // Include the page URL
      score: Math.round((lhr.categories.accessibility.score || 0) * 100),
      categories: {
        accessibility: {
          score: Math.round((lhr.categories.accessibility.score || 0) * 100),
        },
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

/**
 * Run Lighthouse audit on multiple pages sequentially
 */
export async function runMultiPageLighthouseAudit(
  urls: string[],
  resumeFromIndex: number = 0,
  onProgress?: (message: string) => void
): Promise<MultiPageLighthouseResult> {
  console.log(
    `[Lighthouse-MultiPage] Starting multi-page audit for ${urls.length} URLs, resuming from index ${resumeFromIndex}`
  );

  const results: LighthouseResult[] = [];
  const errors: Array<{ url: string; error: string }> = [];
  let worstPageUrl = "";
  let worstPageScore = 100;

  for (let i = resumeFromIndex; i < urls.length; i++) {
    const url = urls[i];
    const pageNumber = i + 1;

    try {
      onProgress?.(`📄 Auditing page ${pageNumber}/${urls.length}: ${url}`);
      console.log(
        `[Lighthouse-MultiPage] Auditing page ${pageNumber}/${urls.length}: ${url}`
      );

      const result = await runLighthouseAudit(url, (msg) =>
        onProgress?.(`  ${msg}`)
      );

      results.push(result);

      // Track worst page (lowest score)
      if (result.score < worstPageScore) {
        worstPageUrl = url;
        worstPageScore = result.score;
      }

      onProgress?.(
        `✅ Page ${pageNumber}/${urls.length} complete (score: ${result.score}/100)`
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(
        `[Lighthouse-MultiPage] Error auditing page ${pageNumber} (${url}): ${errorMsg}`
      );

      errors.push({
        url,
        error: errorMsg,
      });

      onProgress?.(`⚠️ Page ${pageNumber}/${urls.length} failed: ${errorMsg}`);
    }
  }

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length
        )
      : 0;

  const result: MultiPageLighthouseResult = {
    totalPages: urls.length,
    pagesScanned: results.length,
    averageScore,
    worstPageUrl,
    worstPageScore,
    results,
    errors,
  };

  console.log(
    `[Lighthouse-MultiPage] Multi-page audit complete:`,
    JSON.stringify(
      {
        totalPages: result.totalPages,
        pagesScanned: result.pagesScanned,
        averageScore: result.averageScore,
        worstPageUrl: result.worstPageUrl,
        worstPageScore: result.worstPageScore,
        errorCount: result.errors.length,
      },
      null,
      2
    )
  );

  return result;
}
