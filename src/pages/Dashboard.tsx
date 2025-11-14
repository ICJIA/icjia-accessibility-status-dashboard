/**
 * @fileoverview Dashboard Page
 * Main dashboard displaying all websites and their accessibility scores.
 * Shows aggregate metrics, compliance countdown, and site management options.
 *
 * @module pages/Dashboard
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { Site, ScoreHistory } from "../types";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { ScoreBadge } from "../components/ScoreBadge";
import { ComplianceCountdown } from "../components/ComplianceCountdown";
import { MiniTrendChart } from "../components/charts/MiniTrendChart";

/**
 * Dashboard Page Component
 *
 * Main dashboard showing:
 * - Compliance countdown to April 24, 2026
 * - Aggregate accessibility scores (Axe and Lighthouse)
 * - List of all websites with individual scores
 * - Score trends (improving/declining)
 * - Export functionality for reports
 * - Links to detailed site information
 * - Admin-only features (add site, manage users)
 *
 * @component
 * @returns {React.ReactElement} The dashboard page
 *
 * @example
 * <Route path="/dashboard" element={<Dashboard />} />
 */
export function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteHistories, setSiteHistories] = useState<
    Record<string, ScoreHistory[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "14d" | "30d">(
    "24h"
  );
  const { user } = useAuth();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const response = await api.sites.list();
      setSites(response.sites);

      // Load history for each site
      const histories: Record<string, ScoreHistory[]> = {};
      for (const site of response.sites) {
        try {
          const historyResponse = await api.sites.getHistory(site.id);
          histories[site.id] = historyResponse.history || [];
        } catch (error) {
          console.error(`Failed to load history for site ${site.id}:`, error);
          histories[site.id] = [];
        }
      }
      setSiteHistories(histories);
    } catch (error) {
      console.error("Failed to load sites:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeFilter = (range: string): Date => {
    const now = new Date();
    switch (range) {
      case "1h":
        return new Date(now.getTime() - 1 * 60 * 60 * 1000);
      case "6h":
        return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "14d":
        return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  const getTimeRangeLabel = (range: string): string => {
    switch (range) {
      case "1h":
        return "Last 1 Hour";
      case "6h":
        return "Last 6 Hours";
      case "24h":
        return "Last 24 Hours";
      case "7d":
        return "Last 7 Days";
      case "14d":
        return "Last 14 Days";
      case "30d":
        return "Last 30 Days";
      default:
        return "Last 7 Days";
    }
  };

  const filterHistoryByTimeRange = (
    history: ScoreHistory[]
  ): ScoreHistory[] => {
    const cutoffDate = getTimeRangeFilter(timeRange);
    return history.filter((h) => new Date(h.recorded_at) >= cutoffDate);
  };

  const hasEnoughDataForGraphs = (history: ScoreHistory[]): boolean => {
    // Require at least 3 days of data
    if (history.length < 3) return false;

    // Check if data spans at least 3 different days
    const uniqueDays = new Set(
      history.map((h) =>
        new Date(h.recorded_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      )
    );

    return uniqueDays.size >= 3;
  };

  const avgAxe =
    sites.length > 0
      ? Math.round(
          sites.reduce((sum, s) => sum + s.axe_score, 0) / sites.length
        )
      : 0;
  const avgLighthouse =
    sites.length > 0
      ? Math.round(
          sites.reduce((sum, s) => sum + s.lighthouse_score, 0) / sites.length
        )
      : 0;

  const handleExport = (format: string) => {
    const url = api.export.dashboard(format);
    window.open(url, "_blank");
    setShowExportMenu(false);
  };

  const getTrendIcon = (score: number) => {
    if (score >= 90)
      return (
        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
      );
    if (score >= 75)
      return <Minus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Accessibility Status Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tracking progress toward April 2026 compliance deadline
        </p>
      </div>

      {/* Compliance Countdown */}
      <ComplianceCountdown />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Total Sites
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {sites.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Avg Axe Score
          </h3>
          <div className="flex items-center space-x-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgAxe}
            </p>
            {getTrendIcon(avgAxe)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Avg Lighthouse Score
          </h3>
          <div className="flex items-center space-x-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgLighthouse}
            </p>
            {getTrendIcon(avgLighthouse)}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            All Sites
          </h2>
          <div className="flex flex-wrap gap-2">
            {(["24h", "7d", "14d", "30d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {getTimeRangeLabel(range)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-3">
          {user && (
            <Link
              to="/admin/sites/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Site</span>
            </Link>
          )}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Link
            key={site.id}
            to={`/sites/${site.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {site.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {site.description}
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Axe Score
                </span>
                <ScoreBadge score={site.axe_score} size="sm" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lighthouse Score
                </span>
                <ScoreBadge score={site.lighthouse_score} size="sm" />
              </div>

              {/* Accessibility Trend Chart */}
              {siteHistories[site.id] && siteHistories[site.id].length > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Accessibility Over Time
                  </p>
                  {hasEnoughDataForGraphs(siteHistories[site.id]) ? (
                    <MiniTrendChart
                      data={filterHistoryByTimeRange(
                        siteHistories[site.id]
                      ).map((h) => ({
                        date: new Date(h.recorded_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        ),
                        axe: h.axe_score,
                        lighthouse: h.lighthouse_score,
                      }))}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[120px] bg-gray-100 dark:bg-gray-800 rounded">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Not enough data (need 3+ days)
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Last audit date:{" "}
                  {site.updated_at
                    ? new Date(site.updated_at).toLocaleDateString() +
                      " " +
                      new Date(site.updated_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : new Date(site.axe_last_updated).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sites.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
            <div className="mb-4">
              <Plus className="h-12 w-12 text-blue-600 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Sites Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by adding your first website for accessibility
              scanning.
            </p>
            {user && (
              <Link
                to="/admin/sites/new"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Site</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
