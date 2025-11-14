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

    // Log the action
    await supabase.from("activity_log").insert([
      {
        event_type: "site_created",
        event_description: `Created new site: ${title}`,
        entity_type: "site",
        entity_id: newSite.id,
        created_by_user: req.userId,
        severity: "info",
        metadata: {
          site_name: title,
          url: url,
        },
      },
    ]);

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

    // Log the action
    const changes: string[] = [];
    if (currentSite.title !== title)
      changes.push(`title: "${currentSite.title}" → "${title}"`);
    if (currentSite.description !== description)
      changes.push("description updated");
    if (currentSite.url !== url)
      changes.push(`url: "${currentSite.url}" → "${url}"`);
    if (currentSite.axe_score !== axe_score)
      changes.push(`axe_score: ${currentSite.axe_score} → ${axe_score}`);
    if (currentSite.lighthouse_score !== lighthouse_score)
      changes.push(
        `lighthouse_score: ${currentSite.lighthouse_score} → ${lighthouse_score}`
      );

    await supabase.from("activity_log").insert([
      {
        event_type: "site_updated",
        event_description: `Updated site: ${title}${
          changes.length > 0 ? ` (${changes.join(", ")})` : ""
        }`,
        entity_type: "site",
        entity_id: id,
        created_by_user: req.userId,
        severity: "info",
        metadata: {
          site_name: title,
          changes: changes,
        },
      },
    ]);

    return res.json({ site: updatedSite });
  } catch (error) {
    console.error("Update site error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Get site info before deletion for logging
    const { data: site, error: fetchError } = await supabase
      .from("sites")
      .select("id, title")
      .eq("id", id)
      .single();

    if (fetchError || !site) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { error } = await supabase.from("sites").delete().eq("id", id);

    if (error) {
      console.error("Error deleting site:", error);
      return res.status(500).json({ error: "Failed to delete site" });
    }

    // Log the action
    await supabase.from("activity_log").insert([
      {
        event_type: "site_deleted",
        event_description: `Deleted site: ${site.title}`,
        entity_type: "site",
        entity_id: id,
        created_by_user: req.userId,
        severity: "warning",
        metadata: {
          site_name: site.title,
        },
      },
    ]);

    return res.json({ message: "Site deleted successfully" });
  } catch (error) {
    console.error("Delete site error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/sites/:id/clear-data
 * Clear all scans and historical data for a site
 * Keeps the site record but removes all associated scan data
 */
router.post("/:id/clear-data", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify site exists
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .select("id, title")
      .eq("id", id)
      .single();

    if (siteError || !site) {
      return res.status(404).json({ error: "Site not found" });
    }

    // Delete all scans for this site
    const { error: scansError } = await supabase
      .from("scans")
      .delete()
      .eq("site_id", id);

    if (scansError) {
      console.error("Error deleting scans:", scansError);
      return res.status(500).json({ error: "Failed to delete scans" });
    }

    // Delete all score history for this site
    const { error: historyError } = await supabase
      .from("score_history")
      .delete()
      .eq("site_id", id);

    if (historyError) {
      console.error("Error deleting score history:", historyError);
      return res.status(500).json({ error: "Failed to delete score history" });
    }

    // Reset site scores to 0
    const { error: updateError } = await supabase
      .from("sites")
      .update({
        axe_score: 0,
        lighthouse_score: 0,
        axe_last_updated: null,
        lighthouse_last_updated: null,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating site:", updateError);
      return res.status(500).json({ error: "Failed to update site" });
    }

    // Log the action
    await supabase.from("activity_log").insert([
      {
        event_type: "site_data_cleared",
        event_description: `Cleared all data for site: ${site.title}`,
        entity_type: "site",
        entity_id: id,
        created_by_user: req.userId,
        severity: "warning",
        metadata: {
          site_name: site.title,
        },
      },
    ]);

    return res.json({ message: "Site data cleared successfully" });
  } catch (error) {
    console.error("Clear site data error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
