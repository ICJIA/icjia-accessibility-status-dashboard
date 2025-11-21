/**
 * @fileoverview Type Definitions
 * TypeScript interfaces for all data models used throughout the application.
 *
 * @module types
 */

/**
 * Represents a website being tracked for accessibility
 * @typedef {Object} Site
 * @property {string} id - Unique site identifier
 * @property {string} title - Site title/name
 * @property {string} description - Site description
 * @property {string} url - Website URL
 * @property {string|null} sitemap_url - Optional sitemap URL
 * @property {string|null} documentation_url - Optional documentation URL
 * @property {number} axe_score - Current Axe accessibility score (0-100)
 * @property {number} lighthouse_score - Current Lighthouse score (0-100)
 * @property {string} axe_last_updated - Last Axe score update timestamp
 * @property {string} lighthouse_last_updated - Last Lighthouse score update timestamp
 * @property {number} [pages_total] - Total pages from most recent scan
 * @property {number} [pages_scanned] - Pages scanned in most recent scan
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */
export interface Site {
  id: string;
  title: string;
  description: string;
  url: string;
  sitemap_url: string | null;
  documentation_url: string | null;
  axe_score: number;
  lighthouse_score: number;
  axe_last_updated: string;
  lighthouse_last_updated: string;
  pages_total?: number;
  pages_scanned?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Historical record of accessibility scores
 * @typedef {Object} ScoreHistory
 * @property {string} id - Record identifier
 * @property {string} site_id - Associated site ID
 * @property {number} axe_score - Axe score at this point in time
 * @property {number} lighthouse_score - Lighthouse score at this point in time
 * @property {string} recorded_at - Timestamp of the recording
 */
export interface ScoreHistory {
  id: string;
  site_id: string;
  axe_score: number;
  lighthouse_score: number;
  recorded_at: string;
}

/**
 * Site with associated score history
 * @typedef {Object} SiteWithHistory
 * @extends Site
 * @property {ScoreHistory[]} [score_history] - Historical score records
 */
export interface SiteWithHistory extends Site {
  score_history?: ScoreHistory[];
}

/**
 * Represents a system user
 * @typedef {Object} User
 * @property {string} id - User identifier
 * @property {string} username - Username for login
 * @property {string} email - Email address
 * @property {boolean} [must_change_password] - Whether user must change password on next login
 * @property {string|null} created_by - Username of user who created this user
 * @property {string} created_at - Creation timestamp
 * @property {string} [updated_at] - Last update timestamp
 */
export interface User {
  id: string;
  username: string;
  email: string;
  must_change_password?: boolean;
  created_by: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Documentation content
 * @typedef {Object} Documentation
 * @property {string} id - Documentation identifier
 * @property {string} section_name - Section name
 * @property {string} content - Documentation content
 * @property {string} last_updated - Last update timestamp
 * @property {string|null} updated_by - Username of last updater
 * @property {number} version - Version number
 */
export interface Documentation {
  id: string;
  section_name: string;
  content: string;
  last_updated: string;
  updated_by: string | null;
  version: number;
}

/**
 * Authentication API response
 * @typedef {Object} AuthResponse
 * @property {User} user - Authenticated user
 */
export interface AuthResponse {
  user: User;
}

/**
 * Export format option
 * @typedef {Object} ExportFormat
 * @property {string} label - Display label
 * @property {'json'|'csv'|'markdown'|'pdf'} value - Format value
 */
export interface ExportFormat {
  label: string;
  value: "json" | "csv" | "markdown" | "pdf";
}

/**
 * Accessibility scan result
 * @typedef {Object} Scan
 * @property {string} id - Scan identifier
 * @property {string} site_id - Associated site ID
 * @property {'pending'|'running'|'in_progress'|'paused'|'completed'|'failed'|'cancelled'} status - Scan status
 * @property {'lighthouse'|'axe'|'both'} scan_type - Type of scan
 * @property {number|null} lighthouse_score - Lighthouse score (0-100)
 * @property {number|null} axe_score - Axe score (0-100)
 * @property {any|null} lighthouse_report - Lighthouse detailed report
 * @property {any|null} axe_report - Axe detailed report
 * @property {string|null} error_message - Error message if scan failed
 * @property {string|null} started_at - When scan started
 * @property {string|null} completed_at - When scan completed
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {number|null} pages_total - Total pages to scan (multi-page)
 * @property {number|null} pages_scanned - Pages scanned so far (multi-page)
 * @property {string|null} worst_page_url - URL of page with most violations (multi-page)
 * @property {number|null} worst_page_violation_count - Violation count on worst page (multi-page)
 * @property {any|null} worst_page_violations - Violations on worst page (multi-page)
 * @property {number|null} total_violations_sum - Total violations across all pages (multi-page)
 * @property {number|null} last_scanned_page_index - Index of last scanned page (multi-page)
 */
export interface Scan {
  id: string;
  site_id: string;
  status:
    | "pending"
    | "running"
    | "in_progress"
    | "paused"
    | "completed"
    | "failed"
    | "cancelled";
  scan_type: "lighthouse" | "axe" | "both";
  lighthouse_score: number | null;
  axe_score: number | null;
  lighthouse_report: any | null;
  axe_report: any | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  pages_total: number | null;
  pages_scanned: number | null;
  worst_page_url: string | null;
  worst_page_violation_count: number | null;
  worst_page_violations: any | null;
  total_violations_sum: number | null;
  last_scanned_page_index: number | null;
}

/**
 * Detailed accessibility violation from a scan
 * @typedef {Object} ScanViolation
 * @property {string} id - Violation identifier
 * @property {string} scan_id - Associated scan ID
 * @property {'axe'|'lighthouse'} violation_type - Type of violation
 * @property {string} rule_id - Rule identifier
 * @property {string} rule_name - Human-readable rule name
 * @property {string} description - Violation description
 * @property {'critical'|'serious'|'moderate'|'minor'} impact_level - Severity level
 * @property {'A'|'AA'|'AAA'} wcag_level - WCAG compliance level
 * @property {string} page_url - URL where violation was found
 * @property {string|null} element_selector - CSS selector of affected element
 * @property {number} element_count - Number of affected elements
 * @property {string|null} help_url - Link to documentation
 * @property {string|null} suggested_fix - Suggested remediation
 * @property {string} created_at - Creation timestamp
 */
export interface ScanViolation {
  id: string;
  scan_id: string;
  violation_type: "axe" | "lighthouse";
  rule_id: string;
  rule_name: string;
  description: string;
  impact_level: "critical" | "serious" | "moderate" | "minor";
  wcag_level: "A" | "AA" | "AAA";
  page_url: string;
  element_selector: string | null;
  element_count: number;
  help_url: string | null;
  suggested_fix: string | null;
  created_at: string;
}
