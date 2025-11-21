#!/usr/bin/env node

/**
 * Complete App Reset Script
 *
 * ⚠️  DESTRUCTIVE OPERATION ⚠️
 *
 * This script completely wipes the database and resets it to initial defaults.
 * ALL DATA WILL BE PERMANENTLY DELETED:
 * - All admin users
 * - All API keys
 * - All sessions
 * - All sites and their data
 * - All score history
 * - All API payloads
 * - All activity logs
 * - All documentation
 *
 * After running this script, the database will be in the exact same state as
 * a fresh installation, requiring the creation of a new admin user.
 *
 * This script requires TWO separate confirmations to prevent accidental data loss.
 *
 * Usage: node scripts/reset-app.js
 */

require("dotenv").config();
const readline = require("readline");
const { createClient } = require("@supabase/supabase-js");

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NODE_ENV = process.env.NODE_ENV || "development";

// Tables to delete (in order to avoid foreign key constraint issues)
const TABLES_TO_DELETE = [
  "audit_logs",
  "api_payloads",
  "api_keys",
  "sessions",
  "documentation",
  "score_history",
  "sites",
  "admin_users",
];

// ============================================================================
// SAFETY CHECKS
// ============================================================================

function checkEnvironment() {
  if (NODE_ENV === "production") {
    console.error(
      "❌ ERROR: This script cannot be run in production environments"
    );
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ ERROR: Missing required environment variables");
    console.error("   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
}

// ============================================================================
// USER CONFIRMATION
// ============================================================================

async function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function displayInitialWarning() {
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║          ⚠️  COMPLETE DATABASE RESET - FINAL WARNING ⚠️         ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");
  console.log("🚨 THIS OPERATION WILL PERMANENTLY DELETE EVERYTHING 🚨\n");
  console.log("The following will be COMPLETELY ERASED:");
  console.log("  ✗ ALL admin users (including the primary admin)");
  console.log("  ✗ ALL API keys");
  console.log("  ✗ ALL active sessions");
  console.log("  ✗ ALL sites and their data");
  console.log("  ✗ ALL score history and trends");
  console.log("  ✗ ALL API payloads and audit trail");
  console.log("  ✗ ALL activity logs");
  console.log("  ✗ ALL documentation\n");
  console.log("After running this script:");
  console.log("  → The database will be completely empty");
  console.log("  → You will need to create a new admin user from scratch");
  console.log("  → All historical data will be permanently lost");
  console.log("  → This action CANNOT be undone\n");
  console.log(
    "═══════════════════════════════════════════════════════════════\n"
  );
}

function displaySecondWarning() {
  console.log("\n");
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║                    ⚠️  FINAL CONFIRMATION ⚠️                    ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "║  You are about to permanently delete ALL data in the database. ║"
  );
  console.log(
    "║  This action cannot be undone. All sites, users, API keys,     ║"
  );
  console.log(
    "║  history, and logs will be permanently erased.                 ║"
  );
  console.log(
    "║                                                                ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );
  console.log("\n");
}

async function getFirstConfirmation() {
  console.log("FIRST CONFIRMATION:");
  console.log(
    "Type the following phrase to confirm you understand the consequences:"
  );
  console.log('"I understand this will delete everything permanently"\n');

  const answer = await getUserInput("Enter confirmation phrase: ");

  if (answer !== "I understand this will delete everything permanently") {
    console.log("\n❌ Incorrect phrase. Operation cancelled.\n");
    process.exit(0);
  }

  console.log("✓ First confirmation accepted\n");
}

async function getSecondConfirmation() {
  displaySecondWarning();

  console.log("SECOND CONFIRMATION:");
  console.log("Type the following phrase to confirm you want to proceed:");
  console.log('"DELETE EVERYTHING NOW"\n');

  const answer = await getUserInput("Enter confirmation phrase: ");

  if (answer !== "DELETE EVERYTHING NOW") {
    console.log("\n❌ Incorrect phrase. Operation cancelled.\n");
    process.exit(0);
  }

  console.log("✓ Second confirmation accepted\n");
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function deleteAllRecords(supabase, tableName) {
  try {
    // Get count before deletion
    const { count: countBefore } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    // Delete all records
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      throw error;
    }

    // Get count after deletion
    const { count: countAfter } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    return {
      success: true,
      deletedCount: countBefore || 0,
      remainingCount: countAfter || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function resetDatabase(supabase) {
  console.log("\n🔄 Starting complete database reset...\n");
  console.log("Deleting all records from all tables...\n");

  const results = {};
  let allSuccess = true;

  for (const tableName of TABLES_TO_DELETE) {
    process.stdout.write(`🗑️  Deleting all records from ${tableName}... `);

    results[tableName] = await deleteAllRecords(supabase, tableName);

    if (results[tableName].success) {
      console.log(`✓ Deleted ${results[tableName].deletedCount} record(s)`);
    } else {
      console.log(`✗ Error: ${results[tableName].error}`);
      allSuccess = false;
    }
  }

  return allSuccess;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    // Check environment
    checkEnvironment();

    // Display initial warning
    displayInitialWarning();

    // Get first confirmation
    await getFirstConfirmation();

    // Get second confirmation
    await getSecondConfirmation();

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Reset database
    const success = await resetDatabase(supabase);

    if (success) {
      console.log("\n✅ Complete database reset finished!\n");
      console.log("📋 Next steps:");
      console.log("   1. Start the application: npm run dev");
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      console.log(`   2. Navigate to ${frontendUrl}/admin`);
      console.log("   3. Create a new admin user");
      console.log("   4. Log in with the new admin account");
      console.log("   5. Create new sites and configure the application\n");
      process.exit(0);
    } else {
      console.error("\n❌ Database reset encountered errors\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
