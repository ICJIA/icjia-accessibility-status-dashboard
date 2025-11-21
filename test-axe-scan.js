#!/usr/bin/env node

/**
 * Standalone Axe Scan Test
 * Tests Axe scanning on a real website and outputs the score
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_URL = process.argv[2] || "https://vpp.icjia.illinois.gov/";

console.log("=".repeat(80));
console.log("🧪 STANDALONE AXE SCAN TEST");
console.log("=".repeat(80));
console.log(`\n📍 Testing URL: ${TEST_URL}\n`);

async function runTest() {
  let browser;
  let page;

  try {
    console.log("[1] Launching Chromium browser...");
    browser = await chromium.launch();
    console.log("✅ Browser launched\n");

    console.log("[2] Creating new page...");
    page = await browser.newPage();
    console.log("✅ Page created\n");

    console.log("[3] Loading page...");
    await page.goto(TEST_URL, { waitUntil: "networkidle" });
    console.log("✅ Page loaded\n");

    console.log("[4] Injecting Axe Core...");
    const axeCorePath = path.join(__dirname, "node_modules/axe-core/axe.min.js");
    if (!fs.existsSync(axeCorePath)) {
      throw new Error(`Axe Core not found at ${axeCorePath}`);
    }
    const axeCoreContent = fs.readFileSync(axeCorePath, "utf-8");
    await page.addScriptTag({ content: axeCoreContent });
    console.log(`✅ Axe Core injected (${axeCoreContent.length} bytes)\n`);

    console.log("[5] Running Axe scan...");
    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        if (!(window as any).axe) {
          reject(new Error("Axe not available"));
          return;
        }
        (window as any).axe.run((error: any, results: any) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
    });
    console.log("✅ Axe scan completed\n");

    const axeResults = results as any;
    const violationCount = axeResults.violations?.length || 0;
    const passCount = axeResults.passes?.length || 0;
    const incompleteCount = axeResults.incomplete?.length || 0;

    // Calculate score using same formula as axeRunner.ts
    const score = Math.max(0, 100 - violationCount * 5);

    console.log("=".repeat(80));
    console.log("📊 RESULTS");
    console.log("=".repeat(80));
    console.log(`\n✅ Axe Score: ${score}/100`);
    console.log(`   - Violations: ${violationCount}`);
    console.log(`   - Passes: ${passCount}`);
    console.log(`   - Incomplete: ${incompleteCount}`);
    console.log(`   - Inapplicable: ${axeResults.inapplicable?.length || 0}\n`);

    if (violationCount > 0) {
      console.log("🔴 Violations Found:");
      axeResults.violations.slice(0, 5).forEach((v: any, i: number) => {
        console.log(`   ${i + 1}. ${v.id} (${v.impact}) - ${v.help}`);
      });
      if (violationCount > 5) {
        console.log(`   ... and ${violationCount - 5} more`);
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ TEST COMPLETED SUCCESSFULLY");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("\n❌ ERROR:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runTest();

