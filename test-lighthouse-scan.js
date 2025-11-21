#!/usr/bin/env node

/**
 * Standalone Lighthouse Scan Test
 * Tests Lighthouse scanning on a real website and outputs the accessibility score
 */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const TEST_URL = process.argv[2] || "https://vpp.icjia.illinois.gov/";

console.log("=".repeat(80));
console.log("🧪 STANDALONE LIGHTHOUSE SCAN TEST");
console.log("=".repeat(80));
console.log(`\n📍 Testing URL: ${TEST_URL}\n`);

async function runTest() {
  let chrome = null;

  try {
    console.log("[1] Launching Chrome browser...");
    chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
    console.log(`✅ Chrome launched on port ${chrome.port}\n`);

    console.log("[2] Running Lighthouse audit...");
    const options = {
      logLevel: "error" as const,
      output: "json" as const,
      port: chrome.port,
      onlyCategories: ["accessibility", "performance", "best-practices", "seo"],
    };

    const runnerResult = await lighthouse(TEST_URL, options);

    if (!runnerResult) {
      throw new Error("Lighthouse returned no results");
    }

    console.log("✅ Lighthouse audit completed\n");

    const lhr = runnerResult.lhr;

    // Calculate accessibility score (same as lighthouseRunner.ts)
    const accessibilityScore = Math.round(
      (lhr.categories.accessibility.score || 0) * 100
    );
    const performanceScore = Math.round(
      (lhr.categories.performance.score || 0) * 100
    );
    const bestPracticesScore = Math.round(
      (lhr.categories["best-practices"].score || 0) * 100
    );
    const seoScore = Math.round((lhr.categories.seo.score || 0) * 100);

    // Count failed audits
    const failedAudits = Object.entries(lhr.audits).filter(
      ([_, audit]: [string, any]) => audit.score !== null && audit.score < 1
    );

    console.log("=".repeat(80));
    console.log("📊 RESULTS");
    console.log("=".repeat(80));
    console.log(`\n✅ Lighthouse Scores:`);
    console.log(`   - Accessibility: ${accessibilityScore}/100`);
    console.log(`   - Performance: ${performanceScore}/100`);
    console.log(`   - Best Practices: ${bestPracticesScore}/100`);
    console.log(`   - SEO: ${seoScore}/100\n`);

    console.log(`📊 Audit Summary:`);
    console.log(`   - Total Audits: ${Object.keys(lhr.audits).length}`);
    console.log(`   - Failed Audits: ${failedAudits.length}\n`);

    if (failedAudits.length > 0) {
      console.log("🔴 First 5 Failed Audits:");
      failedAudits.slice(0, 5).forEach(([id, audit]: [string, any], i: number) => {
        console.log(`   ${i + 1}. ${audit.title} (${id}): ${(audit.score * 100).toFixed(0)}%`);
      });
      if (failedAudits.length > 5) {
        console.log(`   ... and ${failedAudits.length - 5} more`);
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ TEST COMPLETED SUCCESSFULLY");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("\n❌ ERROR:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

runTest();

