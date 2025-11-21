/**
 * @fileoverview AdminDashboard Page
 * Administrative dashboard for managing users and system monitoring.
 * Provides access to activity logs, site management, and user management.
 *
 * @module pages/AdminDashboard
 */

import { useState, useEffect } from "react";
import {
  Settings,
  UserPlus,
  Users,
  BarChart3,
  Activity,
  Globe,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import RecentLogs from "../components/RecentLogs";
import { SitesManagement } from "../components/SitesManagement";
import { ScanProgressIndicator } from "../components/ScanProgressIndicator";
import { ScopeAlert } from "../components/ScopeAlert";
import { api } from "../lib/api";
import { Site } from "../types";

/**
 * Represents a user in the system
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {boolean} [is_primary_admin] - Whether user is primary admin
 */
interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_primary_admin?: boolean;
}

/**
 * AdminDashboard Page Component
 *
 * Administrative interface providing:
 * - User management (create, delete, reset password)
 * - Site management (create, edit, delete, clear data)
 * - Activity log viewing
 * - System statistics and monitoring
 *
 * @component
 * @returns {React.ReactElement} The admin dashboard page
 *
 * @example
 * <Route path="/admin" element={<AdminDashboard />} />
 */
export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditSiteModal, setShowEditSiteModal] = useState(false);
  const [showDeleteSiteModal, setShowDeleteSiteModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [sitesRefreshKey, setSitesRefreshKey] = useState(0);
  const [logsRefreshKey, setLogsRefreshKey] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.list();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.users.create(username, email, password);
      setShowCreateModal(false);
      await loadUsers();
      alert("User created successfully");
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.users.resetPassword(selectedUser.id, newPassword);
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      alert("Password reset successfully. User will need to log in again.");
    } catch (err: any) {
      alert(`Failed to reset password: ${err.message}`);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditSite = (site: Site) => {
    setSelectedSite(site);
    setShowEditSiteModal(true);
  };

  const handleDeleteSite = (site: Site) => {
    setSelectedSite(site);
    setShowDeleteSiteModal(true);
  };

  const handleSaveEditSite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSite) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const url = formData.get("url") as string;
    const sitemap_url = (formData.get("sitemap_url") as string) || null;
    const documentation_url =
      (formData.get("documentation_url") as string) || null;

    try {
      await api.sites.update(selectedSite.id, {
        title,
        description,
        url,
        sitemap_url,
        documentation_url,
      });
      setShowEditSiteModal(false);
      setSelectedSite(null);
      setSitesRefreshKey((prev) => prev + 1);
      alert("Site updated successfully");
    } catch (err: any) {
      alert(`Failed to update site: ${err.message}`);
    }
  };

  const handleConfirmDeleteSite = async () => {
    if (!selectedSite) return;

    try {
      await api.sites.delete(selectedSite.id);
      setShowDeleteSiteModal(false);
      setSelectedSite(null);
      setSitesRefreshKey((prev) => prev + 1);
      alert("Site deleted successfully");
    } catch (err: any) {
      alert(`Failed to delete site: ${err.message}`);
    }
  };

  return (
    <>
      <ScopeAlert />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor system activity and manage administrative tasks
          </p>
        </div>

        {/* Scan Progress Indicator */}
        <ScanProgressIndicator
          onScanComplete={() => setLogsRefreshKey((prev) => prev + 1)}
        />

        {/* Action Cards Section - Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Add Site Card - First */}
          <a
            href="/admin/sites/new"
            className="group block p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-lg shadow hover:shadow-xl transition-all border border-red-200 dark:border-red-700 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-600 rounded-lg group-hover:bg-red-700 transition-colors">
                <Globe className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Add Site
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Add a new website for accessibility scanning
            </p>
          </a>

          {/* User Management Card */}
          <a
            href="/admin/users"
            className="group block p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg shadow hover:shadow-xl transition-all border border-blue-200 dark:border-blue-700 hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              User Management
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Create, edit, and manage admin users
            </p>
          </a>
        </div>

        {/* Sites Management Section */}
        <div className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tracked Sites
              </h2>
              <a
                href="/admin/sites/new"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                + Add Site
              </a>
            </div>
            <SitesManagement
              key={sitesRefreshKey}
              onEdit={handleEditSite}
              onDelete={handleDeleteSite}
              onRefresh={() => setSitesRefreshKey((prev) => prev + 1)}
            />
          </div>
        </div>

        {/* User Management Section */}
        <div className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Users
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                Loading users...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Username
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Created
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <span>{user.username}</span>
                            {user.is_primary_admin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                Primary Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowResetPasswordModal(true);
                            }}
                            disabled={user.is_primary_admin}
                            className={`flex items-center gap-1 ${
                              user.is_primary_admin
                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                : "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                            }`}
                            title={
                              user.is_primary_admin
                                ? "Cannot reset password for primary admin user"
                                : "Reset password"
                            }
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span className="text-xs">Reset Password</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Logs Section - Bottom */}
        <div className="mb-8">
          <RecentLogs key={logsRefreshKey} />
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create New User
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Reset Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Reset password for user:{" "}
                <strong>{selectedUser.username}</strong>
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> This will log the user out of all
                    sessions.
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Site Modal */}
        {showEditSiteModal && selectedSite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Edit Site
              </h2>
              <form onSubmit={handleSaveEditSite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedSite.title}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedSite.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    name="url"
                    defaultValue={selectedSite.url}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sitemap URL (optional)
                  </label>
                  <input
                    type="url"
                    name="sitemap_url"
                    defaultValue={selectedSite.sitemap_url || ""}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Documentation URL (optional)
                  </label>
                  <input
                    type="url"
                    name="documentation_url"
                    defaultValue={selectedSite.documentation_url || ""}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditSiteModal(false);
                      setSelectedSite(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Site Confirmation Modal */}
        {showDeleteSiteModal && selectedSite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Delete Site
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete{" "}
                <strong>{selectedSite.title}</strong>? This action cannot be
                undone and will delete all associated scans and data.
              </p>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleConfirmDeleteSite}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteSiteModal(false);
                    setSelectedSite(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
