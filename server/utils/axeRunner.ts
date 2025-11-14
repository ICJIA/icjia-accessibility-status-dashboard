/**
 * Axe Runner - Executes real Axe accessibility checks
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

export interface AxeResult {
  violations: number;
  passes: number;
  incomplete: number;
  inapplicable: number;
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  violations_list: Array<{
    id: string;
    impact: string;
    message: string;
    nodes: number;
  }>;
}

export async function runAxeAudit(
  url: string,
  onProgress?: (message: string) => void
): Promise<AxeResult> {
  console.log(`[Axe] Starting Axe audit for URL: ${url}`);
  let browser;
  let page;

  try {
    console.log("[Axe] Launching Chromium browser...");
    browser = await chromium.launch();
    console.log("[Axe] Browser launched successfully");

    page = await browser.newPage();
    console.log("[Axe] Page created successfully");

    onProgress?.("🌐 Loading page...");
    console.log(`[Axe] Loading page: ${url}`);
    await page.goto(url, { waitUntil: "networkidle" });
    console.log("[Axe] Page loaded successfully");

    onProgress?.("🔍 Injecting Axe...");
    console.log("[Axe] Injecting Axe Core library");

    // Inject Axe Core - use import.meta.url for ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const axeCorePath = path.join(
      __dirname,
      "../node_modules/axe-core/axe.min.js"
    );

    if (!fs.existsSync(axeCorePath)) {
      throw new Error(`Axe Core not found at ${axeCorePath}`);
    }

    const axeCoreContent = fs.readFileSync(axeCorePath, "utf-8");
    console.log(
      `[Axe] Loaded Axe Core from ${axeCorePath} (${axeCoreContent.length} bytes)`
    );

    await page.addInitScript(axeCoreContent);

    onProgress?.("🔎 Running Axe scan...");
    console.log("[Axe] Starting Axe scan");

    // Run Axe
    console.log("[Axe] Evaluating Axe on page...");
    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        console.log("[Axe-Browser] Checking if axe is available...");
        if (!(window as any).axe) {
          reject(new Error("Axe not available on window"));
          return;
        }
        console.log("[Axe-Browser] Axe found, running scan...");
        (window as any).axe.run((error: any, results: any) => {
          if (error) {
            console.error("[Axe-Browser] Axe error:", error);
            reject(error);
          } else {
            console.log("[Axe-Browser] Axe scan completed successfully");
            resolve(results);
          }
        });
      });
    });

    const axeResults = results as any;

    onProgress?.("✅ Axe scan complete");
    console.log("[Axe] Scan complete - processing results");
    console.log("[Axe] Results summary:", {
      violations: axeResults.violations?.length || 0,
      passes: axeResults.passes?.length || 0,
      incomplete: axeResults.incomplete?.length || 0,
    });

    // Calculate score (100 - violations)
    const violationCount = axeResults.violations.length;
    const score = Math.max(0, 100 - violationCount * 5); // 5 points per violation

    // Count impact levels
    const summary = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    };

    axeResults.violations.forEach((violation: any) => {
      const impact = violation.impact || "minor";
      if (impact in summary) {
        summary[impact as keyof typeof summary] += violation.nodes.length;
      }
    });

    const result = {
      violations: violationCount,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
      inapplicable: axeResults.inapplicable.length,
      summary,
      violations_list: axeResults.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        message: v.help,
        nodes: v.nodes.length,
      })),
    };

    console.log(
      "[Axe] Final result:",
      JSON.stringify({ url, ...result }, null, 2)
    );
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("[Axe] Error:", errorMsg);
    console.error("[Axe] Error stack:", errorStack);
    console.error("[Axe] Full error object:", error);
    onProgress?.(`❌ Axe error: ${errorMsg}`);
    throw error;
  } finally {
    try {
      if (browser) {
        console.log("[Axe] Closing browser...");
        await browser.close();
        console.log("[Axe] Browser closed successfully");
      }
    } catch (closeError) {
      console.error("[Axe] Error closing browser:", closeError);
    }
  }
}
