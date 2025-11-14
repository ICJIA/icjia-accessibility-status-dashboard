/**
 * @fileoverview SiteDetail Page
 * Detailed view of a single website with accessibility scores, trends, and management options.
 *
 * @module pages/SiteDetail
 */

import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Edit,
  Trash2,
  TrendingUp,
  Play,
} from "lucide-react";
import { Site, ScoreHistory, Scan } from "../types";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { ScoreBadge } from "../components/ScoreBadge";
import { LineChart } from "../components/charts/LineChart";
import { GaugeChart } from "../components/charts/GaugeChart";
import { ScoreTrendChart } from "../components/charts/ScoreTrendChart";
import { ScanResults } from "../components/ScanResults";
import { ScanStatusIndicator } from "../components/ScanStatusIndicator";
import { getDaysRemaining } from "../utils/countdownUtils";

/**
 * SiteDetail Page Component
 *
 * Displays comprehensive information about a specific website including:
 * - Current Axe and Lighthouse accessibility scores
 * - Score trends over time with charts
 * - Gauge charts for visual score representation
 * - API payloads and submission history
 * - Site management options (edit, delete)
 * - Export functionality
 * - Admin-only features
 *
 * @component
 * @returns {React.ReactElement} The site detail page
 *
 * @example
 * <Route path="/sites/:id" element={<SiteDetail />} />
 */
