/**
 * @fileoverview Activity Log Routes
 * Handles activity log retrieval and export.
 * Provides audit trail of all system events and user actions.
 * All routes require authentication.
 *
 * @module routes/activityLog
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Express router for activity log endpoints
 * @type {express.Router}
 */
const router = Router();

/**
 * GET /api/activity-log
 * Get recent activity log entries (admin-only)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // First, fetch activity log entries (exclude entries with null event_type)
    const {
      data: activities,
      error,
      count,
    } = await supabase
      .from("activity_log")
      .select("*", { count: "exact" })
      .not("event_type", "is", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching activity log:", error);
      return res.status(500).json({ error: "Failed to fetch activity log" });
    }

    // Fetch user and api_key data separately if needed
    let enrichedActivities = activities || [];

    if (enrichedActivities.length > 0) {
      // Get unique user IDs
      const userIds = [
        ...new Set(
          enrichedActivities.map((a: any) => a.created_by_user).filter(Boolean)
        ),
      ];

      // Get unique api_key IDs
      const apiKeyIds = [
        ...new Set(
          enrichedActivities
            .map((a: any) => a.created_by_api_key)
            .filter(Boolean)
        ),
      ];

      // Fetch users if any
      let usersMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("admin_users")
          .select("id, username")
          .in("id", userIds);

        if (users) {
          usersMap = Object.fromEntries(users.map((u) => [u.id, u]));
        }
      }

      // Fetch api_keys if any
      let apiKeysMap: Record<string, any> = {};
      if (apiKeyIds.length > 0) {
        const { data: apiKeys } = await supabase
          .from("api_keys")
          .select("id, key_name")
          .in("id", apiKeyIds);

        if (apiKeys) {
          apiKeysMap = Object.fromEntries(apiKeys.map((k) => [k.id, k]));
        }
      }

      // Enrich activities with user and api_key data
      enrichedActivities = enrichedActivities.map((activity: any) => ({
        ...activity,
        user: activity.created_by_user
          ? usersMap[activity.created_by_user]
          : null,
        api_key: activity.created_by_api_key
          ? apiKeysMap[activity.created_by_api_key]
          : null,
      }));
    }

    return res.json({ activities: enrichedActivities, total: count });
  } catch (error) {
    console.error("Get activity log error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
