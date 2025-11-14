/**
 * @fileoverview Main App Component
 * Root application component that sets up routing, authentication, and theme providers.
 * Defines all application routes and their access controls.
 *
 * @module App
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navigation } from "./components/Navigation";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SetupCheck } from "./components/SetupCheck";
import { Dashboard } from "./pages/Dashboard";
import { SiteDetail } from "./pages/SiteDetail";
import { AddSite } from "./pages/AddSite";
import { ScanReport } from "./pages/ScanReport";
import { Login } from "./pages/Login";
import { ChangePassword } from "./pages/ChangePassword";
import { InitialSetup } from "./pages/InitialSetup";
import { Users } from "./pages/Users";
import { AdminDashboard } from "./pages/AdminDashboard";
import Health from "./pages/Health";

/**
 * App Component
 *
 * Main application component that provides:
 * - Theme context (light/dark mode)
 * - Authentication context and session management
 * - Initial setup check
 * - Navigation bar
 * - Route definitions with access control
 *
 * Route structure:
 * - Public routes: /login, /setup, /health
 * - Protected routes: /dashboard, /sites/:id, /change-password
 * - Admin routes: /admin/api-keys, /admin/users, /admin/dashboard, /admin/payloads
 *
 * @component
 * @returns {React.ReactElement} The main application
 *
 * @example
 * <App />
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <SetupCheck>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navigation />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sites/:id" element={<SiteDetail />} />
                <Route
                  path="/sites/:siteId/scans/:scanId/report"
                  element={<ScanReport />}
                />
                <Route
                  path="/admin/sites/new"
                  element={
                    <ProtectedRoute>
                      <AddSite />
                    </ProtectedRoute>
                  }
                />
                <Route path="/health" element={<Health />} />
                <Route path="/login" element={<Login />} />
                <Route path="/setup" element={<InitialSetup />} />
                <Route
                  path="/change-password"
                  element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </SetupCheck>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
