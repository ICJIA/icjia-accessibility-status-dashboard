#!/usr/bin/env node

/**
 * Reset all scans and site scores to zero
 * Usage: node scripts/reset-scans.js
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetScans() {
  try {
    console.log("🔄 Resetting scans and site scores...\n");

    // Delete all scans (cascade will delete scan_results and scan_violations)
    console.log("  Deleting all scans...");
    const { error: scansError } = await supabase
      .from("scans")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (scansError) {
      console.error("  ❌ Error deleting scans:", scansError);
      return;
    }
    console.log("  ✅ Scans deleted");

    // Delete all score history
    console.log("  Deleting score history...");
    const { error: historyError } = await supabase
      .from("score_history")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (historyError) {
      console.error("  ❌ Error deleting score history:", historyError);
      return;
    }
    console.log("  ✅ Score history deleted");

    // Reset all site scores to 0
    console.log("  Resetting site scores to 0...");
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

    console.log("\n✨ Reset complete! All scans and scores have been cleared.");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetScans();

