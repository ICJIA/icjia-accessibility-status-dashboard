#!/usr/bin/env node

/**
 * Test script to debug Axe scan execution
 * Run with: node scripts/test-axe.js <url>
 * Example: node scripts/test-axe.js https://dvfr.illinois.gov/
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testUrl = process.argv[2] || "https://example.com";

console.log("=".repeat(80));
console.log("🧪 AXE SCAN TEST SCRIPT");
console.log("=".repeat(80));
console.log(`URL: ${testUrl}`);
console.log(`Time: ${new Date().toISOString()}`);
console.log("=".repeat(80));

async function testAxeScan() {
  let browser;
  let page;

  try {
    console.log("\n[STEP 1] Launching Chromium browser...");
    browser = await chromium.launch();
    console.log("✅ Browser launched successfully");

    console.log("\n[STEP 2] Creating new page...");
    page = await browser.newPage();
    console.log("✅ Page created successfully");

    console.log(`\n[STEP 3] Navigating to ${testUrl}...`);
    await page.goto(testUrl, { waitUntil: "networkidle" });
    console.log("✅ Page loaded successfully");

    console.log("\n[STEP 4] Locating axe-core library...");
    const axeCorePath = path.join(
      __dirname,
      "../node_modules/axe-core/axe.min.js"
    );
    console.log(`Path: ${axeCorePath}`);

    if (!fs.existsSync(axeCorePath)) {
      throw new Error(`❌ Axe Core not found at ${axeCorePath}`);
    }
    console.log("✅ Axe Core file found");

    console.log("\n[STEP 5] Reading axe-core file...");
    const axeCoreContent = fs.readFileSync(axeCorePath, "utf-8");
    console.log(`✅ Axe Core loaded (${axeCoreContent.length} bytes)`);

    console.log("\n[STEP 6] Injecting axe-core into page...");
    await page.addInitScript(axeCoreContent);
    console.log("✅ Axe Core injected successfully");

    console.log("\n[STEP 7] Checking if axe is available on window...");
    const axeAvailable = await page.evaluate(() => {
      return typeof (window as any).axe !== "undefined";
    });
    console.log(`✅ Axe available on window: ${axeAvailable}`);

    if (!axeAvailable) {
      throw new Error("❌ Axe not available on window after injection");
    }

    console.log("\n[STEP 8] Running axe.run()...");
    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        console.log("[Browser] Starting axe.run()...");
        (window as any).axe.run((error: any, results: any) => {
          if (error) {
            console.error("[Browser] Axe error:", error);
            reject(error);
          } else {
            console.log("[Browser] Axe scan completed");
            resolve(results);
          }
        });
      });
    });

    console.log("✅ Axe scan completed successfully");

    console.log("\n[STEP 9] Processing results...");
    const axeResults = results as any;
    const violationCount = axeResults.violations?.length || 0;
    const passCount = axeResults.passes?.length || 0;
    const incompleteCount = axeResults.incomplete?.length || 0;

    console.log(`✅ Results processed:`);
    console.log(`   - Violations: ${violationCount}`);
    console.log(`   - Passes: ${passCount}`);
    console.log(`   - Incomplete: ${incompleteCount}`);

    console.log("\n" + "=".repeat(80));
    console.log("✅ AXE SCAN TEST COMPLETED SUCCESSFULLY");
    console.log("=".repeat(80));

    console.log("\n📊 FULL RESULTS:");
    console.log(JSON.stringify(axeResults, null, 2));

  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ AXE SCAN TEST FAILED");
    console.error("=".repeat(80));
    console.error("\nError:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    console.error("\nFull error object:");
    console.error(error);
    process.exit(1);

  } finally {
    if (browser) {
      console.log("\n[CLEANUP] Closing browser...");
      await browser.close();
      console.log("✅ Browser closed");
    }
  }
}

testAxeScan();

