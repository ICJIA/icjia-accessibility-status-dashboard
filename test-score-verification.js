#!/usr/bin/env node

/**
 * Score Verification Test
 * Compares standalone test scores with database scores
 */

import fetch from "node-fetch";

const API_BASE = "http://localhost:3001";
const TEST_URL = "https://vpp.icjia.illinois.gov/";

console.log("=".repeat(80));
console.log("🔍 SCORE VERIFICATION TEST");
console.log("=".repeat(80));
console.log(`\n📍 Testing URL: ${TEST_URL}`);
console.log(`📍 API Base: ${API_BASE}\n`);

async function getSiteByUrl(url) {
  try {
    const response = await fetch(`${API_BASE}/api/sites`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const sites = await response.json();
    return sites.find((s) => s.url === url);
  } catch (error) {
    console.error("❌ Failed to fetch sites:", error);
    return null;
  }
}

async function getLatestScans(siteId) {
  try {
    const response = await fetch(`${API_BASE}/api/scans?site_id=${siteId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const scans = await response.json();
    return scans.filter((s) => s.status === "completed").slice(0, 3);
  } catch (error) {
    console.error("❌ Failed to fetch scans:", error);
    return [];
  }
}

async function runVerification() {
  console.log("[1] Finding site in database...");
  const site = await getSiteByUrl(TEST_URL);

  if (!site) {
    console.error("❌ Site not found in database");
    console.log("\n💡 Tip: Add the site to the database first via the admin panel");
    process.exit(1);
  }

  console.log(`✅ Found site: ${site.title}`);
  console.log(`   - Current Axe Score: ${site.axe_score}/100`);
  console.log(`   - Current Lighthouse Score: ${site.lighthouse_score}/100\n`);

  console.log("[2] Fetching latest scans...");
  const scans = await getLatestScans(site.id);

  if (scans.length === 0) {
    console.error("❌ No completed scans found");
    console.log("\n💡 Tip: Run a scan via the admin panel first");
    process.exit(1);
  }

  console.log(`✅ Found ${scans.length} completed scan(s)\n`);

  console.log("=".repeat(80));
  console.log("📊 SCAN HISTORY");
  console.log("=".repeat(80));

  scans.forEach((scan, i) => {
    const completed = new Date(scan.completed_at).toLocaleString();
    console.log(`\n${i + 1}. Scan completed: ${completed}`);
    console.log(`   - Axe Score: ${scan.axe_score}/100`);
    console.log(`   - Lighthouse Score: ${scan.lighthouse_score}/100`);

    if (scan.axe_report) {
      const violations = scan.axe_report.violations || 0;
      const expectedScore = Math.max(0, 100 - violations * 5);
      console.log(`   - Axe Violations: ${violations}`);
      console.log(`   - Expected Score: ${expectedScore}/100`);
      if (scan.axe_score !== expectedScore) {
        console.log(`   ⚠️  MISMATCH: Got ${scan.axe_score}, expected ${expectedScore}`);
      }
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("✅ VERIFICATION COMPLETE");
  console.log("=".repeat(80));
  console.log("\n💡 Next Steps:");
  console.log("   1. Run: node test-axe-scan.js");
  console.log("   2. Run: node test-lighthouse-scan.js");
  console.log("   3. Compare the scores with the database values above");
}

runVerification();

