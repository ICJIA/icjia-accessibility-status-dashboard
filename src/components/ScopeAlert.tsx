/**
 * @fileoverview Scope Alert Component
 * Displays a red alert banner indicating the scope of the accessibility status site.
 * Shows that this site only tracks ICJIA websites, not other digital assets.
 *
 * @module components/ScopeAlert
 */

import { AlertTriangle } from "lucide-react";

/**
 * ScopeAlert Component
 *
 * Displays a prominent red alert banner at the top of pages indicating:
 * - This site shows accessibility status of ICJIA's websites only
 * - Does not show status of other digital assets
 *
 * Features:
 * - Always visible (cannot be dismissed)
 * - Appears on every page load and session
 * - Dark mode support
 * - Responsive design
 *
 * @component
 * @returns {React.ReactElement} The alert banner
 *
 * @example
 * <ScopeAlert />
 */
export function ScopeAlert() {
  return (
    <div className="bg-red-600 dark:bg-red-700 border-b-2 border-red-800 dark:border-red-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">
              Important: This ICJIA accessibility status site shows the status
              of
              <strong> ICJIA's websites only</strong>. It does not show the
              status of other digital assets including PDF files, Word files,
              Excel files, social media posts, and Constant Contact emails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
