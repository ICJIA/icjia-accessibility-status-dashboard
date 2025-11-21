#!/usr/bin/env node

/**
 * Reset all scans and site scores to zero
 * Usage: node scripts/reset-scans.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetScans() {
  try {
    console.log("🔄 Resetting all scan data...\n");

    // Delete in order of dependencies (child tables first)
    const tables = [
      "scan_violations",
      "page_scan_results",
      "scan_errors",
      "scan_results",
      "scans",
      "score_history",
    ];

    for (const table of tables) {
      console.log(`  Deleting ${table}...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        console.error(`  ❌ Error deleting ${table}:`, error);
        return;
      }
      console.log(`  ✅ ${table} deleted`);
    }

    // Reset all site scores to 0
    console.log("\n  Resetting site scores to 0...");
    const { error: updateError } = await supabase
      .from("sites")
      .update({
        axe_score: 0,
        lighthouse_score: 0,
        axe_last_updated: new Date().toISOString(),
        lighthouse_last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (updateError) {
      console.error("  ❌ Error updating sites:", updateError);
      return;
    }
    console.log("  ✅ Site scores reset to 0");

    console.log("\n✨ Reset complete! All scan data cleared, sites intact.");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetScans();
