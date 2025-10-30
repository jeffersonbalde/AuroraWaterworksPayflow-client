// src/pages/admin/AdminDashboard.jsx - FIXED ICON COLORS
import { 
  FaUsers, 
  FaFileInvoice, 
  FaChartBar, 
  FaMoneyCheckAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaWater,
  FaUserCheck,
  FaHistory,
  FaDownload,
  FaCog,
  FaBell,
  FaChartLine,
  FaDatabase
} from "react-icons/fa";

export default function AdminDashboard() {
  const stats = {
    totalCustomers: 1847,
    pendingApprovals: 23,
    totalRevenue: 2450000,
    delinquentAccounts: 45,
    activeConnections: 1782,
    monthlyConsumption: 12500,
    staffMembers: 15,
    systemUptime: 99.8
  };

  const recentActivities = [
    { id: 1, action: "New customer registration", user: "Juan Dela Cruz", time: "2 mins ago", status: "pending", type: "registration" },
    { id: 2, action: "Payment received via GCash", user: "Maria Santos", time: "15 mins ago", status: "completed", type: "payment" },
    { id: 3, action: "Meter reading updated", user: "Pedro Reyes", time: "1 hour ago", status: "completed", type: "meter" },
    { id: 4, action: "Bill dispute resolved", user: "Ana Lopez", time: "3 hours ago", status: "completed", type: "dispute" },
    { id: 5, action: "New staff account created", user: "Admin System", time: "5 hours ago", status: "completed", type: "staff" },
    { id: 6, action: "System backup completed", user: "System", time: "6 hours ago", status: "completed", type: "system" }
  ];

  const quickStats = [
    { label: "Collection Rate", value: "98.2%", trend: "+1.2%", positive: true },
    { label: "Water Production", value: "15,200 m³", trend: "+450 m³", positive: true },
    { label: "Avg Consumption", value: "8.3 m³", trend: "-0.2 m³", positive: true },
    { label: "System Efficiency", value: "94.7%", trend: "+2.1%", positive: true }
  ];

  const priorityTasks = [
    { task: "Approve pending registrations", priority: "high", count: 23 },
    { task: "Review delinquent accounts", priority: "high", count: 45 },
    { task: "Update billing rates", priority: "medium", count: 1 },
    { task: "Generate monthly report", priority: "medium", count: 1 },
    { task: "Staff performance review", priority: "low", count: 15 }
  ];

  const waterQualityMetrics = [
    { parameter: "pH Level", value: "7.2", status: "optimal", range: "6.5-8.5" },
    { parameter: "Chlorine (ppm)", value: "2.1", status: "optimal", range: "1.0-4.0" },
    { parameter: "Turbidity (NTU)", value: "0.8", status: "optimal", range: "<5.0" },
    { parameter: "Pressure (psi)", value: "45", status: "good", range: "40-80" }
  ];

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      {/* Page Header - Fully Responsive */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
        <div className="text-start w-100">
          <h1 className="h3 mb-1 text-dark">System Administration</h1>
          <p className="text-muted mb-0">Welcome back! Here's your system overview for today.</p>
        </div>
        <div className="d-flex gap-2 w-100 w-lg-auto justify-content-start justify-content-lg-end">
          <button className="btn btn-primary d-flex align-items-center">
            <FaDownload className="me-2" />
            Export Report
          </button>
          <button className="btn btn-outline-secondary d-flex align-items-center">
            <FaCog className="me-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Stats Overview - FIXED ICON COLORS */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card bg-primary text-white mb-3" style={{ borderRadius: '10px' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Total Customers</div>
                  <div className="h4 fw-bold my-1">{stats.totalCustomers.toLocaleString()}</div>
                  <div className="small d-flex align-items-center">
                    <FaChartLine className="me-1" />
                    +12 this week
                  </div>
                </div>
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaUsers size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card bg-warning text-white mb-3" style={{ borderRadius: '10px' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Pending Approvals</div>
                  <div className="h4 fw-bold my-1">{stats.pendingApprovals}</div>
                  <div className="small">Requires attention</div>
                </div>
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaUserCheck size={20} className="text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card bg-success text-white mb-3" style={{ borderRadius: '10px' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Monthly Revenue</div>
                  <div className="h4 fw-bold my-1">₱{stats.totalRevenue.toLocaleString()}</div>
                  <div className="small d-flex align-items-center">
                    <FaChartLine className="me-1" />
                    +8.5% from last month
                  </div>
                </div>
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaMoneyCheckAlt size={20} className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card bg-danger text-white mb-3" style={{ borderRadius: '10px' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Delinquent Accounts</div>
                  <div className="h4 fw-bold my-1">{stats.delinquentAccounts}</div>
                  <div className="small">Over 30 days due</div>
                </div>
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaExclamationTriangle size={20} className="text-danger" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats & System Status */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: '10px' }}>
                <div className="card-body text-center p-3">
                  <FaWater className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.activeConnections}</div>
                  <div className="text-muted small">Active Connections</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: '10px' }}>
                <div className="card-body text-center p-3">
                  <FaChartBar className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.monthlyConsumption.toLocaleString()} m³</div>
                  <div className="text-muted small">Monthly Usage</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: '10px' }}>
                <div className="card-body text-center p-3">
                  <FaUsers className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.staffMembers}</div>
                  <div className="text-muted small">Staff Members</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: '10px' }}>
                <div className="card-body text-center p-3">
                  <FaDatabase className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.systemUptime}%</div>
                  <div className="text-muted small">System Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-4">
          <div className="card bg-primary text-white h-100" style={{ borderRadius: '10px' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-3">
              <div>
                <div className="small opacity-85">System Status</div>
                <div className="h5 mb-0">All Systems Normal</div>
              </div>
              <FaCheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Recent Activities */}
        <div className="col-xl-8">
          <div className="card mb-4" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                  <FaHistory className="me-2 text-primary" />
                  Recent Activities
                </h5>
                <span className="badge bg-primary">{recentActivities.length} new</span>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="list-group-item d-flex align-items-center border-bottom py-3 px-3">
                    <div className="me-3">
                      {activity.status === "pending" ? (
                        <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <FaClock size={16} className="text-white" />
                        </div>
                      ) : (
                        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <FaCheckCircle size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold text-dark small">{activity.action}</div>
                      <div className="text-muted small">
                        <FaUsers className="me-1" />
                        {activity.user}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">{activity.time}</div>
                      <span className={`badge bg-${activity.type === 'payment' ? 'success' : activity.type === 'registration' ? 'warning' : 'info'} small`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer bg-light border-0 py-3">
              <button className="btn btn-outline-primary btn-sm">
                View All Activities
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card mb-4" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaChartLine className="me-2 text-primary" />
                Performance Metrics
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {quickStats.map((stat, index) => (
                  <div key={index} className="col-md-3 col-6">
                    <div className="text-center p-3 border rounded" style={{ borderRadius: '8px' }}>
                      <div className="h4 fw-bold text-dark mb-1">{stat.value}</div>
                      <div className="text-muted small mb-2">{stat.label}</div>
                      <span className={`badge bg-${stat.positive ? 'success' : 'danger'} small`}>
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="col-xl-4">
          {/* Priority Tasks */}
          <div className="card mb-4" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaBell className="me-2 text-warning" />
                Priority Tasks
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {priorityTasks.map((task, index) => (
                  <div key={index} className="list-group-item px-0 border-0 py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark small">{task.task}</div>
                        <div className="text-muted small">{task.count} items</div>
                      </div>
                      <span className={`badge bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'secondary'} small`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Water Quality */}
          <div className="card mb-4" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaWater className="me-2 text-info" />
                Water Quality
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-borderless">
                  <thead>
                    <tr>
                      <th className="text-dark small">Parameter</th>
                      <th className="text-dark small">Value</th>
                      <th className="text-dark small">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterQualityMetrics.map((metric, index) => (
                      <tr key={index}>
                        <td className="text-muted small">{metric.parameter}</td>
                        <td className="fw-bold text-dark">{metric.value}</td>
                        <td>
                          <span className={`badge bg-${metric.status === 'optimal' ? 'success' : 'warning'} small`}>
                            {metric.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-primary text-start py-2">
                  <FaUsers className="me-2" />
                  Customer Management
                </button>
                <button className="btn btn-outline-primary text-start py-2">
                  <FaFileInvoice className="me-2" />
                  Billing & Invoices
                </button>
                <button className="btn btn-outline-primary text-start py-2">
                  <FaChartBar className="me-2" />
                  Analytics & Reports
                </button>
                <button className="btn btn-outline-warning text-start py-2">
                  <FaUserCheck className="me-2" />
                  Staff Management
                </button>
                <button className="btn btn-outline-info text-start py-2">
                  <FaWater className="me-2" />
                  Water Distribution
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-warning" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-warning text-dark py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <FaExclamationTriangle className="me-2" />
                System Alerts
              </h5>
            </div>
            <div className="card-body py-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="alert alert-warning mb-0 py-2">
                    <strong>Maintenance Scheduled</strong>
                    <div className="small">Saturday, 2:00 AM - 4:00 AM</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-info mb-0 py-2">
                    <strong>Backup Completed</strong>
                    <div className="small">Daily system backup successful</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-success mb-0 py-2">
                    <strong>All Systems Operational</strong>
                    <div className="small">No critical issues detected</div>
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