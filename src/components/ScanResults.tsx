/**
 * @fileoverview ScanResults Component
 * Displays accessibility scan results with Lighthouse and Axe summaries.
 *
 * @module components/ScanResults
 */

import { Scan } from "../types";
import { ScoreBadge } from "./ScoreBadge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface ScanResultsProps {
  scans: Scan[];
  loading?: boolean;
}

/**
 * ScanResults Component
 *
 * Displays scan results with:
 * - Lighthouse summary if available
 * - Axe summary if available
 * - Score and "no summary" message for API uploads
 * - Status indicators (pending, running, completed, failed)
 *
 * @component
 * @param {ScanResultsProps} props - Component props
 * @param {Scan[]} props.scans - Array of scan results
 * @param {boolean} [props.loading=false] - Loading state
 * @returns {React.ReactElement} The scan results component
 */
export function ScanResults({ scans, loading = false }: ScanResultsProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Loading scan results...</p>
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No scans available yet.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "running":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "failed":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "running":
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <div
          key={scan.id}
          className={`border rounded-lg p-6 ${getStatusColor(scan.status)}`}
        >
          {/* Header with status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(scan.status)}
              <span className="font-semibold text-gray-900 dark:text-white capitalize">
                {scan.status}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(scan.created_at).toLocaleString()}
            </span>
          </div>

          {/* Error message if failed */}
          {scan.status === "failed" && scan.error_message && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-800 dark:text-red-200 text-sm">
              {scan.error_message}
            </div>
          )}

          {/* Scores and Reports */}
          {scan.status === "completed" && (
            <div className="space-y-4">
              {/* Lighthouse Result */}
              {scan.lighthouse_score !== null && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Lighthouse Accessibility Score
                  </h4>
                  <div className="flex items-center space-x-4 mb-3">
                    <ScoreBadge score={scan.lighthouse_score} size="lg" />
                  </div>
                  {scan.lighthouse_report ? (
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                      <p className="font-medium mb-2">Summary:</p>
                      <pre className="whitespace-pre-wrap break-words text-xs overflow-auto max-h-48">
                        {typeof scan.lighthouse_report === "string"
                          ? scan.lighthouse_report
                          : JSON.stringify(scan.lighthouse_report, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      No detailed summary available (imported via API)
                    </p>
                  )}
                </div>
              )}

              {/* Axe Result */}
              {scan.axe_score !== null && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Axe Accessibility Score
                  </h4>
                  <div className="flex items-center space-x-4 mb-3">
                    <ScoreBadge score={scan.axe_score} size="lg" />
                  </div>
                  {scan.axe_report ? (
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                      <p className="font-medium mb-2">Summary:</p>
                      <pre className="whitespace-pre-wrap break-words text-xs overflow-auto max-h-48">
                        {typeof scan.axe_report === "string"
                          ? scan.axe_report
                          : JSON.stringify(scan.axe_report, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      No detailed summary available (imported via API)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Running/Pending state */}
          {(scan.status === "running" || scan.status === "pending") && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {scan.status === "running"
                ? "Scan is currently running..."
                : "Scan is queued and will start soon..."}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

