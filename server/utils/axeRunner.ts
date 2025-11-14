/**
 * Axe Runner - Executes real Axe accessibility checks
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

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
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    onProgress?.("🌐 Loading page...");
    await page.goto(url, { waitUntil: "networkidle" });

    onProgress?.("🔍 Injecting Axe...");

    // Inject Axe Core
    const axeCorePath = require.resolve("axe-core");
    const axeCoreContent = fs.readFileSync(axeCorePath, "utf-8");

    await page.addInitScript(axeCoreContent);

    onProgress?.("🔎 Running Axe scan...");

    // Run Axe
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        (window as any).axe.run((error: any, results: any) => {
          if (error) throw error;
          resolve(results);
        });
      });
    });

    const axeResults = results as any;

    onProgress?.("✅ Axe scan complete");

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

    return {
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
  } catch (error) {
    onProgress?.(`❌ Axe error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    await browser.close();
  }
}

