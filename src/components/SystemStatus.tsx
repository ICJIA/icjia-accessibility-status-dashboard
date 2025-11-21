/**
 * @fileoverview SystemStatus Component
 * Displays real-time system health status including backend and database status.
 * Periodically checks health and displays status in a fixed position indicator.
 *
 * @module components/SystemStatus
 */

import { useEffect, useState } from "react";
import { Activity, Database, Server, AlertCircle } from "lucide-react";

/**
 * Represents the health status of the system
 * @typedef {Object} HealthStatus
 * @property {string} status - Overall system status
 * @property {string} backend - Backend service status
 * @property {string} database - Database status
 * @property {string|null} databaseError - Database error message if any
 * @property {string} timestamp - ISO timestamp of the health check
 */
interface HealthStatus {
  status: string;
  backend: string;
  database: string;
  databaseError: string | null;
  timestamp: string;
}

/**
 * SystemStatus Component
 *
 * Displays a fixed-position health status indicator that shows:
 * - Backend service status
 * - Database connection status
 * - Overall system status
 * - Last check timestamp
 *
 * Automatically checks health every 15 seconds and updates the display.
 *
 * @component
 * @returns {React.ReactElement} The health status indicator
 *
 * @example
 * <SystemStatus />
 */
export function SystemStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${apiUrl}/health`);

      if (!response.ok) {
        throw new Error("Backend unreachable");
      }

      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkHealth();

    // Check every 15 seconds
    const interval = setInterval(checkHealth, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Activity className="h-4 w-4 animate-pulse" />
          <span>Checking status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 z-50">
      <div className="space-y-2">
        {/* Backend Status */}
        <div className="flex items-center space-x-2 text-sm">
          <Server
            className={`h-4 w-4 ${error ? "text-red-500" : "text-green-500"}`}
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Backend:
          </span>
          {error ? (
            <span className="text-red-600 dark:text-red-400 flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>Down</span>
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400">Running</span>
          )}
        </div>

        {/* Database Status */}
        <div className="flex items-center space-x-2 text-sm">
          <Database
            className={`h-4 w-4 ${
              health?.database === "connected"
                ? "text-green-500"
                : "text-red-500"
            }`}
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Database:
          </span>
          {!health ? (
            <span className="text-red-600 dark:text-red-400 flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>Unknown</span>
            </span>
          ) : health.database === "connected" ? (
            <span className="text-green-600 dark:text-green-400">
              Connected
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400 flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>Disconnected</span>
            </span>
          )}
        </div>

        {/* Error Details */}
        {health?.databaseError && (
          <div className="text-xs text-red-600 dark:text-red-400 mt-1 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="font-medium">Database Error:</div>
            <div className="mt-1 font-mono">{health.databaseError}</div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          Last checked:{" "}
          {health ? new Date(health.timestamp).toLocaleTimeString() : "Never"}
        </div>
      </div>
    </div>
  );
}
