/**
 * @fileoverview Authentication Routes
 * Handles user authentication including login, logout, session management,
 * password changes, and initial setup.
 *
 * @module routes/auth
 */

import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { supabase } from "../utils/supabase.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { loginLimiter, sessionLimiter } from "../middleware/rateLimiter.js";
import {
  logFailedLogin,
  logSuccessfulLogin,
  logLogout,
} from "../utils/activityLogger.js";

/**
 * Express router for authentication endpoints
 * @type {express.Router}
 */
const router = Router();

// Check if initial setup is needed (admin password is blank)
router.get("/needs-setup", async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("password_hash")
      .eq("username", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking setup status:", error);
      return res.status(500).json({ error: "Failed to check setup status" });
    }

    // If no admin user exists or password is blank, setup is needed
    const needsSetup =
      !admin || admin.password_hash === "" || admin.password_hash === null;

    return res.json({ needsSetup });
  } catch (error) {
    console.error("Needs setup check error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", loginLimiter, sessionLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    console.log("Login attempt for username:", username);

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    console.log("User query result:", {
      user: user ? "found" : "not found",
      error,
    });

    if (error || !user) {
      console.log("User not found or error:", error);
      await logFailedLogin(username, "User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Comparing passwords");

    // Handle blank password for initial setup
    let passwordMatch = false;
    if (user.password_hash === "" || user.password_hash === null) {
      // Allow login with blank password only if password is blank in database
      passwordMatch = password === "";
      console.log(
        "Blank password authentication:",
        passwordMatch ? "success" : "failed"
      );
    } else {
      // Normal bcrypt comparison for non-blank passwords
      passwordMatch = await bcrypt.compare(password, user.password_hash);
      console.log(
        "Bcrypt password authentication:",
        passwordMatch ? "success" : "failed"
      );
    }

    if (!passwordMatch) {
      console.log("Password mismatch");
      await logFailedLogin(username, "Invalid password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Login successful for user:", username);

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    const { error: sessionError } = await supabase.from("sessions").insert([
      {
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      },
    ]);

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return res.status(500).json({ error: "Failed to create session" });
    }

    // Log successful login
    await logSuccessfulLogin(user.id, username);

    console.log(
      "[Login] Setting session cookie with token:",
      sessionToken.substring(0, 10) + "..."
    );
    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    console.log("[Login] Cookie set, response headers:", res.getHeaders());

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        must_change_password: user.must_change_password,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", requireAuth, async (req: AuthRequest, res) => {
  try {
    const sessionToken = req.cookies.session_token;

    if (sessionToken) {
      await supabase
        .from("sessions")
        .delete()
        .eq("session_token", sessionToken);
    }

    // Get user info for logging
    const { data: user } = await supabase
      .from("admin_users")
      .select("username")
      .eq("id", req.userId)
      .single();

    // Log the logout
    if (user) {
      await logLogout(req.userId, user.username);
    }

    res.clearCookie("session_token");
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/session", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, username, email, created_at, must_change_password")
      .eq("id", req.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Session check error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Note: currentPassword can be blank for initial setup, but newPassword cannot
    if (newPassword === undefined || newPassword === null) {
      return res.status(400).json({
        error: "New password is required",
      });
    }

    // Reject blank/empty passwords as new password
    if (newPassword.trim() === "") {
      return res.status(400).json({
        error: "Password cannot be blank. Please choose a secure password.",
      });
    }

    // Password validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });
    }

    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", req.userId)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify current password (handle blank passwords for initial setup)
    let passwordMatch = false;
    if (user.password_hash === "" || user.password_hash === null) {
      // For blank password in database, current password must also be blank
      passwordMatch = currentPassword === "" || currentPassword === undefined;
    } else {
      // Normal bcrypt comparison for non-blank passwords
      passwordMatch = await bcrypt.compare(
        currentPassword || "",
        user.password_hash
      );
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear must_change_password flag
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        password_hash: newPasswordHash,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.userId);

    if (updateError) {
      console.error("Password update error:", updateError);
      return res.status(500).json({ error: "Failed to update password" });
    }

    // Clear all sessions for this user (force re-login)
    await supabase.from("sessions").delete().eq("user_id", req.userId);

    // Clear the current session cookie
    res.clearCookie("session_token");

    console.log("Password changed successfully for user:", user.username);

    return res.json({
      message:
        "Password changed successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Initial setup endpoint - set password for admin user (only works if password is blank)
router.post("/initial-setup", loginLimiter, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    // Reject blank/empty passwords
    if (newPassword.trim() === "") {
      return res.status(400).json({
        error: "Password cannot be blank. Please choose a secure password.",
      });
    }

    // Password validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });
    }

    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Get admin user
    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", "admin")
      .maybeSingle();

    if (adminError || !admin) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    // Only allow initial setup if password is currently blank
    if (admin.password_hash !== "" && admin.password_hash !== null) {
      return res.status(403).json({
        error:
          "Initial setup has already been completed. Please use the login page.",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear must_change_password flag
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        password_hash: newPasswordHash,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", admin.id);

    if (updateError) {
      console.error("Initial setup password update error:", updateError);
      return res.status(500).json({ error: "Failed to set password" });
    }

    console.log("Initial setup completed - password set for admin user");

    return res.json({
      message: "Password set successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Initial setup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
