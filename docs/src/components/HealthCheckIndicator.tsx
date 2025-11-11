import React, { useState, useEffect } from "react";
import styles from "./HealthCheckIndicator.module.css";

interface HealthStatus {
  status: string;
  backend?: {
    status: string;
  };
  database?: {
    status: string;
  };
}

export function HealthCheckIndicator() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the API URL based on environment
      const apiUrl =
        typeof window !== "undefined"
          ? window.location.origin.replace(/\/docs\/?$/, "")
          : "";

      const response = await fetch(`${apiUrl}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      } else {
        setError("Health check failed");
        setHealth(null);
      }
    } catch (err) {
      setError("Unable to connect to API");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check health on mount
    checkHealth();

    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === "ok";
  const backendHealthy = health?.backend?.status === "ok";
  const databaseHealthy = health?.database?.status === "connected";

  return (
    <div className={styles.healthIndicator}>
      <div
        className={`${styles.indicator} ${
          isHealthy ? styles.healthy : styles.unhealthy
        }`}
        title={
          isHealthy
            ? "Documentation site is healthy"
            : error || "Documentation site is unavailable"
        }
        role="status"
        aria-label={`Documentation health: ${
          isHealthy ? "healthy" : "unhealthy"
        }`}
      >
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.label}>Docs</span>
      </div>

      {/* Tooltip on hover */}
      <div className={styles.tooltip}>
        {loading ? (
          <div className={styles.tooltipContent}>
            <span>Checking health...</span>
          </div>
        ) : error ? (
          <div className={styles.tooltipContent}>
            <span className={styles.error}>{error}</span>
          </div>
        ) : (
          <div className={styles.tooltipContent}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Overall:</span>
              <span
                className={`${styles.statusValue} ${
                  isHealthy ? styles.statusOk : styles.statusError
                }`}
              >
                {isHealthy ? "✓ OK" : "✗ Error"}
              </span>
            </div>
            {backendHealthy !== undefined && (
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Backend:</span>
                <span
                  className={`${styles.statusValue} ${
                    backendHealthy ? styles.statusOk : styles.statusError
                  }`}
                >
                  {backendHealthy ? "✓ OK" : "✗ Error"}
                </span>
              </div>
            )}
            {databaseHealthy !== undefined && (
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Database:</span>
                <span
                  className={`${styles.statusValue} ${
                    databaseHealthy ? styles.statusOk : styles.statusError
                  }`}
                >
                  {databaseHealthy ? "✓ OK" : "✗ Error"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

