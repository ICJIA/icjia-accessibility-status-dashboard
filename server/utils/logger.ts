/**
 * @fileoverview Logger Utility - Color-coded console logging for backend
 * Provides structured, easy-to-read logging with color coding for different log levels
 */

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

/**
 * Format timestamp for logging
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Logger utility with color-coded output
 */
export const logger = {
  /**
   * Info log - Blue
   */
  info: (module: string, message: string, data?: any) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.cyan}[${timestamp}]${colors.reset} ${colors.blue}ℹ INFO${colors.reset}`;
    const moduleName = `${colors.bright}${module}${colors.reset}`;
    console.log(`${prefix} ${moduleName}: ${message}`, data || "");
  },

  /**
   * Success log - Green
   */
  success: (module: string, message: string, data?: any) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.cyan}[${timestamp}]${colors.reset} ${colors.green}✓ SUCCESS${colors.reset}`;
    const moduleName = `${colors.bright}${module}${colors.reset}`;
    console.log(`${prefix} ${moduleName}: ${message}`, data || "");
  },

  /**
   * Warning log - Yellow
   */
  warn: (module: string, message: string, data?: any) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.cyan}[${timestamp}]${colors.reset} ${colors.yellow}⚠ WARN${colors.reset}`;
    const moduleName = `${colors.bright}${module}${colors.reset}`;
    console.warn(`${prefix} ${moduleName}: ${message}`, data || "");
  },

  /**
   * Error log - Red
   */
  error: (module: string, message: string, error?: any) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.cyan}[${timestamp}]${colors.reset} ${colors.red}✗ ERROR${colors.reset}`;
    const moduleName = `${colors.bright}${module}${colors.reset}`;
    if (error instanceof Error) {
      console.error(
        `${prefix} ${moduleName}: ${message}`,
        `\n${colors.red}${error.message}${colors.reset}`,
        error.stack ? `\n${error.stack}` : ""
      );
    } else {
      console.error(`${prefix} ${moduleName}: ${message}`, error || "");
    }
  },

  /**
   * Debug log - Magenta
   */
  debug: (module: string, message: string, data?: any) => {
    if (process.env.DEBUG !== "true") return;
    const timestamp = getTimestamp();
    const prefix = `${colors.cyan}[${timestamp}]${colors.reset} ${colors.magenta}🔍 DEBUG${colors.reset}`;
    const moduleName = `${colors.bright}${module}${colors.reset}`;
    console.log(`${prefix} ${moduleName}: ${message}`, data || "");
  },

  /**
   * Scan progress log - Cyan
   */
  scan: (scanId: string, message: string) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.cyan}[${timestamp}]${colors.reset} ${colors.cyan}📊 SCAN${colors.reset}`;
    const id = `${colors.bright}${scanId.substring(0, 8)}...${colors.reset}`;
    console.log(`${prefix} ${id}: ${message}`);
  },

  /**
   * Section header - Bright white on blue background
   */
  section: (title: string) => {
    const timestamp = getTimestamp();
    const padding = "=".repeat(Math.max(0, 60 - title.length - 12));
    console.log(
      `\n${colors.cyan}[${timestamp}]${colors.reset} ${colors.bgBlue}${colors.white}${colors.bright} ${title} ${padding}${colors.reset}\n`
    );
  },

  /**
   * Divider line
   */
  divider: () => {
    console.log(`${colors.dim}${"─".repeat(80)}${colors.reset}`);
  },
};

