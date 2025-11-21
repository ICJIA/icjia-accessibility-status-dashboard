/**
 * @fileoverview Scan Progress Indicator Component
 * Displays real-time scan progress with statistics
 * Shows percentage, pages scanned, violations, and worst page
 *
 * @module components/ScanProgressIndicator
 */

import { useEffect, useState, useRef } from "react";
import { AlertCircle, CheckCircle, Zap, X } from "lucide-react";
import { api } from "../lib/api";

interface ScanProgress {
  id: string;
  site_id: string;
  site_name: string;
  scan_type: string;
  status: string;
  pages_scanned: number;
  pages_total: number;
  total_violations_sum: number;
  worst_page_url: string | null;
  worst_page_violations: number;
  percentage: number;
  started_at?: string;
  estimated_time_remaining?: number; // in seconds
  average_time_per_page?: number; // in seconds
}

interface ScanProgressIndicatorProps {
  onScanComplete?: () => void;
}

export function ScanProgressIndicator({
  onScanComplete,
}: ScanProgressIndicatorProps) {
  const [activeScan, setActiveScan] = useState<ScanProgress | null>(null);
  const [completedScan, setCompletedScan] = useState<ScanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scanStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    checkForActiveScan();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Calculating...";
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Helper function to calculate estimated time remaining
  const calculateTimeRemaining = (
    pagesScanned: number,
    pagesTotal: number,
    startedAt: string | undefined
  ): { estimated: number; avgPerPage: number } => {
    if (!startedAt || pagesScanned === 0 || pagesTotal === 0) {
      return { estimated: 0, avgPerPage: 0 };
    }

    const startTime = new Date(startedAt).getTime();
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const avgTimePerPage = elapsedSeconds / pagesScanned;
    const remainingPages = pagesTotal - pagesScanned;
    const estimatedSecondsRemaining = avgTimePerPage * remainingPages;

    return {
      estimated: Math.max(0, estimatedSecondsRemaining),
      avgPerPage: avgTimePerPage,
    };
  };

  const handleCancelScan = async () => {
    if (!activeScan) return;

    try {
      setIsCancelling(true);
      await api.scans.cancel(activeScan.id);

      // Clear the active scan
      setActiveScan(null);

      // Stop polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Show a brief message
      console.log("Scan cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel scan:", error);
      alert("Failed to cancel scan. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const checkForActiveScan = async () => {
    try {
      setLoading(true);
      const response = await api.scans.list({ status: "in_progress" });
      const scans = response.scans || [];

      if (scans.length > 0) {
        const scan = scans[0];
        const percentage = scan.pages_total
          ? Math.round((scan.pages_scanned / scan.pages_total) * 100)
          : 0;

        // Calculate time remaining
        const { estimated, avgPerPage } = calculateTimeRemaining(
          scan.pages_scanned || 0,
          scan.pages_total || 0,
          scan.started_at
        );

        // Track scan start time on first detection
        if (!scanStartTimeRef.current && scan.started_at) {
          scanStartTimeRef.current = new Date(scan.started_at).getTime();
        }

        setActiveScan({
          id: scan.id,
          site_id: scan.site_id,
          site_name: scan.site_name || "Unknown Site",
          scan_type: scan.scan_type,
          status: scan.status,
          pages_scanned: scan.pages_scanned || 0,
          pages_total: scan.pages_total || 0,
          total_violations_sum: scan.total_violations_sum || 0,
          worst_page_url: scan.worst_page_url,
          worst_page_violations: scan.worst_page_violations || 0,
          percentage,
          started_at: scan.started_at,
          estimated_time_remaining: estimated,
          average_time_per_page: avgPerPage,
        });

        // Start polling for updates
        if (!pollIntervalRef.current) {
          pollIntervalRef.current = setInterval(checkForActiveScan, 1000);
        }
      } else {
        // Check for recently completed scans
        const completedResponse = await api.scans.list({ status: "completed" });
        const completedScans = completedResponse.scans || [];

        if (activeScan && completedScans.length > 0) {
          // Find the scan that just completed
          const justCompleted = completedScans.find(
            (s: any) => s.id === activeScan.id
          );
          if (justCompleted) {
            const percentage = justCompleted.pages_total
              ? Math.round(
                  (justCompleted.pages_scanned / justCompleted.pages_total) *
                    100
                )
              : 100;

            setCompletedScan({
              id: justCompleted.id,
              site_id: justCompleted.site_id,
              site_name: justCompleted.site_name || "Unknown Site",
              scan_type: justCompleted.scan_type,
              status: justCompleted.status,
              pages_scanned: justCompleted.pages_scanned || 0,
              pages_total: justCompleted.pages_total || 0,
              total_violations_sum: justCompleted.total_violations_sum || 0,
              worst_page_url: justCompleted.worst_page_url,
              worst_page_violations: justCompleted.worst_page_violations || 0,
              percentage,
            });

            setShowCompletion(true);
            onScanComplete?.();

            // Auto-hide completion message after 5 seconds
            if (completionTimeoutRef.current) {
              clearTimeout(completionTimeoutRef.current);
            }
            completionTimeoutRef.current = setTimeout(() => {
              setShowCompletion(false);
              setCompletedScan(null);
            }, 5000);
          }
        }

        setActiveScan(null);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Failed to check for active scan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // Show completion message
  if (showCompletion && completedScan) {
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                ✅ Scan Complete
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {completedScan.site_name} • {completedScan.scan_type}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              100%
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Complete</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
              Pages Scanned
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {completedScan.pages_scanned}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                /{completedScan.pages_total}
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
              Violations Found
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {completedScan.total_violations_sum}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
              Worst Page Issues
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {completedScan.worst_page_violations}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
              Status
            </p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              Success
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show progress indicator
  if (!activeScan) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              📊 Scan in Progress
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {activeScan.site_name} • {activeScan.scan_type}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Status:{" "}
              <span className="font-semibold capitalize">
                {activeScan.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {activeScan.percentage}%
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Complete</p>
            {activeScan.estimated_time_remaining !== undefined && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                {formatTimeRemaining(activeScan.estimated_time_remaining)}{" "}
                remaining
              </p>
            )}
          </div>
          <button
            onClick={handleCancelScan}
            disabled={isCancelling}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors font-medium text-sm"
            title="Cancel this scan"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isCancelling ? "Cancelling..." : "Cancel"}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden shadow-sm">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-md"
            style={{ width: `${activeScan.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        {/* Current Page Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
            Current Page
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {activeScan.pages_scanned + 1}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              /{activeScan.pages_total}
            </span>
          </p>
        </div>

        {/* Pages Scanned */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
            Completed
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {activeScan.pages_scanned}
          </p>
        </div>

        {/* Remaining Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
            Remaining
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {activeScan.pages_total - activeScan.pages_scanned}
          </p>
        </div>

        {/* Time Per Page */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
            Avg Time/Page
          </p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {activeScan.average_time_per_page
              ? `${activeScan.average_time_per_page.toFixed(1)}s`
              : "—"}
          </p>
        </div>

        {/* Total Violations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-red-600" />
            Violations
          </p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {activeScan.total_violations_sum}
          </p>
        </div>

        {/* Worst Page */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
            Worst Page Issues
          </p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {activeScan.worst_page_violations}
          </p>
        </div>
      </div>

      {/* Worst Page URL */}
      {activeScan.worst_page_url && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-orange-600" />
            Page with Most Issues
          </p>
          <p className="text-sm text-gray-900 dark:text-gray-100 break-all font-mono">
            {activeScan.worst_page_url}
          </p>
        </div>
      )}
    </div>
  );
}
