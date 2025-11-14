#!/usr/bin/env node

/**
 * Clear Activity Logs Script
 * Deletes all entries from the activity_log table
 * Useful for testing and cleanup
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearActivityLogs() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log("\n⚠️  WARNING: This will delete ALL activity log entries!\n");

  const confirm = await question(
    'Type "DELETE ALL LOGS" to confirm: '
  );

  if (confirm !== "DELETE ALL LOGS") {
    console.log("❌ Cancelled - no logs were deleted");
    rl.close();
    return;
  }

  try {
    console.log("\n🗑️  Clearing activity logs...");

    const { error } = await supabase.from("activity_log").delete().neq("id", "");

    if (error) {
      console.error("❌ Error clearing logs:", error);
      rl.close();
      process.exit(1);
    }

    console.log("✅ All activity logs cleared successfully!\n");
    rl.close();
  } catch (error) {
    console.error("❌ Error:", error);
    rl.close();
    process.exit(1);
  }
}

clearActivityLogs();

