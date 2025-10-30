// src/pages/client/ClientDashboard.jsx - UPDATED WITH ACTUAL USER DATA
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaFileInvoice,
  FaChartLine,
  FaHistory,
  FaCreditCard,
  FaCheckCircle,
  FaUserCircle,
  FaTint,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaDownload,
  FaCog,
  FaBell,
  FaWater,
  FaUsers,
} from "react-icons/fa";

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const [clientData, setClientData] = useState({
    name: "",
    wwsId: "",
    address: "",
    serviceType: "RESIDENTIAL",
    currentBalance: 0,
    lastPayment: "03/08/2023",
    nextReading: "14/09/2023",
    monthlyConsumption: "17 cu.m.",
    avgConsumption: "15.7 cu.m.",
    paymentHistory: "100%",
  });
  const [loading, setLoading] = useState(true);

  // Fetch client-specific data when component mounts or user changes
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user || !token) return;

      try {
        setLoading(true);
        
        // Use the actual user data from AuthContext with correct field names
        setClientData(prevData => ({
          ...prevData,
          name: user.name || "Client",
          wwsId: user.wws_id || user.id?.toString() || "N/A",
          address: user.address || "Address not available",
          serviceType: user.service_type || "RESIDENTIAL",
        }));

      } catch (error) {
        console.error('Failed to fetch client data:', error);
        // Fallback to basic user data
        setClientData(prevData => ({
          ...prevData,
          name: user.name || "Client",
          wwsId: user.wws_id || user.id?.toString() || "N/A",
          address: user.address || "Address not available",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user, token]);

  // Debug: log user data to see what's available
  useEffect(() => {
    if (user) {
      console.log('User data in ClientDashboard:', user);
    }
  }, [user]);

  const recentBills = [
    {
      id: 1,
      date: "03/08/2023",
      consumption: "17 cu.m.",
      amount: "₱366.85",
      status: "paid",
      dueDate: "15/08/2023",
    },
    {
      id: 2,
      date: "12/05/2022",
      consumption: "12 cu.m.",
      amount: "₱248.60",
      status: "paid",
      dueDate: "25/05/2022",
    },
    {
      id: 3,
      date: "11/10/2022",
      consumption: "18 cu.m.",
      amount: "₱390.50",
      status: "paid",
      dueDate: "25/10/2022",
    },
  ];

  const consumptionHistory = [
    { month: "Aug 2023", consumption: 17, amount: 366.85 },
    { month: "Jul 2023", consumption: 15, amount: 325.5 },
    { month: "Jun 2023", consumption: 14, amount: 305.2 },
    { month: "May 2023", consumption: 16, amount: 348.75 },
  ];

  const quickActions = [
    { icon: FaCreditCard, label: "Pay Bill", variant: "primary" },
    { icon: FaFileInvoice, label: "View Bills", variant: "outline-primary" },
    { icon: FaChartLine, label: "Usage History", variant: "outline-primary" },
    { icon: FaUserCircle, label: "Update Profile", variant: "outline-warning" },
  ];

  const accountAlerts = [
    {
      type: "success",
      message: "Account in good standing",
      details: "No pending balances",
    },
    {
      type: "info",
      message: "Next meter reading",
      details: "Scheduled for 14/09/2023",
    },
    {
      type: "warning",
      message: "Consumption alert",
      details: "18% higher than last month",
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-3">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      {/* Page Header - Fully Responsive */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
        <div className="text-start w-100">
          <h1 className="h3 mb-1 text-dark">Welcome, {clientData.name}</h1>
          <p className="text-muted mb-0">
            Your water account dashboard and services portal
          </p>
        </div>
        <div className="d-flex gap-2 w-100 w-lg-auto justify-content-start justify-content-lg-end">
          <button className="btn btn-primary d-flex align-items-center">
            <FaDownload className="me-2" />
            Export Statement
          </button>
          <button className="btn btn-outline-secondary d-flex align-items-center">
            <FaCog className="me-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Stats Overview */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-success text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Current Balance</div>
                  <div className="h4 fw-bold my-1">
                    ₱{clientData.currentBalance.toFixed(2)}
                  </div>
                  <div className="small d-flex align-items-center">
                    <FaCheckCircle className="me-1" />
                    All payments cleared
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaCreditCard size={20} className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-primary text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Monthly Consumption</div>
                  <div className="h4 fw-bold my-1">
                    {clientData.monthlyConsumption}
                  </div>
                  <div className="small">Avg: {clientData.avgConsumption}</div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaTint size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-info text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Payment History</div>
                  <div className="h4 fw-bold my-1">
                    {clientData.paymentHistory}
                  </div>
                  <div className="small d-flex align-items-center">
                    <FaCheckCircle className="me-1" />
                    On-time payments
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaHistory size={20} className="text-info" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-warning text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Next Reading</div>
                  <div className="h4 fw-bold my-1">
                    {clientData.nextReading}
                  </div>
                  <div className="small">Prepare for meter reading</div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaCalendarAlt size={20} className="text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info & Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaUserCircle className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{clientData.wwsId}</div>
                  <div className="text-muted small">WWS Account ID</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaFileInvoice className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {recentBills.length}
                  </div>
                  <div className="text-muted small">Bills This Year</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaChartLine className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {clientData.serviceType}
                  </div>
                  <div className="text-muted small">Service Type</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaCheckCircle className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">Active</div>
                  <div className="text-muted small">Account Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div
            className="card bg-primary text-white h-100"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body d-flex justify-content-between align-items-center p-3">
              <div>
                <div className="small opacity-85">Account Status</div>
                <div className="h5 mb-0">In Good Standing</div>
              </div>
              <FaCheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Recent Bills & Consumption */}
        <div className="col-xl-8">
          {/* Recent Bills */}
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                  <FaFileInvoice className="me-2 text-primary" />
                  Recent Bills
                </h5>
                <span className="badge bg-primary">
                  {recentBills.length} bills
                </span>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small fw-bold">Billing Date</th>
                      <th className="small fw-bold">Consumption</th>
                      <th className="small fw-bold">Amount</th>
                      <th className="small fw-bold">Due Date</th>
                      <th className="small fw-bold">Status</th>
                      <th className="small fw-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBills.map((bill) => (
                      <tr key={bill.id}>
                        <td className="small">{bill.date}</td>
                        <td className="small">{bill.consumption}</td>
                        <td className="fw-bold text-dark">{bill.amount}</td>
                        <td className="small">{bill.dueDate}</td>
                        <td>
                          <span className="badge bg-success small d-flex align-items-center gap-1">
                            <FaCheckCircle size={12} />
                            {bill.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-outline-primary btn-sm">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-light border-0 py-3">
              <button className="btn btn-outline-primary btn-sm">
                View All Bills
              </button>
            </div>
          </div>

          {/* Consumption History */}
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaChartLine className="me-2 text-primary" />
                Consumption History
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {consumptionHistory.map((item, index) => (
                  <div key={index} className="col-md-3 col-6">
                    <div
                      className="text-center p-3 border rounded"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="h4 fw-bold text-dark mb-1">
                        {item.consumption}
                      </div>
                      <div className="text-muted small mb-2">cu.m.</div>
                      <div className="text-muted small">{item.month}</div>
                      <div className="text-primary small fw-bold">
                        ₱{item.amount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="col-xl-4">
          {/* Quick Actions */}
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaBell className="me-2 text-warning" />
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className={`btn text-start py-2 d-flex align-items-center ${
                      action.variant !== "primary" ? "btn-outline-primary" : ""
                    }`}
                    style={{
                      borderRadius: "8px",
                      border:
                        action.variant === "primary"
                          ? "none"
                          : "1px solid var(--border-color)",
                      background:
                        action.variant === "primary"
                          ? "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)"
                          : "transparent",
                      color:
                        action.variant === "primary"
                          ? "white"
                          : "var(--text-primary)",
                      transition: "all 0.3s ease",
                      fontWeight: "500",
                    }}
                    onMouseEnter={(e) => {
                      if (action.variant === "primary") {
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(45, 90, 39, 0.3)";
                      } else {
                        e.target.style.background =
                          "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)";
                        e.target.style.color = "white";
                        e.target.style.borderColor = "transparent";
                        e.target.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (action.variant === "primary") {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      } else {
                        e.target.style.background = "transparent";
                        e.target.style.color = "var(--text-primary)";
                        e.target.style.borderColor = "var(--border-color)";
                        e.target.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <action.icon className="me-2" size={14} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Account Alerts */}
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaExclamationTriangle className="me-2 text-info" />
                Account Alerts
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {accountAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="list-group-item px-0 border-0 py-2"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark small">
                          {alert.message}
                        </div>
                        <div className="text-muted small">{alert.details}</div>
                      </div>
                      <span className={`badge bg-${alert.type} small`}>
                        {alert.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="card" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark">Service Information</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td className="text-muted small">Account ID:</td>
                      <td className="fw-bold text-dark">{clientData.wwsId}</td>
                    </tr>
                    <tr>
                      <td className="text-muted small">Service Type:</td>
                      <td className="fw-bold text-dark">
                        {clientData.serviceType}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small">Address:</td>
                      <td className="fw-bold text-dark">
                        {clientData.address}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small">Last Payment:</td>
                      <td className="fw-bold text-dark">
                        {clientData.lastPayment}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Alerts Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-warning" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-warning text-dark py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <FaBell className="me-2" />
                Important Notices
              </h5>
            </div>
            <div className="card-body py-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="alert alert-info mb-0 py-2">
                    <strong>Meter Reading Schedule</strong>
                    <div className="small">
                      Next reading: {clientData.nextReading}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-success mb-0 py-2">
                    <strong>Payment Confirmed</strong>
                    <div className="small">
                      Last payment processed successfully
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-warning mb-0 py-2">
                    <strong>Water Conservation</strong>
                    <div className="small">
                      Your consumption is above average
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}