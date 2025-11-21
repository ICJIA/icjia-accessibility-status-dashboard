/**
 * @fileoverview Dashboard Page
 * Public landing page displaying all websites and their current accessibility scores.
 * Shows current Axe and Lighthouse scores for each site.
 *
 * @module pages/Dashboard
 */

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Site } from "../types";
import { api } from "../lib/api";
import { ScoreBadge } from "../components/ScoreBadge";
import { ComplianceCountdown } from "../components/ComplianceCountdown";
import { ScopeAlert } from "../components/ScopeAlert";
import { ToolInfo } from "../components/ToolInfo";

/**
 * Dashboard Page Component
 *
 * Public landing page showing:
 * - List of all websites with current accessibility scores
 * - Current Axe score for each site
 * - Current Lighthouse score for each site
 * - Site names and descriptions
 * - Export functionality for reports
 *
 * @component
 * @returns {React.ReactElement} The dashboard page
 *
 * @example
 * <Route path="/" element={<Dashboard />} />
 */
export function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const response = await api.sites.list();
      setSites(response.sites);
    } catch (error) {
      console.error("Failed to load sites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    const url = api.export.dashboard(format);
    window.open(url, "_blank");
    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <ScopeAlert />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Accessibility Status
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Current accessibility scores for all websites
          </p>
        </div>

        {/* Compliance Countdown */}
        <ComplianceCountdown />

        <div className="mb-6 flex justify-end">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button
                  onClick={() => handleExport("json")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport("markdown")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as Markdown
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div
              key={site.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {site.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {site.url}
              </p>
              {site.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {site.description}
                </p>
              )}

              {/* Pages Scanned Indicator */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {site.pages_total && site.pages_total > 0
                    ? `${site.pages_scanned || 0} of ${
                        site.pages_total
                      } pages scanned`
                    : "Not yet scanned"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Axe Score
                    </span>
                    <ToolInfo tool="axe" />
                  </div>
                  <ScoreBadge score={site.axe_score} size="sm" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Lighthouse Score
                    </span>
                    <ToolInfo tool="lighthouse" />
                  </div>
                  <ScoreBadge score={site.lighthouse_score} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {sites.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Sites Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No websites have been added yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
