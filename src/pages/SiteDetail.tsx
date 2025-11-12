/**
 * @fileoverview SiteDetail Page
 * Detailed view of a single website with accessibility scores, trends, and management options.
 *
 * @module pages/SiteDetail
 */

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Site, ScoreHistory, Scan } from "../types";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { ScoreBadge } from "../components/ScoreBadge";
import { LineChart } from "../components/charts/LineChart";
import { GaugeChart } from "../components/charts/GaugeChart";
import { ScoreTrendChart } from "../components/charts/ScoreTrendChart";
import { ScanResults } from "../components/ScanResults";

/**
 * Represents an API payload
 * @typedef {Object} ApiPayload
 * @property {string} id - Payload UUID
 * @property {string} payload_id - Payload ID
 * @property {any} payload - Payload data
 * @property {number} payload_size - Size in bytes
 * @property {string|null} description - Optional description
 * @property {string} created_at - Creation timestamp
 * @property {string|null} created_by_user - Creator username
 * @property {string|null} api_key_id - Associated API key ID
 * @property {Object|null} admin_users - Associated admin user
 * @property {Object|null} api_keys - Associated API key
 */
interface ApiPayload {
  id: string;
  payload_id: string;
  payload: any;
  payload_size: number;
  description: string | null;
  created_at: string;
  created_by_user: string | null;
  api_key_id: string | null;
  admin_users: { username: string; email: string } | null;
  api_keys: { key_name: string; key_prefix: string; key_suffix: string } | null;
}

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
  const [payloads, setPayloads] = useState<ApiPayload[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scansLoading, setScansLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPayloads, setShowPayloads] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadSite();
      loadHistory();
      loadPayloads();
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

  const loadPayloads = async () => {
    try {
      const response = await api.sites.getPayloads(id!);
      setPayloads(response.payloads);
    } catch (error) {
      console.error("Failed to load payloads:", error);
    }
  };

  const loadScans = async () => {
    try {
      setScansLoading(true);
      const response = await api.sites.getScans(id!);
      setScans(response.scans);
    } catch (error) {
      console.error("Failed to load scans:", error);
    } finally {
      setScansLoading(false);
    }
  };

  const handleExport = (format: string) => {
    const url = api.export.site(id!, format);
    window.open(url, "_blank");
    setShowExportMenu(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDelete = async () => {
    try {
      await api.sites.delete(id!);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete site:", error);
    }
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

  const april2026 = new Date("2026-04-01");
  const today = new Date();
  const daysRemaining = Math.ceil(
    (april2026.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const chartData = history.map((h) => ({
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
            />
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <GaugeChart
              score={site.lighthouse_score}
              label="Lighthouse Accessibility Score"
            />
          </div>
        </div>

        {history.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Score Progression Over Time
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
              <LineChart data={chartData} />
            </div>

            {/* Individual Score Trend Charts */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              Score Improvements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <ScoreTrendChart
                  data={history.map((h) => ({
                    date: new Date(h.recorded_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                    score: h.axe_score,
                  }))}
                  label="Axe Accessibility Score"
                  color="blue"
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <ScoreTrendChart
                  data={history.map((h) => ({
                    date: new Date(h.recorded_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                    score: h.lighthouse_score,
                  }))}
                  label="Lighthouse Accessibility Score"
                  color="green"
                />
              </div>
            </div>

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
            {site.updated_at && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last JSON upload:{" "}
                {new Date(site.updated_at).toLocaleDateString()} at{" "}
                {new Date(site.updated_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Axe Score
              </p>
              <ScoreBadge score={site.axe_score} size="lg" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Score date:{" "}
                {new Date(site.axe_last_updated).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Lighthouse Score
              </p>
              <ScoreBadge score={site.lighthouse_score} size="lg" />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Score date:{" "}
                {new Date(site.lighthouse_last_updated).toLocaleDateString()}
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

        {/* Scan Results Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Accessibility Scans ({scans.length})
          </h3>
          <ScanResults scans={scans} loading={scansLoading} />
        </div>

        {/* API Upload History Section */}
        {payloads.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                API Upload History ({payloads.length})
              </h3>
              <button
                onClick={() => setShowPayloads(!showPayloads)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showPayloads ? "Hide" : "Show"} History
              </button>
            </div>

            {showPayloads && (
              <div className="space-y-3">
                {payloads.map((payload) => (
                  <div
                    key={payload.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/payloads/${payload.id}`}
                            className="font-mono text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {payload.payload_id}
                          </Link>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({formatFileSize(payload.payload_size)})
                          </span>
                        </div>
                        {payload.description && (
                          <p className="text-sm text-gray-900 dark:text-white mt-2 font-medium">
                            {payload.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(payload.created_at).toLocaleString()}
                        </p>
                        {payload.api_keys && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            API Key: {payload.api_keys.key_name} (
                            {payload.api_keys.key_prefix}...
                            {payload.api_keys.key_suffix})
                          </p>
                        )}
                        {payload.admin_users && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            By: {payload.admin_users.username}
                          </p>
                        )}
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <strong>Scores:</strong> Axe:{" "}
                          {payload.payload.axe_score}, Lighthouse:{" "}
                          {payload.payload.lighthouse_score}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showPayloads && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click "Show History" to view all API uploads for this site
              </p>
            )}
          </div>
        )}
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
