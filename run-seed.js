import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env file
const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey || !supabaseUrl) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  try {
    console.log("🌱 Starting seed data creation...\n");

    // Check if --with-sites flag is provided
    const withSites = process.argv.includes("--with-sites");

    if (withSites) {
      // Step 1: Clear existing demo data
      console.log("📋 Step 1: Clearing existing demo data...");
      const deleteIds = [
        "550e8400-e29b-41d4-a716-446655460001",
        "550e8400-e29b-41d4-a716-446655460002",
      ];

      const { error: actError } = await supabase
        .from("audit_logs")
        .delete()
        .in("id", deleteIds);
      if (actError) console.log("Audit logs delete:", actError.message);

      const payloadIds = [
        "550e8400-e29b-41d4-a716-446655450001",
        "550e8400-e29b-41d4-a716-446655450002",
        "550e8400-e29b-41d4-a716-446655450003",
        "550e8400-e29b-41d4-a716-446655450004",
        "550e8400-e29b-41d4-a716-446655450005",
      ];

      const { error: payError } = await supabase
        .from("api_payloads")
        .delete()
        .in("id", payloadIds);
      if (payError) console.log("Payloads delete:", payError.message);

      const siteIds = [
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440002",
      ];

      const { error: siteError } = await supabase
        .from("sites")
        .delete()
        .in("id", siteIds);
      if (siteError) console.log("Sites delete:", siteError.message);

      console.log("✅ Cleared existing demo data\n");

      // Step 2: Create real Illinois government sites
      console.log("📋 Step 2: Creating real Illinois government sites...");
      const now = new Date().toISOString();
      const sites = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          title: "Domestic Violence Fatality Review",
          description:
            "The Domestic Violence Fatality Review Act (Public Act 102-0520) was signed into law in August 2021. The Committee was established to serve as a statewide resource for addressing domestic violence-related fatalities and near-fatalities, establish regional domestic violence fatality review teams, and issue annual recommendations for systems change.",
          url: "https://dvfr.illinois.gov/",
          documentation_url: null,
          axe_score: 88,
          lighthouse_score: 85,
          axe_last_updated: now,
          lighthouse_last_updated: now,
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          title: "InfoNet",
          description:
            "InfoNet is a web-based data collection and reporting system used by victim service providers in Illinois. The system is nationally recognized for facilitating standardized data collection and reporting at the statewide level. Initial development of InfoNet began in the mid-90s as a collaborative effort between the Illinois Criminal Justice Information Authority, the Illinois Coalition Against Sexual Assault, and the Illinois Coalition Against Domestic Violence. Since then, InfoNet has grown to include partnerships with the Illinois Department of Human Services and the Chicago Department of Family & Support Services.",
          url: "https://infonet.icjia.illinois.gov/",
          documentation_url: "https://infonet.icjia.illinois.gov/documentation",
          axe_score: 91,
          lighthouse_score: 89,
          axe_last_updated: now,
          lighthouse_last_updated: now,
        },
      ];

      const { error: sitesInsertError } = await supabase
        .from("sites")
        .insert(sites);
      if (sitesInsertError) throw sitesInsertError;
      console.log(`✅ Created ${sites.length} demo sites\n`);
    } else {
      console.log(
        "📋 Step 1-2: Skipping site creation (use --with-sites flag to add demo sites)\n"
      );
    }

    if (withSites) {
      // Step 3: Create API payloads
      console.log("📋 Step 3: Creating API payloads...");
      const payloads = [
        {
          id: "550e8400-e29b-41d4-a716-446655450001",
          site_id: "550e8400-e29b-41d4-a716-446655440001",
          payload_id: "api-import-2025-11-10T10-00-00-000Z",
          payload: {
            title: "Domestic Violence Fatality Review",
            axe_score: 88,
            lighthouse_score: 85,
            axe_violations: [
              { id: "color-contrast", impact: "serious", nodes: 3 },
            ],
          },
          payload_size: 456,
          description: "Initial accessibility scan for DVFR website",
          ip_address: "192.168.1.100",
          user_agent: "Mozilla/5.0 (Demo)",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655450002",
          site_id: "550e8400-e29b-41d4-a716-446655440002",
          payload_id: "api-import-2025-11-10T09-30-00-000Z",
          payload: {
            title: "InfoNet",
            axe_score: 91,
            lighthouse_score: 89,
            axe_violations: [
              { id: "color-contrast", impact: "serious", nodes: 2 },
            ],
          },
          payload_size: 512,
          description: "Initial accessibility scan for InfoNet",
          ip_address: "192.168.1.100",
          user_agent: "Mozilla/5.0 (Demo)",
        },
      ];

      const { error: payloadsInsertError } = await supabase
        .from("api_payloads")
        .insert(payloads);
      if (payloadsInsertError) throw payloadsInsertError;
      console.log(`✅ Created ${payloads.length} API payloads\n`);

      // Step 4: Create audit log entries
      console.log("📋 Step 4: Creating audit log entries...");
      const auditLogs = [
        {
          action: "api_import",
          description:
            "API import: Domestic Violence Fatality Review - Initial setup",
          metadata: {
            site_name: "Domestic Violence Fatality Review",
            payload_uuid: "550e8400-e29b-41d4-a716-446655450001",
            axe_score: 88,
            lighthouse_score: 85,
          },
        },
        {
          action: "api_import",
          description: "API import: InfoNet - Initial setup",
          metadata: {
            site_name: "InfoNet",
            payload_uuid: "550e8400-e29b-41d4-a716-446655450002",
            axe_score: 91,
            lighthouse_score: 89,
          },
        },
      ];

      const { error: auditLogsInsertError } = await supabase
        .from("audit_logs")
        .insert(auditLogs);
      if (auditLogsInsertError) throw auditLogsInsertError;
      console.log(`✅ Created ${auditLogs.length} audit log entries\n`);
    } else {
      console.log("📋 Step 3-4: Skipping API payloads and audit logs\n");
    }

    // Note: Score history is now created by scans endpoint when scans complete
    // This ensures hourly granularity and accurate tracking of accessibility improvements
    console.log("📋 Score history will be created by scan endpoint\n");

    console.log("🎉 Seed data creation complete!");
    console.log("\nVerifying data...");

    const { count: siteCount } = await supabase
      .from("sites")
      .select("*", { count: "exact", head: true })
      .in("id", siteIds);

    const { count: payloadCount } = await supabase
      .from("api_payloads")
      .select("*", { count: "exact", head: true })
      .in("id", payloadIds);

    const { count: activityCount } = await supabase
      .from("activity_log")
      .select("*", { count: "exact", head: true })
      .in("id", deleteIds);

    console.log(`✅ Sites: ${siteCount}`);
    console.log(`✅ Payloads: ${payloadCount}`);
    console.log(`✅ Activity log entries: ${activityCount}`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

runSeed();
