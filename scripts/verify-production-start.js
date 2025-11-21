#!/usr/bin/env node

/**
 * Production Start Verification Script
 * Displays build status and port information after yarn start
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log("");
  log(`${"=".repeat(70)}`, "cyan");
  log(`  ${title}`, "bright");
  log(`${"=".repeat(70)}`, "cyan");
}

function checkBuildStatus() {
  section("BUILD STATUS");

  const distPath = path.join(process.cwd(), "dist");

  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    const indexHtml = fs.existsSync(path.join(distPath, "index.html"));
    const assetsDir = fs.existsSync(path.join(distPath, "assets"));

    log("✓ dist/ directory exists", "green");
    log(`  Files: ${files.length} items`, "green");

    if (indexHtml) {
      const stats = fs.statSync(path.join(distPath, "index.html"));
      log(`  ✓ index.html (${(stats.size / 1024).toFixed(2)} KB)`, "green");
    }

    if (assetsDir) {
      const assetFiles = fs.readdirSync(path.join(distPath, "assets"));
      log(`  ✓ assets/ (${assetFiles.length} files)`, "green");
    }
  } else {
    log("✗ dist/ directory not found", "yellow");
  }
}

function checkPorts() {
  section("PORTS & ACCESS INFORMATION");

  log(
    "┌─────────────────────────────────────────────────────────────────┐",
    "cyan"
  );
  log(
    "│                                                                 │",
    "cyan"
  );
  log(
    "│  BACKEND API                                                    │",
    "bright"
  );
  log(
    "│  ├─ Port: 3001                                                 │",
    "green"
  );
  log(
    "│  ├─ Status: Managed by PM2                                     │",
    "green"
  );
  log(
    "│  ├─ URL: http://localhost:3001                                 │",
    "green"
  );
  log(
    "│  └─ Health Check: curl http://localhost:3001/api/health        │",
    "cyan"
  );
  log(
    "│                                                                 │",
    "cyan"
  );
  log(
    "│  FRONTEND                                                       │",
    "bright"
  );
  log(
    "│  ├─ Development: http://localhost:5173 (Vite dev server)       │",
    "green"
  );
  log(
    "│  ├─ Production: Served by Nginx (port 80/443)                  │",
    "green"
  );
  log(
    "│  ├─ Static Files: dist/ directory                              │",
    "green"
  );
  log(
    "│  └─ Production URL: http://your-domain.com                     │",
    "cyan"
  );
  log(
    "│                                                                 │",
    "cyan"
  );
  log(
    "└─────────────────────────────────────────────────────────────────┘",
    "cyan"
  );
}

function checkPM2Status() {
  section("PM2 SERVICES");

  log("To verify PM2 services are running:", "bright");
  log("  pm2 status", "cyan");
  log("", "reset");
  log("Expected output:", "bright");
  log(
    "  ┌─────────────────────────────┬─────┬─────────┬──────┬────────┐",
    "yellow"
  );
  log(
    "  │ id │ name                    │ mode│ status  │ ↺    │ uptime │",
    "yellow"
  );
  log(
    "  ├─────────────────────────────┼─────┼─────────┼──────┼────────┤",
    "yellow"
  );
  log(
    "  │ 0  │ icjia-accessibility-backend │ fork│ online  │ 0    │ 1m     │",
    "yellow"
  );
  log(
    "  └─────────────────────────────┴─────┴─────────┴──────┴────────┘",
    "yellow"
  );
}

function checkLogs() {
  section("VIEWING LOGS");

  log("Real-time logs from all services:", "bright");
  log("  pm2 logs", "cyan");
  log("", "reset");
  log("Logs from specific service:", "bright");
  log("  pm2 logs icjia-accessibility-backend", "cyan");
  log("", "reset");
  log("Log files:", "bright");
  log("  ./logs/backend-out.log", "cyan");
  log("  ./logs/backend-error.log", "cyan");
}

function testEndpoints() {
  section("TESTING ENDPOINTS");

  log("Test backend health:", "bright");
  log("  curl http://localhost:3001/api/health", "cyan");
  log("", "reset");
  log("Expected response:", "bright");
  log('  {"status":"ok"}', "yellow");
  log("", "reset");
  log("Check if port 3001 is in use:", "bright");
  log("  lsof -i :3001", "cyan");
}

function quickCommands() {
  section("QUICK COMMANDS");

  log("View status:        ", "bright");
  log("  pm2 status", "cyan");
  log("", "reset");
  log("View logs:          ", "bright");
  log("  pm2 logs", "cyan");
  log("", "reset");
  log("Monitor in real-time:", "bright");
  log("  pm2 monit", "cyan");
  log("", "reset");
  log("Stop services:      ", "bright");
  log("  pm2 stop ecosystem.config.cjs", "cyan");
  log("", "reset");
  log("Restart services:   ", "bright");
  log("  pm2 restart ecosystem.config.cjs", "cyan");
}

function main() {
  console.clear();

  log(
    "╔════════════════════════════════════════════════════════════════════╗",
    "bright"
  );
  log(
    "║                                                                    ║",
    "bright"
  );
  log(
    "║        ICJIA Accessibility Status - Production Start Verification ║",
    "bright"
  );
  log(
    "║                                                                    ║",
    "bright"
  );
  log(
    "╚════════════════════════════════════════════════════════════════════╝",
    "bright"
  );

  checkBuildStatus();
  checkPorts();
  checkPM2Status();
  checkLogs();
  testEndpoints();
  quickCommands();

  section("NEXT STEPS");
  log("1. Verify PM2 services are running:", "bright");
  log("   pm2 status", "cyan");
  log("", "reset");
  log("2. Test the backend API:", "bright");
  log("   curl http://localhost:3001/api/health", "cyan");
  log("", "reset");
  log("3. View logs if there are issues:", "bright");
  log("   pm2 logs", "cyan");
  log("", "reset");
  log("4. Setup auto-start on reboot (optional):", "bright");
  log("   pm2 startup && pm2 save", "cyan");

  console.log("");
  log("═".repeat(70), "cyan");
  console.log("");
}

main();
