import { Link } from "react-router-dom";
import {
  Moon,
  Sun,
  LogIn,
  LogOut,
  User,
  Settings,
  Users,
  BookOpen,
  Home,
  Key,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";
import { Tooltip } from "./Tooltip";

interface HealthStatus {
  status: string;
  timestamp: string;
  backend: {
    status: string;
    uptime: number;
    nodeVersion: string;
    environment: string;
  };
  database: {
    status: string;
    supabaseUrl: string;
    tables: {
      [key: string]: {
        status: string;
        error?: string;
        responseTime: number;
      };
    };
    error?: string;
  };
  checks: Array<{
    name: string;
    status: string;
    error?: string;
  }>;
  responseTime: number;
}

export function Navigation() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (err) {
      setHealth(null);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
          >
            <img
              src="https://icjia.illinois.gov/icjia-logo.png"
              alt="ICJIA Logo"
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
                Illinois Criminal Justice Information Authority
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Accessibility Status Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* System Status Indicators - Compact */}
            <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {/* Backend Status */}
              <Tooltip
                content={`API: ${health ? "WORKING" : "NOT WORKING"}`}
                position="bottom"
              >
                <div
                  className="flex items-center space-x-1.5 cursor-help"
                  role="status"
                  aria-label={`API status: ${
                    health ? "working" : "not working"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      health ? "bg-green-500" : "bg-red-500"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    API
                  </span>
                </div>
              </Tooltip>

              {/* Database Status */}
              <Tooltip
                content={`Database: ${
                  health?.database?.status === "connected"
                    ? "WORKING"
                    : "NOT WORKING"
                }`}
                position="bottom"
              >
                <div
                  className="flex items-center space-x-1.5 cursor-help"
                  role="status"
                  aria-label={`Database status: ${
                    health?.database?.status === "connected"
                      ? "working"
                      : "not working"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      health?.database?.status === "connected"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    DB
                  </span>
                </div>
              </Tooltip>
            </div>

            <Link
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {/* Documentation link - only visible to authenticated users */}
            {user && (
              <a
                href={
                  process.env.NODE_ENV === "production"
                    ? "/docs/"
                    : import.meta.env.VITE_DOCS_URL || "http://localhost:3002"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-2"
                title="View documentation site"
              >
                <BookOpen className="h-5 w-5" />
                <span className="hidden sm:inline">Docs</span>
              </a>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {user ? (
              <div className="relative">
                <Tooltip content="User: LOGGED IN" position="bottom">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    role="status"
                    aria-label="User status: logged in"
                  >
                    <div className="relative">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      {/* Green dot indicator for logged in */}
                      <div
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.username}
                    </span>
                  </button>
                </Tooltip>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* System Status in Dropdown (mobile only) */}
                    <div className="md:hidden px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        System Status
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              health ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-gray-600 dark:text-gray-400">
                            Backend
                          </span>
                        </div>
                        <span
                          className={
                            health
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {health ? "Running" : "Down"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              health?.database?.status === "connected"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-gray-600 dark:text-gray-400">
                            Database
                          </span>
                        </div>
                        <span
                          className={
                            health?.database?.status === "connected"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {health?.database?.status === "connected"
                            ? "Connected"
                            : "Disconnected"}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>User Management</span>
                    </Link>
                    <Link
                      to="/admin/documentation"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Documentation</span>
                    </Link>
                    <Link
                      to="/admin/api-keys"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Key className="h-4 w-4" />
                      <span>API Keys</span>
                    </Link>

                    {/* Logout */}
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Tooltip content="User: NOT LOGGED IN" position="bottom">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  role="status"
                  aria-label="User status: not logged in"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
