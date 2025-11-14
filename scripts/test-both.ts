#!/usr/bin/env node

/**
 * Test script to run both Lighthouse and Axe audits against a site
 * Run with: npx tsx scripts/test-both.ts
 * Or with a custom URL: npx tsx scripts/test-both.ts https://example.com
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to dvfr.illinois.gov, or use provided URL
const testUrl = process.argv[2] || "https://dvfr.illinois.gov/";

console.log("=".repeat(80));
console.log("🧪 COMBINED LIGHTHOUSE & AXE TEST SCRIPT");
console.log("=".repeat(80));
console.log(`URL: ${testUrl}`);
console.log(`Time: ${new Date().toISOString()}`);
console.log("=".repeat(80));

async function runScript(scriptName: string, scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running ${scriptName}...\n`);

    const child = spawn("npx", ["tsx", scriptPath, testUrl], {
      cwd: __dirname,
      stdio: "inherit",
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`\n✅ ${scriptName} completed successfully\n`);
        resolve();
      } else {
        reject(new Error(`${scriptName} failed with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function runBothTests() {
  try {
    // Run Lighthouse first
    await runScript(
      "Lighthouse Audit",
      path.join(__dirname, "test-lighthouse.ts")
    );

    // Then run Axe
    await runScript("Axe Accessibility Scan", path.join(__dirname, "test-axe.ts"));

    console.log("=".repeat(80));
    console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ TEST FAILED");
    console.error("=".repeat(80));
    console.error(
      "\nError:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

runBothTests();

