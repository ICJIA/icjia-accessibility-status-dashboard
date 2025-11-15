/**
 * @fileoverview User Management Routes
 * Handles user CRUD operations, password resets, and user administration.
 * All routes require authentication.
 *
 * @module routes/users
 */

import { Router } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

/**
 * Express router for user management endpoints
 * @type {express.Router}
 */
const router = Router();

/**
 * Password validation helper
 */
function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password || password.trim() === "") {
    return { valid: false, error: "Password cannot be blank" };
  }

  if (password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return {
      valid: false,
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    };
  }

  return { valid: true };
}

/**
 * GET /api/users
 * List all admin users (for authenticated admin users)
 * Includes a flag indicating which user is the primary admin (first created)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("admin_users")
      .select("id, username, email, created_by, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    // Mark the first user (oldest created_at) as primary admin
    const usersWithPrimaryFlag = users.map((user, index) => ({
      ...user,
      is_primary_admin: index === 0 && users.length > 0,
    }));

    // Return in reverse order (newest first) for display
    return res.json({ users: usersWithPrimaryFlag.reverse() });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/users
 * Create a new admin user (for authenticated admin users)
 */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from("admin_users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password with bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const { data: newUser, error } = await supabase
      .from("admin_users")
      .insert([
        {
          username,
          email,
          password_hash: passwordHash,
          created_by: req.userId,
          must_change_password: false,
        },
      ])
      .select("id, username, email, created_at")
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }

    console.log(
      `New user created: ${username} by admin user ID: ${req.userId}`
    );

    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/users/:id
 * Update a user's email (for authenticated admin users)
 * Admins can update any user's email
 */
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if email already exists (for a different user)
    const { data: existingEmail } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .neq("id", id)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const { data: updatedUser, error } = await supabase
      .from("admin_users")
      .update({ email, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, username, email, updated_at")
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: "Failed to update user" });
    }

    console.log(`User ${id} email updated by admin user ID: ${req.userId}`);

    return res.json({ user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user (for authenticated admin users)
 * Hard delete - user is permanently removed from database
 * Cannot delete your own account or the primary admin user
 */
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account" });
    }

    // Get all users to identify the primary admin (oldest created_at)
    const { data: allUsers, error: fetchError } = await supabase
      .from("admin_users")
      .select("id, username, created_at")
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching users:", fetchError);
      return res.status(500).json({ error: "Failed to verify user status" });
    }

    // The primary admin is the first user (oldest created_at)
    const primaryAdminId =
      allUsers && allUsers.length > 0 ? allUsers[0].id : null;

    // Prevent deletion of primary admin user
    if (id === primaryAdminId) {
      return res.status(403).json({
        error: "Cannot delete primary admin user",
        message:
          "The primary admin account cannot be deleted to prevent system lockout. If you need to remove this user, first create another admin account and then delete this one.",
      });
    }

    // Get user info before deletion for logging
    const { data: userToDelete } = await supabase
      .from("admin_users")
      .select("username")
      .eq("id", id)
      .single();

    // Hard delete from database
    const { error } = await supabase.from("admin_users").delete().eq("id", id);

    if (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ error: "Failed to delete user" });
    }

    console.log(
      `User ${userToDelete?.username} (${id}) deleted by admin user ID: ${req.userId}`
    );

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/users/:id/reset-password
 * Reset a user's password (for authenticated admin users)
 * Admins can reset any user's password (except their own - they should use change-password)
 */
router.post(
  "/:id/reset-password",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ error: "New password is required" });
      }

      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.error });
      }

      // Get user info for logging
      const { data: user } = await supabase
        .from("admin_users")
        .select("username")
        .eq("id", id)
        .single();

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Hash new password with bcrypt (10 salt rounds)
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: passwordHash,
          must_change_password: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error resetting password:", updateError);
        return res.status(500).json({ error: "Failed to reset password" });
      }

      // Clear all sessions for this user (force re-login)
      await supabase.from("sessions").delete().eq("user_id", id);

      console.log(
        `Password reset for user ${user.username} (${id}) by admin user ID: ${req.userId}`
      );

      return res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
