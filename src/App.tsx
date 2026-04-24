import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth
import AdminLogin from "./pages/Adminlogin";
import Login from "./pages/Login";

// Dashboards
import AdminDashboard from "./pages/Admindashboard";
import UserDashboard from "./pages/Userdashboard";

// Admin-only pages
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Tickets from "./pages/Tickets";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public ── */}
          <Route path="/login"       element={<Login />}      />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* Redirect root to user login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── User dashboard ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["user"]}>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Admin dashboard ── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Tickets (admin only) ── */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <Tickets />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Profile (admin only) ── */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Settings (admin only) ── */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;