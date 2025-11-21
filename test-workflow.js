import { createClient } from "@supabase/supabase-js";

// NOTE: These should be loaded from environment variables in production
// For testing, use your .env file or set these as environment variables
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "your_anon_key_here";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWorkflow() {
  console.log("🔍 Checking for existing API keys...\n");

  const { data: keys, error } = await supabase
    .from("api_keys")
    .select("id, key_name, api_key_prefix, scopes")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Error fetching API keys:", error);
    return;
  }

  if (keys && keys.length > 0) {
    console.log("✅ Found existing API key:");
    console.log(`   Name: ${keys[0].key_name}`);
    console.log(`   Prefix: ${keys[0].api_key_prefix}...`);
    console.log(`   Scopes: ${keys[0].scopes?.join(", ") || "none"}`);
  } else {
    console.log("⚠️  No API keys found in database");
    console.log(
      "   You'll need to create one via the admin panel at /admin/api-keys"
    );
  }

  // Check audit logs
  console.log("\n📋 Checking audit logs...");
  const { data: activities, error: actError } = await supabase
    .from("audit_logs")
    .select("id, action, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (actError) {
    console.error("❌ Error fetching audit logs:", actError);
  } else {
    console.log(`✅ Found ${activities?.length || 0} audit log entries`);
    activities?.forEach((act) => {
      console.log(
        `   - ${act.action} (${new Date(act.created_at).toLocaleString()})`
      );
    });
  }

  // Check payloads
  console.log("\n📦 Checking API payloads...");
  const { data: payloads, error: payError } = await supabase
    .from("api_payloads")
    .select("id, payload_id, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (payError) {
    console.error("❌ Error fetching payloads:", payError);
  } else {
    console.log(`✅ Found ${payloads?.length || 0} API payloads`);
    payloads?.forEach((p) => {
      console.log(
        `   - ${p.payload_id} (${new Date(p.created_at).toLocaleString()})`
      );
    });
  }
}

testWorkflow().catch(console.error);
