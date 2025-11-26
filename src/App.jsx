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
import Layout from './layout/SidebarLayout';

// Common Pages
import Profile from "./pages/common/Profile";
import Settings from "./pages/common/Setting";

// Unified Dashboard Component
import UnifiedDashboard from "./components/UnifiedDashboard";

// Management Pages/management/customers
import AccountApprovals from "./pages/admin_staff/AccountApprovals";
import CustomerManagement from "./pages/admin_staff/CustomerManagement/CustomerManagement";
import BillingManagement from "./pages/admin_staff/BillingManagement/BillingManagement";
import StaffManagement from "./pages/admin/StaffManagement/StaffManagement";
import MyBills from "./pages/client/MyBills";
import PaymentHistory from "./pages/client/PaymentHistory/PaymentHistory";
import WaterUsage from "./pages/client/WaterUsage/WaterUsage";
import MakePayment from "./pages/client/MakePayment/MakePayment";
import MeterReading from "./pages/admin_staff/MeterReading/MeterReading";
import PaymentTracking from "./pages/admin_staff/PaymentTracking/PaymentTracking";
import CollectionReports from "./pages/admin_staff/CollectionReports/CollectionReports";

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
                <MeterReading />
              </Layout>
            </AdminStaffRoute>
          } />

          <Route path="/management/payments" element={
            <AdminStaffRoute>
              <Layout>
                <PaymentTracking />
              </Layout>
            </AdminStaffRoute>
          } />

          <Route path="/management/reports" element={
            <AdminStaffRoute>
              <Layout>
                <CollectionReports />
              </Layout>
            </AdminStaffRoute>
          } />

          {/* CLIENT-ONLY ROUTES - ADD THESE HERE */}
          <Route path="/my-bills" element={
            <ClientRoute>
              <Layout>
                <MyBills />
              </Layout>
            </ClientRoute>
          } />

          <Route path="/payment-history" element={
            <ClientRoute>
              <Layout>
                <PaymentHistory />
              </Layout>
            </ClientRoute>
          } />

          <Route path="/water-usage" element={
            <ClientRoute>
              <Layout>
                <WaterUsage />
              </Layout>
            </ClientRoute>
          } />

          <Route path="/make-payment" element={
            <ClientRoute>
              <Layout>
                <MakePayment />
              </Layout>
            </ClientRoute>
          } />

          {/* ADMIN-ONLY ROUTES (if any) */}
          <Route path="/management/staff" element={
            <ProtectedRoute>
              <Layout>
                {/* <div className="container-fluid px-4 py-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="fas fa-users-cog fa-3x text-primary mb-3"></i>
                      <h2>Staff Management</h2>
                      <p className="text-muted">Admin-only feature in development</p>
                    </div>
                  </div>
                </div> */}
                <StaffManagement />
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