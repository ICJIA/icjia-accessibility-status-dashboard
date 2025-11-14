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

    // Launch Chrome
    chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

    onProgress?.("📊 Running Lighthouse audit...");

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

    return {
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
  } catch (error) {
    onProgress?.(`❌ Lighthouse error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