export function SiteDetail() {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scansLoading, setScansLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRunningScans, setIsRunningScans] = useState(false);
  const [scanType, setScanType] = useState<"lighthouse" | "axe" | "both">(
    "both"
  );
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "14d" | "30d">(
    "24h"
  );
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadSite();
      loadHistory();
      loadScans();
    }
  }, [id]);

  const loadSite = async () => {
    try {
      const response = await api.sites.get(id!);
      setSite(response.site);
    } catch (error) {
      console.error("Failed to load site:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.sites.getHistory(id!);
      setHistory(response.history);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const loadScans = async () => {
    try {
      setScansLoading(true);
      const response = await api.sites.getScans(id!);
      setScans(response.scans);

      // Check if all scans are complete - if so, stop polling
      if (response.scans && response.scans.length > 0) {
        const allComplete = response.scans.every(
          (scan) => scan.status === "completed" || scan.status === "failed"
        );
        if (allComplete && pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setIsRunningScans(false);

          // Refresh site data and history when scans complete
          await loadSite();
          await loadHistory();
        }
      }
    } catch (error) {
      console.error("Failed to load scans:", error);
    } finally {
      setScansLoading(false);
    }
  };

  const handleRunScan = async () => {
    try {
      setIsRunningScans(true);
      const response = await api.scans.trigger(id!, scanType);
      console.log("Scan triggered:", response.scan);

      // Add new scan to the list
      setScans([response.scan, ...scans]);

      // Start polling for updates
      startPolling();
    } catch (error) {
      console.error("Failed to trigger scan:", error);
      setIsRunningScans(false);
    }
  };

  const startPolling = () => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll every 2 seconds
    pollIntervalRef.current = setInterval(() => {
      loadScans();
    }, 2000);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleExport = (format: string) => {
    const url = api.export.site(id!, format);
    window.open(url, "_blank");
    setShowExportMenu(false);
  };

  const handleDelete = async () => {
    try {
      await api.sites.delete(id!);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete site:", error);
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
        return "Last 24 Hours";
    }
  };

  const hasEnoughDataForGraphs = (historyData: ScoreHistory[]): boolean => {
    // Require at least 3 days of data
    if (historyData.length < 3) return false;

    // Check if data spans at least 3 different days
    const uniqueDays = new Set(
      historyData.map((h) =>
        new Date(h.recorded_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      )
    );

    return uniqueDays.size >= 3;
  };

  const filterHistoryByTimeRange = (hist: ScoreHistory[]): ScoreHistory[] => {
    const cutoffDate = getTimeRangeFilter(timeRange);
    return hist.filter((h) => new Date(h.recorded_at) >= cutoffDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Site not found
        </p>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();

  const filteredHistory = filterHistoryByTimeRange(history);
  const chartData = filteredHistory.map((h) => ({
    date: new Date(h.recorded_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    axe: h.axe_score,
    lighthouse: h.lighthouse_score,
  }));

  const firstHistory = history.length > 0 ? history[0] : null;
  const axeImprovement = firstHistory
    ? site.axe_score - firstHistory.axe_score
    : 0;
  const lighthouseImprovement = firstHistory
    ? site.lighthouse_score - firstHistory.lighthouse_score
    : 0;

  // Get the last completed scan for each type
  const getLastScanTime = (scanType: "lighthouse" | "axe") => {
    const completedScans = scans.filter(
      (scan) =>
        scan.status === "completed" && scan[`${scanType}_score`] !== null
    );
    if (completedScans.length === 0) return null;
    return completedScans[0].completed_at || completedScans[0].created_at;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {site.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {site.description}
            </p>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{site.url}</span>
            </a>
            {site.documentation_url && (
              <a
                href={site.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Documentation</span>
              </a>
            )}
            {site.sitemap_url && (
              <a
                href={site.sitemap_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Sitemap</span>
              </a>
            )}
          </div>
          <div className="flex space-x-3">
            {user && (
              <>
                <Link
                  to={`/admin/sites/${id}/edit`}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <GaugeChart
              score={site.axe_score}
              label="Axe Accessibility Score"
              subtitle={
                getLastScanTime("axe")
                  ? `Last scan: ${new Date(
                      getLastScanTime("axe")!
                    ).toLocaleDateString()} at ${new Date(
                      getLastScanTime("axe")!
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "No scans yet"
              }
            />
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <GaugeChart
              score={site.lighthouse_score}
              label="Lighthouse Accessibility Score"
              subtitle={
                getLastScanTime("lighthouse")
                  ? `Last scan: ${new Date(
                      getLastScanTime("lighthouse")!
                    ).toLocaleDateString()} at ${new Date(
                      getLastScanTime("lighthouse")!
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "No scans yet"
              }
            />
          </div>
        </div>

        {history.length > 0 && (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Score Progression Over Time
              </h3>
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
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
              {hasEnoughDataForGraphs(history) ? (
                <LineChart data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-gray-500 dark:text-gray-400">
                    Not enough data (need 3+ days)
                  </p>
                </div>
              )}
            </div>

            {/* Individual Score Trend Charts */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              Score Improvements
            </h3>
            {hasEnoughDataForGraphs(history) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <ScoreTrendChart
                    data={filteredHistory.map((h) => ({
                      date: new Date(h.recorded_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      ),
                      score: h.axe_score,
                    }))}
                    label="Axe Accessibility Score"
                    color="blue"
                  />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <ScoreTrendChart
                    data={filteredHistory.map((h) => ({
                      date: new Date(h.recorded_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      ),
                      score: h.lighthouse_score,
                    }))}
                    label="Lighthouse Accessibility Score"
                    color="green"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6 flex items-center justify-center h-[300px]">
                <p className="text-gray-500 dark:text-gray-400">
                  Not enough data (need 3+ days)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Axe Improvement
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {axeImprovement > 0 ? "+" : ""}
                  {axeImprovement} points
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-300">
                    Lighthouse Improvement
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {lighthouseImprovement > 0 ? "+" : ""}
                  {lighthouseImprovement} points
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                  Days Until April 2026
                </div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {daysRemaining} days
                </p>
              </div>
            </div>
          </>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Status
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Axe Score
              </p>
              <ScoreBadge score={site.axe_score} size="lg" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Last scan:{" "}
                {getLastScanTime("axe")
                  ? new Date(getLastScanTime("axe")!).toLocaleDateString() +
                    " at " +
                    new Date(getLastScanTime("axe")!).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Lighthouse Score
              </p>
              <ScoreBadge score={site.lighthouse_score} size="lg" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Last scan:{" "}
                {getLastScanTime("lighthouse")
                  ? new Date(
                      getLastScanTime("lighthouse")!
                    ).toLocaleDateString() +
                    " at " +
                    new Date(getLastScanTime("lighthouse")!).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "Never"}
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{history.length}</strong> historical record
                {history.length !== 1 ? "s" : ""} tracked
              </p>
            </div>
          )}
        </div>

        {/* Real-time Scan Status Indicator */}
        <ScanStatusIndicator scans={scans} isRunning={isRunningScans} />

        {/* Scan Results Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Accessibility Scans ({scans.length})
            </h3>
            {user && (
              <div className="flex items-center space-x-3">
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value as any)}
                  disabled={isRunningScans}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                >
                  <option value="both">Both (Lighthouse + Axe)</option>
                  <option value="lighthouse">Lighthouse Only</option>
                  <option value="axe">Axe Only</option>
                </select>
                <button
                  onClick={handleRunScan}
                  disabled={isRunningScans}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  <span>{isRunningScans ? "Running..." : "Run Scan"}</span>
                </button>
              </div>
            )}
          </div>
          <ScanResults scans={scans} loading={scansLoading} siteId={id} />
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{site.title}"? This action cannot
              be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
