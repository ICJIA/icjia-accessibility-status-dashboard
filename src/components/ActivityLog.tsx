/**
 * @fileoverview ActivityLog Component
 * Displays a comprehensive activity log with filtering, searching, and export capabilities.
 * Shows all significant events including site creation, updates, API imports, and user actions.
 *
 * @module components/ActivityLog
 */

import { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  Key,
  User,
  AlertCircle,
  X,
  Copy,
  Check,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { api } from "../lib/api";

/**
 * Represents a single activity log entry
 * @typedef {Object} ActivityLogEntry
 * @property {string} id - Unique identifier for the activity
 * @property {string} event_type - Type of event (e.g., 'site_created', 'api_import')
 * @property {string} event_description - Human-readable description of the event
 * @property {string|null} entity_type - Type of entity affected (e.g., 'site', 'user')
 * @property {string|null} entity_id - ID of the affected entity
 * @property {any} metadata - Additional metadata about the event
 * @property {string} created_at - ISO timestamp of when the event occurred
 * @property {Object|null} user - User who triggered the event
 * @property {string} user.username - Username of the actor
 * @property {string} user.email - Email of the actor
 * @property {Object|null} api_key - API key used for the event (if applicable)
 * @property {string} api_key.key_name - Name of the API key
 * @property {string} api_key.api_key_prefix - Prefix of the API key
 * @property {string} api_key.api_key_suffix - Suffix of the API key
 */
interface ActivityLogEntry {
  id: string;
  event_type: string;
  event_description: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: any;
  created_at: string;
  user: { username: string; email: string } | null;
  api_key: {
    key_name: string;
    api_key_prefix: string;
    api_key_suffix: string;
  } | null;
}

/**
 * Props for the ActivityLog component
 * @typedef {Object} ActivityLogProps
 * @property {number} [limit=20] - Maximum number of activities to display
 * @property {boolean} [compact=false] - Whether to display in compact mode
 */
interface ActivityLogProps {
  limit?: number;
  compact?: boolean;
}

/**
 * ActivityLog Component
 *
 * Displays a filterable and searchable activity log with the following features:
 * - Real-time activity loading from the API
 * - Search functionality across event types, descriptions, users, and API keys
 * - Event type filtering with visual indicators
 * - Export to JSON and CSV formats
 * - Payload viewing modal for detailed event data
 * - Responsive design with dark mode support
 *
 * @component
 * @param {ActivityLogProps} props - Component props
 * @param {number} [props.limit=20] - Initial number of activities to display
 * @param {boolean} [props.compact=false] - Compact display mode
 * @returns {React.ReactElement} The rendered activity log component
 *
 * @example
 * // Display activity log with default settings
 * <ActivityLog />
 *
 * @example
 * // Display 50 activities in compact mode
 * <ActivityLog limit={50} compact={true} />
 */
export function ActivityLog({ limit = 20, compact = false }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(limit);
  const [selectedPayloadUuid, setSelectedPayloadUuid] = useState<string | null>(
    null
  );
  const [payloadData, setPayloadData] = useState<any>(null);
  const [payloadLoading, setPayloadLoading] = useState(false);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [displayLimit]);

  /**
   * Loads activities from the API
   * @async
   * @function loadActivities
   * @returns {Promise<void>}
   */
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.activityLog.list(displayLimit, 0);
      setActivities(response.activities || []);
    } catch (err: any) {
      console.error("Failed to load activity log:", err);
      setError(err.message || "Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads a specific payload by identifier
   * @async
   * @function loadPayload
   * @param {string} identifier - The payload UUID or ID
   * @param {boolean} [isUuid=true] - Whether the identifier is a UUID (true) or ID (false)
   * @returns {Promise<void>}
   */
  const loadPayload = async (identifier: string, isUuid: boolean = true) => {
    try {
      setPayloadLoading(true);
      setPayloadError(null);
      const response = isUuid
        ? await api.payloads.get(identifier)
        : await api.payloads.getById(identifier);
      setPayloadData(response.payload);
    } catch (err: any) {
      console.error("Failed to load payload:", err);
      setPayloadError(err.message || "Failed to load payload");
    } finally {
      setPayloadLoading(false);
    }
  };

  /**
   * Handles payload click event to open the payload modal
   * @function handlePayloadClick
   * @param {string} identifier - The payload UUID or ID
   * @param {boolean} [isUuid=true] - Whether the identifier is a UUID
   * @returns {void}
   */
  const handlePayloadClick = (identifier: string, isUuid: boolean = true) => {
    setSelectedPayloadUuid(identifier);
    setPayloadData(null);
    loadPayload(identifier, isUuid);
  };

  /**
   * Copies the payload JSON to the clipboard
   * @async
   * @function handleCopyToClipboard
   * @returns {Promise<void>}
   */
  const handleCopyToClipboard = async () => {
    if (!payloadData?.payload) return;
    try {
      const jsonString = JSON.stringify(payloadData.payload, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  /**
   * Closes the payload modal
   * @function closeModal
   * @returns {void}
   */
  const closeModal = () => {
    setSelectedPayloadUuid(null);
    setPayloadData(null);
    setPayloadError(null);
  };

  /**
   * Gets the appropriate icon for an event type
   * @function getEventIcon
   * @param {string} eventType - The event type
   * @returns {React.ReactElement} The icon component
   */
  const getEventIcon = (eventType: string | undefined) => {
    switch (eventType) {
      case "site_created":
      case "site_updated":
        return <Activity className="h-3 w-3" />;
      case "api_import":
        return <Key className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  /**
   * Gets the appropriate color classes for an event type
   * @function getEventColor
   * @param {string} eventType - The event type
   * @returns {string} Tailwind CSS color classes
   */
  const getEventColor = (eventType: string | undefined) => {
    switch (eventType) {
      case "site_created":
        return "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30";
      case "site_updated":
        return "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30";
      case "api_import":
        return "text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30";
      case "user_created":
      case "user_updated":
      case "user_deleted":
        return "text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30";
      case "api_key_created":
      case "api_key_deleted":
        return "text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30";
      default:
        return "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800";
    }
  };

  /**
   * Formats an event type string to a human-readable format
   * @function formatEventType
   * @param {string} eventType - The event type (e.g., 'site_created')
   * @returns {string} Formatted event type (e.g., 'Site Created')
   */
  const formatEventType = (eventType: string | undefined) => {
    if (!eventType) {
      return "Unknown Event";
    }
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /**
   * Formats a timestamp to a relative time string (e.g., '5m ago')
   * @function formatTimeAgo
   * @param {string} timestamp - ISO timestamp string
   * @returns {string} Relative time string
   */
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  // Get unique event types for filter dropdown
  const eventTypes = Array.from(
    new Set(activities.map((a) => a.event_type))
  ).sort();

  // Filter activities based on search and event type
  const filteredActivities = activities.filter((activity) => {
    // Filter by event type
    if (selectedEventType && activity.event_type !== selectedEventType) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        activity.event_type,
        activity.event_description,
        activity.entity_id,
        activity.user?.username,
        activity.api_key?.key_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    }

    return true;
  });

  /**
   * Exports filtered activities as a JSON file
   * @function exportAsJSON
   * @returns {void}
   */
  const exportAsJSON = () => {
    const dataToExport = filteredActivities.map((activity) => ({
      id: activity.id,
      event_type: activity.event_type,
      event_description: activity.event_description,
      entity_type: activity.entity_type,
      entity_id: activity.entity_id,
      user: activity.user?.username,
      api_key: activity.api_key?.key_name,
      timestamp: activity.created_at,
      metadata: activity.metadata,
    }));

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-log-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Exports filtered activities as a CSV file
   * @function exportAsCSV
   * @returns {void}
   */
  const exportAsCSV = () => {
    const headers = [
      "ID",
      "Event Type",
      "Description",
      "Entity Type",
      "Entity ID",
      "User",
      "API Key",
      "Timestamp",
    ];

    const rows = filteredActivities.map((activity) => [
      activity.id,
      activity.event_type,
      activity.event_description,
      activity.entity_type || "",
      activity.entity_id || "",
      activity.user?.username || "",
      activity.api_key?.key_name || "",
      activity.created_at,
    ]);

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-log-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600 dark:text-gray-400">
            Loading activity...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Toggle filters"
          >
            <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <label
            htmlFor="activity-limit"
            className="text-xs text-gray-600 dark:text-gray-400"
          >
            Show:
          </label>
          <select
            id="activity-limit"
            value={displayLimit}
            onChange={(e) => setDisplayLimit(Number(e.target.value))}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event type, description, user, or API key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Event Type:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedEventType(null)}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  selectedEventType === null
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                }`}
              >
                All
              </button>
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedEventType(type)}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    selectedEventType === type
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                  }`}
                >
                  {formatEventType(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedEventType) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedEventType(null);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          )}

          {/* Export Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            <button
              onClick={exportAsJSON}
              disabled={filteredActivities.length === 0}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
            >
              <Download className="h-3 w-3" />
              Export JSON
            </button>
            <button
              onClick={exportAsCSV}
              disabled={filteredActivities.length === 0}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-colors"
            >
              <Download className="h-3 w-3" />
              Export CSV
            </button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
          No activity recorded yet
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
          No activities match your filters
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map((activity) => {
            // Check if this activity has a payload (UUID or ID)
            const payloadUuid = activity.metadata?.payload_uuid;
            const payloadId = activity.metadata?.payload_id;
            const hasPayloadLink =
              payloadUuid ||
              payloadId ||
              activity.event_type === "site_created" ||
              activity.event_type === "site_updated" ||
              activity.event_type === "api_import";

            return (
              <div
                key={activity.id}
                className={`border border-gray-200 dark:border-gray-700 rounded p-2 transition-all ${
                  hasPayloadLink
                    ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => {
                  if (hasPayloadLink) {
                    // Use UUID if available, otherwise use payload_id
                    if (payloadUuid) {
                      handlePayloadClick(payloadUuid, true);
                    } else if (payloadId) {
                      handlePayloadClick(payloadId, false);
                    }
                  }
                }}
                role="button"
                tabIndex={hasPayloadLink ? 0 : -1}
              >
                <div className="flex items-start space-x-1.5">
                  {/* Event Icon */}
                  <div
                    className={`flex-shrink-0 p-1 rounded ${getEventColor(
                      activity.event_type
                    )}`}
                  >
                    {getEventIcon(activity.event_type)}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
                        {formatEventType(activity.event_type)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatTimeAgo(activity.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-1">
                      {activity.event_description}
                    </p>

                    {/* Actor and Links */}
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        {activity.api_key && (
                          <div className="flex items-center space-x-1">
                            <Key className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">
                              {activity.api_key.key_name}
                            </span>
                          </div>
                        )}
                        {activity.user && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{activity.user.username}</span>
                          </div>
                        )}
                      </div>

                      {/* Links */}
                      <div className="flex items-center gap-2 text-xs">
                        {hasPayloadLink && (
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            View Payload →
                          </span>
                        )}
                        {activity.entity_type === "site" &&
                          activity.entity_id && (
                            <a
                              href={`/sites/${activity.entity_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 underline"
                            >
                              Site
                            </a>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payload Modal */}
      {selectedPayloadUuid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                JSON Payload
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              {payloadLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    Loading payload...
                  </div>
                </div>
              ) : payloadError ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ No JSON payload data is available for this entry.
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                    Identifier: {selectedPayloadUuid}
                  </p>
                </div>
              ) : payloadData?.payload ? (
                <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs overflow-auto text-gray-800 dark:text-gray-200 font-mono">
                  {JSON.stringify(payloadData.payload, null, 2)}
                </pre>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {payloadData?.payload_id && (
                  <span>ID: {payloadData.payload_id}</span>
                )}
              </div>
              <button
                onClick={handleCopyToClipboard}
                disabled={!payloadData?.payload || payloadLoading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
