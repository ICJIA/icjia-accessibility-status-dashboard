/**
 * @fileoverview API Client
 * Centralized API client for all backend communication.
 * Handles authentication, error handling, and request formatting.
 *
 * @module lib/api
 */

const API_BASE = "/api";

/**
 * Fetch wrapper for API calls
 *
 * Handles:
 * - Base URL prefixing
 * - Credentials (cookies) inclusion
 * - Content-Type header
 * - Error handling with status codes
 * - JSON parsing
 *
 * @async
 * @function fetchAPI
 * @param {string} endpoint - API endpoint path (e.g., "/auth/login")
 * @param {RequestInit} [options={}] - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} With status code attached for HTTP errors
 *
 * @example
 * const data = await fetchAPI("/sites", { method: "GET" });
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    const errorMessage = error.error || "Request failed";

    // Create error with status code for better handling
    const err = new Error(errorMessage) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  return response.json();
}

/**
 * API client object with organized endpoints
 *
 * Provides methods for:
 * - Authentication (login, logout, session, password change)
 * - User management (list, create, delete, reset password)
 * - Site management (list, create, update, delete)
 * - Payload management (list, get, import)
 * - API key management (list, create, delete, rotate)
 * - Activity logging (list, export)
 * - Health checks
 *
 * @type {Object}
 *
 * @example
 * // Login
 * const { user } = await api.auth.login("admin", "password");
 *
 * @example
 * // Get sites
 * const { sites } = await api.sites.list();
 *
 * @example
 * // Create API key
 * const { apiKey } = await api.apiKeys.create({ key_name: "My Key" });
 */
export const api = {
  auth: {
    login: (username: string, password: string) =>
      fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    logout: () => fetchAPI("/auth/logout", { method: "POST" }),
    getSession: () => fetchAPI("/auth/session"),
    changePassword: (currentPassword: string, newPassword: string) =>
      fetchAPI("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    needsSetup: () => fetchAPI("/auth/needs-setup"),
    initialSetup: (newPassword: string) =>
      fetchAPI("/auth/initial-setup", {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      }),
  },

  users: {
    list: () => fetchAPI("/users"),
    create: (username: string, email: string, password: string) =>
      fetchAPI("/users", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      }),
    update: (id: string, email: string) =>
      fetchAPI(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ email }),
      }),
    delete: (id: string) => fetchAPI(`/users/${id}`, { method: "DELETE" }),
    resetPassword: (id: string, newPassword: string) =>
      fetchAPI(`/users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      }),
  },

  sites: {
    list: () => fetchAPI("/sites"),
    get: (id: string) => fetchAPI(`/sites/${id}`),
    getHistory: (id: string) => fetchAPI(`/sites/${id}/history`),
    getPayloads: (id: string) => fetchAPI(`/sites/${id}/payloads`),
    getScans: (id: string) => fetchAPI(`/sites/${id}/scans`),
    create: (data: any) =>
      fetchAPI("/sites", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI(`/sites/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) => fetchAPI(`/sites/${id}`, { method: "DELETE" }),
  },

  export: {
    dashboard: (format: string) =>
      `${API_BASE}/export/dashboard?format=${format}`,
    site: (id: string, format: string) =>
      `${API_BASE}/export/site/${id}?format=${format}`,
    fullReport: (format: string) =>
      `${API_BASE}/export/full-report?format=${format}`,
  },

  documentation: {
    list: () => fetchAPI("/documentation"),
    get: (section: string) => fetchAPI(`/documentation/${section}`),
    update: (section: string, content: string) =>
      fetchAPI(`/documentation/${section}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      }),
    create: (section_name: string, content: string) =>
      fetchAPI("/documentation", {
        method: "POST",
        body: JSON.stringify({ section_name, content }),
      }),
  },

  apiKeys: {
    list: () => fetchAPI("/api-keys"),
    create: (
      key_name: string,
      scopes: string[],
      environment: "live" | "test",
      expires_at?: string,
      notes?: string
    ) =>
      fetchAPI("/api-keys", {
        method: "POST",
        body: JSON.stringify({
          key_name,
          scopes,
          environment,
          expires_at,
          notes,
        }),
      }),
    update: (
      id: string,
      data: { key_name?: string; scopes?: string[]; notes?: string }
    ) =>
      fetchAPI(`/api-keys/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    revoke: (id: string) =>
      fetchAPI(`/api-keys/${id}/revoke`, {
        method: "POST",
      }),
    delete: (id: string) => fetchAPI(`/api-keys/${id}`, { method: "DELETE" }),
  },

  payloads: {
    get: (uuid: string) => fetchAPI(`/payloads/${uuid}`),
    getById: (payloadId: string) => fetchAPI(`/payloads/by-id/${payloadId}`),
    list: (limit?: number, offset?: number) => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      return fetchAPI(`/payloads?${params.toString()}`);
    },
  },

  activityLog: {
    list: (limit?: number, offset?: number) => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      return fetchAPI(`/activity-log?${params.toString()}`);
    },
  },

  health: {
    check: () => fetchAPI("/health"),
  },
};
