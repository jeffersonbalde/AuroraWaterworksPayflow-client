// src/App.jsx - UPDATED WITH CLIENT ROUTES
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "./services/notificationService";

// Route Components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminStaffRoute from "./components/AdminStaffRoute";
import ClientRoute from "./components/ClientRoute";
import AdminClientRoute from "./components/AdminClientRoute"; // ADD THIS IMPORT

// Public Pages
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import NotFound from "./pages/public/NotFound";
import Unauthorized from "./pages/public/Unauthorized";

// Import Layout
import Layout from './layout/layout';

// Common Pages
import Profile from "./pages/common/Profile";
import Settings from "./pages/common/Setting";

// Unified Dashboard Component
import UnifiedDashboard from "./components/UnifiedDashboard";

// Management Pages
import AccountApprovals from "./pages/admin_staff/AccountApprovals";
import CustomerManagement from "./pages/admin_staff/CustomerManagement";
import BillingManagement from "./pages/admin_staff/BillingManagement";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Common Routes for All Authenticated Users */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Settings Route - Only for Admin and Client */}
          <Route path="/settings" element={
            <AdminClientRoute>
              <Layout>
                <Settings />
              </Layout>
            </AdminClientRoute>
          } />

          {/* SINGLE DASHBOARD ROUTE FOR ALL USERS */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <UnifiedDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* UNIFIED MANAGEMENT ROUTES - For Both Admin & Staff */}
          <Route path="/management/approvals" element={
            <AdminStaffRoute>
              <Layout>
                <AccountApprovals />
              </Layout>
            </AdminStaffRoute>
          } />

          <Route path="/management/customers" element={
            <AdminStaffRoute>
              <Layout>
                <CustomerManagement />
              </Layout>
            </AdminStaffRoute>
          } />

          <Route path="/management/billing" element={
            <AdminStaffRoute>
              <Layout>
                <BillingManagement />
              </Layout>
            </AdminStaffRoute>
          } />

          <Route path="/management/meter-reading" element={
            <AdminStaffRoute>
              <Layout>
                <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-tachometer-alt fa-3x text-primary mb-3"></i>
                      <h2>Meter Reading</h2>
                      <p className="text-muted">Feature in development</p>
                    </div>
                  </div>
                </div>
              </Layout>
            </AdminStaffRoute>
          } />

          <Route path="/management/payments" element={
            <AdminStaffRoute>
              <Layout>
                <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-money-bill-wave fa-3x text-primary mb-3"></i>
                      <h2>Payment Tracking</h2>
                      <p className="text-muted">Feature in development</p>
                    </div>
                  </div>
                </div>
              </Layout>
            </AdminStaffRoute>
          } />

          <Route path="/management/reports" element={
            <AdminStaffRoute>
              <Layout>
                <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-file-alt fa-3x text-primary mb-3"></i>
                      <h2>Collection Reports</h2>
                      <p className="text-muted">Feature in development</p>
                    </div>
                  </div>
                </div>
              </Layout>
            </AdminStaffRoute>
          } />

          {/* CLIENT-ONLY ROUTES - ADD THESE HERE */}
          <Route path="/my-bills" element={
            <ClientRoute>
              <Layout>
                <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-file-invoice-dollar fa-3x text-primary mb-3"></i>
                      <h2>My Bills</h2>
                      <p className="text-muted">Feature in development</p>
                    </div>
                  </div>
                </div>
              </Layout>
            </ClientRoute>
          } />

          <Route path="/payment-history" element={
            <ClientRoute>
              <Layout>
                <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-history fa-3x text-primary mb-3"></i>
                      <h2>Payment History</h2>
                      <p className="text-muted">Feature in development</p>
                    </div>
                  </div>
                </div>
              </Layout>
            </ClientRoute>
          } />

          <Route path="/water-usage" element={
            <ClientRoute>
              <Layout>
                <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-water fa-3x text-primary mb-3"></i>
                      <h2>Water Usage</h2>
                      <p className="text-muted">Feature in development</p>
                    </div>
                  </div>
                </div>
              </Layout>
            </ClientRoute>
          } />

          <Route path="/make-payment" element={
            <ClientRoute>
              <Layout>
                <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-credit-card fa-3x text-primary mb-3"></i>
                      <h2>Make Payment</h2>
                      <p className="text-muted">Feature in development</p>
                    </div>
                  </div>
                </div>
              </Layout>
            </ClientRoute>
          } />

          {/* ADMIN-ONLY ROUTES (if any) */}
          <Route path="/management/staff" element={
            <ProtectedRoute>
              <Layout>
                <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-users-cog fa-3x text-primary mb-3"></i>
                      <h2>Staff Management</h2>
                      <p className="text-muted">Admin-only feature in development</p>
                    </div>
                  </div>
                </div>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;