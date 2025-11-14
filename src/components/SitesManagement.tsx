/**
 * @fileoverview Sites Management Component
 * Displays a table of all sites with edit/delete actions, scores, and scan counts.
 *
 * @module components/SitesManagement
 */

import { useState, useEffect } from "react";
import { Edit2, Trash2, AlertCircle, Database, Play } from "lucide-react";
import { Site } from "../types";
import { api } from "../lib/api";
import { ScoreBadge } from "./ScoreBadge";

interface SitesManagementProps {
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
  onRefresh: () => void;
}

export function SitesManagement({
  onEdit,
  onDelete,
  onRefresh,
}: SitesManagementProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanCounts, setScanCounts] = useState<Record<string, number>>({});
  const [clearDataSite, setClearDataSite] = useState<Site | null>(null);
  const [clearDataConfirm, setClearDataConfirm] = useState("");
  const [clearingData, setClearingData] = useState(false);
  const [scanningSites, setScanningSites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const response = await api.sites.list();
      setSites(response.sites || []);

      // Load scan counts for each site
      const counts: Record<string, number> = {};
      for (const site of response.sites || []) {
        try {
          const scansResponse = await api.sites.getScans(site.id);
          counts[site.id] = (scansResponse.scans || []).length;
        } catch (error) {
          console.error(`Failed to load scans for site ${site.id}:`, error);
          counts[site.id] = 0;
        }
      }
      setScanCounts(counts);
    } catch (error) {
      console.error("Failed to load sites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScan = async (site: Site) => {
    try {
      setScanningSites((prev) => new Set([...prev, site.id]));
      await api.scans.trigger(site.id, "both");
      // Scan triggered successfully, will be logged in activity log
    } catch (error) {
      console.error("Failed to trigger scan:", error);
      alert("Failed to trigger scan");
    } finally {
      setScanningSites((prev) => {
        const next = new Set(prev);
        next.delete(site.id);
        return next;
      });
    }
  };

  const handleClearData = async () => {
    if (!clearDataSite) return;
    if (clearDataConfirm !== "CLEAR DATA") {
      alert('Please type "CLEAR DATA" to confirm');
      return;
    }

    try {
      setClearingData(true);
      // Call API to clear all scans and history for this site
      await fetch(`/api/sites/${clearDataSite.id}/clear-data`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      // Refresh the sites list
      await loadSites();
      setClearDataSite(null);
      setClearDataConfirm("");
      alert("Site data cleared successfully");
    } catch (error) {
      console.error("Failed to clear site data:", error);
      alert("Failed to clear site data");
    } finally {
      setClearingData(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading sites...</p>
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">No sites yet.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Click "Add Site" to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                Site Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                URL
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                Axe Score
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                Lighthouse Score
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                Scans Run
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sites.map((site) => (
              <tr
                key={site.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                  {site.title}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-xs">
                  {site.url}
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreBadge score={site.axe_score} size="sm" />
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreBadge score={site.lighthouse_score} size="sm" />
                </td>
                <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                  {scanCounts[site.id] || 0}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunScan(site)}
                      disabled={scanningSites.has(site.id)}
                      className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      title="Run both Axe and Lighthouse scans"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(site)}
                      className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="Edit site"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setClearDataSite(site)}
                      className="p-1 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                      title="Clear all data for this site"
                    >
                      <Database className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(site)}
                      className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Delete site"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Clear Data Confirmation Modal */}
      {clearDataSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Clear Site Data
              </h2>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This will permanently delete all scans and historical data for{" "}
              <strong>{clearDataSite.title}</strong>. This action cannot be
              undone.
            </p>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3 mb-4">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                To confirm, type <strong>"CLEAR DATA"</strong> below:
              </p>
            </div>

            <input
              type="text"
              value={clearDataConfirm}
              onChange={(e) => setClearDataConfirm(e.target.value)}
              placeholder='Type "CLEAR DATA" to confirm'
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setClearDataSite(null);
                  setClearDataConfirm("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                disabled={clearingData || clearDataConfirm !== "CLEAR DATA"}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {clearingData ? "Clearing..." : "Clear Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
