import { useState, useEffect } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  description: string;
  user_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export default function RecentLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    try {
      const response = await fetch("/api/audit-logs?limit=20");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        console.error("Failed to load audit logs");
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Recent Logs</h2>
        </div>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Recent Logs</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-400">No logs yet</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-700 rounded-md p-3 hover:bg-gray-650 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-green-400 uppercase">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm text-white">{log.description}</p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-1 text-xs text-gray-400">
                      {log.metadata.site_name && (
                        <span>Site: {log.metadata.site_name}</span>
                      )}
                      {log.metadata.axe_score !== undefined && (
                        <span className="ml-3">
                          Axe: {log.metadata.axe_score}
                        </span>
                      )}
                      {log.metadata.lighthouse_score !== undefined && (
                        <span className="ml-3">
                          Lighthouse: {log.metadata.lighthouse_score}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

