/**
 * @fileoverview Site Management Routes
 * Handles site CRUD operations, score tracking, and site administration.
 * Supports both authenticated user and API key authentication.
 *
 * @module routes/sites
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import {
  requireApiKey,
  requireScope,
  ApiAuthRequest,
} from "../middleware/apiAuth.js";

/**
 * Express router for site management endpoints
 * @type {express.Router}
 */
const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data: sites, error } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sites:", error);
      return res.status(500).json({ error: "Failed to fetch sites" });
    }

    return res.json({ sites });
  } catch (error) {
    console.error("Get sites error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: site, error } = await supabase
      .from("sites")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !site) {
      return res.status(404).json({ error: "Site not found" });
    }

    return res.json({ site });
  } catch (error) {
    console.error("Get site error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/history", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: history, error } = await supabase
      .from("score_history")
      .select("*")
      .eq("site_id", id)
      .order("recorded_at", { ascending: true });

    if (error) {
      console.error("Error fetching history:", error);
      return res.status(500).json({ error: "Failed to fetch history" });
    }

    return res.json({ history });
  } catch (error) {
    console.error("Get history error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/sites/:id/scans
 * Get all scans for a specific site (admin-only)
 */
router.get("/:id/scans", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: scans, error } = await supabase
      .from("scans")
      .select("*")
      .eq("site_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching scans:", error);
      return res.status(500).json({ error: "Failed to fetch scans" });
    }

    return res.json({ scans });
  } catch (error) {
    console.error("Get scans error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      url,
      sitemap_url,
      documentation_url,
      axe_score,
      lighthouse_score,
      axe_last_updated,
      lighthouse_last_updated,
    } = req.body;

    // Validate required fields
    if (!title || !description || !url) {
      return res
        .status(400)
        .json({ error: "Missing required fields: title, description, url" });
    }

    // Validate URL format
    try {
      new URL(url);
      if (sitemap_url) new URL(sitemap_url);
      if (documentation_url) new URL(documentation_url);
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Use provided scores or default to 0
    const finalAxeScore = axe_score !== undefined ? axe_score : 0;
    const finalLighthouseScore =
      lighthouse_score !== undefined ? lighthouse_score : 0;

    // Validate score ranges
    if (
      finalAxeScore < 0 ||
      finalAxeScore > 100 ||
      finalLighthouseScore < 0 ||
      finalLighthouseScore > 100
    ) {
      return res
        .status(400)
        .json({ error: "Scores must be between 0 and 100" });
    }

    // Use provided dates or current date
    const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const finalAxeLastUpdated = axe_last_updated || now;
    const finalLighthouseLastUpdated = lighthouse_last_updated || now;

    const { data: newSite, error } = await supabase
      .from("sites")
      .insert([
        {
          title,
          description,
          url,
          sitemap_url: sitemap_url || null,
          documentation_url: documentation_url || null,
          axe_score: finalAxeScore,
          lighthouse_score: finalLighthouseScore,
          axe_last_updated: finalAxeLastUpdated,
          lighthouse_last_updated: finalLighthouseLastUpdated,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating site:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error,
      });
      return res
        .status(500)
        .json({ error: "Failed to create site", details: error.message });
    }

    return res.status(201).json({ site: newSite });
  } catch (error) {
    console.error("Create site error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      url,
      documentation_url,
      axe_score,
      lighthouse_score,
      axe_last_updated,
      lighthouse_last_updated,
    } = req.body;

    const { data: currentSite, error: fetchError } = await supabase
      .from("sites")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentSite) {
      return res.status(404).json({ error: "Site not found" });
    }

    if (
      axe_score < 0 ||
      axe_score > 100 ||
      lighthouse_score < 0 ||
      lighthouse_score > 100
    ) {
      return res
        .status(400)
        .json({ error: "Scores must be between 0 and 100" });
    }

    if (
      currentSite.axe_score !== axe_score ||
      currentSite.lighthouse_score !== lighthouse_score
    ) {
      await supabase.from("score_history").insert([
        {
          site_id: id,
          axe_score,
          lighthouse_score,
          recorded_at: new Date().toISOString(),
        },
      ]);
    }

    const { data: updatedSite, error: updateError } = await supabase
      .from("sites")
      .update({
        title,
        description,
        url,
        documentation_url: documentation_url || null,
        axe_score,
        lighthouse_score,
        axe_last_updated,
        lighthouse_last_updated,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating site:", updateError);
      return res.status(500).json({ error: "Failed to update site" });
    }

    return res.json({ site: updatedSite });
  } catch (error) {
    console.error("Update site error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("sites").delete().eq("id", id);

    if (error) {
      console.error("Error deleting site:", error);
      return res.status(500).json({ error: "Failed to delete site" });
    }

    return res.json({ message: "Site deleted successfully" });
  } catch (error) {
    console.error("Delete site error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/sites/import
 * Programmatic API endpoint for importing site data with API key authentication
 * Supports duplicate detection to prevent redundant uploads
 */
router.post(
  "/import",
  requireApiKey,
  requireScope("sites:write"),
  async (req: ApiAuthRequest, res) => {
    try {
      const requestBody = req.body;

      // Extract payload description (optional commit-style message)
      // This is separate from the site's description field
      const payloadDescription = requestBody.payload_description || null;

      // Support both single site and array of sites
      let sitesArray: any[];
      if (requestBody.sites && Array.isArray(requestBody.sites)) {
        sitesArray = requestBody.sites;
      } else if (Array.isArray(requestBody)) {
        sitesArray = requestBody;
      } else {
        // Single site object
        sitesArray = [requestBody];
      }

      const processedSites = [];
      const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (const siteData of sitesArray) {
        const {
          title,
          description,
          url,
          documentation_url,
          axe_score,
          lighthouse_score,
          axe_last_updated,
          lighthouse_last_updated,
        } = siteData;

        // Validate required fields
        if (
          !title ||
          !description ||
          !url ||
          axe_score === undefined ||
          lighthouse_score === undefined ||
          !axe_last_updated ||
          !lighthouse_last_updated
        ) {
          results.errors.push(
            `Invalid site data: missing required fields for "${
              title || "unknown"
            }"`
          );
          continue;
        }

        // Validate score ranges
        if (
          axe_score < 0 ||
          axe_score > 100 ||
          lighthouse_score < 0 ||
          lighthouse_score > 100
        ) {
          results.errors.push(
            `Scores must be between 0 and 100 for "${title}"`
          );
          continue;
        }

        // Check if site already exists by URL
        const { data: existingSite, error: findError } = await supabase
          .from("sites")
          .select("*")
          .eq("url", url)
          .single();

        let site;
        let action: "created" | "updated" | "skipped" = "created";
        let skipReason: string | undefined;

        if (existingSite && !findError) {
          // Check for duplicate (same scores and dates)
          const isDuplicate =
            existingSite.axe_score === axe_score &&
            existingSite.lighthouse_score === lighthouse_score &&
            existingSite.axe_last_updated === axe_last_updated &&
            existingSite.lighthouse_last_updated === lighthouse_last_updated;

          if (isDuplicate) {
            // Skip duplicate upload
            console.log(
              `Skipping duplicate upload for site: ${title} - scores unchanged`
            );
            action = "skipped";
            skipReason = "Scores unchanged since last upload";
            site = existingSite;
            results.skipped++;

            processedSites.push({
              id: site.id,
              title: site.title,
              url: site.url,
              action,
              reason: skipReason,
            });
            continue;
          }

          // Site exists but scores changed - update it
          console.log(`Site "${title}" already exists, updating scores`);

          // Add new score to history
          await supabase.from("score_history").insert([
            {
              site_id: existingSite.id,
              axe_score,
              lighthouse_score,
              recorded_at: new Date().toISOString(),
            },
          ]);

          // Update the site's current scores
          const { data: updatedSite, error: updateError } = await supabase
            .from("sites")
            .update({
              title,
              description,
              documentation_url: documentation_url || null,
              axe_score,
              lighthouse_score,
              axe_last_updated,
              lighthouse_last_updated,
            })
            .eq("id", existingSite.id)
            .select()
            .single();

          if (updateError) {
            console.error("Error updating site from API import:", updateError);
            results.errors.push(`Failed to update site: ${title}`);
            continue;
          }

          site = updatedSite;
          action = "updated";
          results.updated++;
        } else {
          // Site doesn't exist - create new site
          console.log(`Creating new site via API: "${title}"`);

          const { data: newSite, error: siteError } = await supabase
            .from("sites")
            .insert([
              {
                title,
                description,
                url,
                documentation_url: documentation_url || null,
                axe_score,
                lighthouse_score,
                axe_last_updated,
                lighthouse_last_updated,
              },
            ])
            .select()
            .single();

          if (siteError) {
            console.error("Error creating site from API import:", siteError);
            results.errors.push(`Failed to create site: ${title}`);
            continue;
          }

          site = newSite;
          action = "created";
          results.created++;

          // Add initial score to history for new sites
          await supabase.from("score_history").insert([
            {
              site_id: newSite.id,
              axe_score,
              lighthouse_score,
              recorded_at: new Date().toISOString(),
            },
          ]);
        }

        // Store API payload for audit trail (only for created/updated, not skipped)
        if (action !== "skipped") {
          const payloadId = `api-import-${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}`;

          const { data: payloadData, error: payloadError } = await supabase
            .from("api_payloads")
            .insert([
              {
                site_id: site.id,
                payload_id: payloadId,
                payload: siteData,
                payload_size: JSON.stringify(siteData).length,
                description: payloadDescription,
                api_key_id: req.apiKey?.id || null,
                created_by_user: null, // API imports don't have a user_id
                ip_address: req.ip || null,
                user_agent: req.get("user-agent") || null,
              },
            ])
            .select()
            .single();

          if (payloadError) {
            console.error(
              "Error storing API payload audit trail:",
              payloadError
            );
            // Don't fail the import if audit trail fails, just log it
          }

          // Log activity
          const { error: activityError } = await supabase
            .from("activity_log")
            .insert([
              {
                event_type:
                  action === "created" ? "site_created" : "site_updated",
                event_description:
                  payloadDescription ||
                  `${
                    action === "created" ? "Created" : "Updated"
                  } site: ${title}`,
                entity_type: "site",
                entity_id: site.id,
                metadata: {
                  action,
                  payload_id: payloadId,
                  payload_uuid: payloadData?.id || null,
                  axe_score,
                  lighthouse_score,
                },
                created_by_api_key: req.apiKey?.id || null,
                ip_address: req.ip || null,
                user_agent: req.get("user-agent") || null,
              },
            ]);

          if (activityError) {
            console.error("Error logging activity:", activityError);
          }
        }

        processedSites.push({
          id: site.id,
          title: site.title,
          url: site.url,
          action,
          ...(skipReason && { reason: skipReason }),
        });
      }

      // Build response message
      const messageParts = [];
      if (results.created > 0) messageParts.push(`${results.created} created`);
      if (results.updated > 0) messageParts.push(`${results.updated} updated`);
      if (results.skipped > 0)
        messageParts.push(`${results.skipped} skipped (duplicate)`);

      const message = `Processed ${
        processedSites.length
      } site(s): ${messageParts.join(", ")}`;

      return res.status(200).json({
        success: true,
        message,
        results,
        sites: processedSites,
      });
    } catch (error) {
      console.error("API import error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
