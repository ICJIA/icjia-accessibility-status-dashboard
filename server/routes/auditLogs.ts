/**
 * Audit Logs API Routes
 * Provides endpoints for retrieving audit logs
 */

import { Router } from "express";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/audit-logs
 * Get recent audit logs
 */
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Audit Logs API] Error fetching logs:", error);
      return res.status(500).json({ error: "Failed to fetch audit logs" });
    }

    console.log(`[Audit Logs API] Fetched ${logs?.length || 0} logs`);

    return res.json({ logs: logs || [] });
  } catch (error) {
    console.error("[Audit Logs API] Exception:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

