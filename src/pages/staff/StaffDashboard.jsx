// src/pages/staff/StaffDashboard.jsx - MODIFIED TO MATCH ADMIN DASHBOARD STRUCTURE
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
  FaDatabase,
  FaSearch,
  FaMapMarkerAlt,
  FaTasks,
  FaClipboardList
} from "react-icons/fa";

export default function StaffDashboard() {
  const stats = {
    assignedCustomers: 450,
    pendingReadings: 15,
    pendingPayments: 8,
    totalCollections: 125000,
    completedTasks: 32,
    monthlyTarget: 500,
    customerSatisfaction: 94.5,
    efficiencyRate: 88.2
  };

  const recentActivities = [
    { id: 1, action: "Meter reading completed", user: "Juan Dela Cruz", time: "30 mins ago", status: "completed", type: "reading" },
    { id: 2, action: "Payment collected via cash", user: "Maria Santos", time: "1 hour ago", status: "completed", type: "payment" },
    { id: 3, action: "New customer application", user: "Pedro Reyes", time: "2 hours ago", status: "pending", type: "application" },
    { id: 4, action: "Bill dispute logged", user: "Ana Lopez", time: "3 hours ago", status: "pending", type: "dispute" },
    { id: 5, action: "Route assignment updated", user: "Supervisor", time: "4 hours ago", status: "completed", type: "route" },
    { id: 6, action: "Daily report submitted", user: "System", time: "5 hours ago", status: "completed", type: "report" }
  ];

  const performanceMetrics = [
    { label: "Readings Accuracy", value: "99.1%", trend: "+0.5%", positive: true },
    { label: "Collection Rate", value: "95.8%", trend: "+2.3%", positive: true },
    { label: "Avg Task Time", value: "18 min", trend: "-3 min", positive: true },
    { label: "Customer Rating", value: "4.7/5", trend: "+0.2", positive: true }
  ];

  const todaysTasks = [
    { task: "Complete meter readings - Zone 5", priority: "high", count: 25 },
    { task: "Process pending payments", priority: "high", count: 8 },
    { task: "Verify new applications", priority: "medium", count: 12 },
    { task: "Update customer records", priority: "medium", count: 5 },
    { task: "Submit daily report", priority: "low", count: 1 }
  ];

  const assignedAreas = [
    { area: "Poblacion Central", customers: 120, completed: 45, status: "in-progress" },
    { area: "Zone 5-A", customers: 85, completed: 85, status: "completed" },
    { area: "San Isidro Village", customers: 95, completed: 60, status: "in-progress" },
    { area: "Market Area", customers: 150, completed: 25, status: "pending" }
  ];

  return (
    <div className="container-fluid px-3 px-md-4 py-3">
      {/* Page Header - Fully Responsive */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
<div className="text-start w-100">
  <h1 className="h3 mb-1 text-dark">Daily Operations</h1>
  <p className="text-muted mb-0">Overview of today's tasks and performance metrics.</p>
</div>
        <div className="d-flex gap-2 w-100 w-lg-auto justify-content-start justify-content-lg-end">
          <button className="btn btn-primary d-flex align-items-center">
            <FaDownload className="me-2" />
            Daily Report
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
                  <div className="text-white-50 small">Assigned Customers</div>
                  <div className="h4 fw-bold my-1">{stats.assignedCustomers.toLocaleString()}</div>
                  <div className="small d-flex align-items-center">
                    <FaChartLine className="me-1" />
                    {stats.monthlyTarget} monthly target
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
                  <div className="text-white-50 small">Pending Readings</div>
                  <div className="h4 fw-bold my-1">{stats.pendingReadings}</div>
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
                  <div className="text-white-50 small">Today's Collections</div>
                  <div className="h4 fw-bold my-1">₱{stats.totalCollections.toLocaleString()}</div>
                  <div className="small d-flex align-items-center">
                    <FaChartLine className="me-1" />
                    +15.2% from yesterday
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
                  <div className="text-white-50 small">Pending Payments</div>
                  <div className="h4 fw-bold my-1">{stats.pendingPayments}</div>
                  <div className="small">Follow up required</div>
                </div>
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <FaExclamationTriangle size={20} className="text-danger" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats & Performance Status */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: '10px' }}>
                <div className="card-body text-center p-3">
                  <FaTasks className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.completedTasks}</div>
                  <div className="text-muted small">Tasks Completed</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: '10px' }}>
                <div className="card-body text-center p-3">
                  <FaChartBar className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.efficiencyRate}%</div>
                  <div className="text-muted small">Efficiency Rate</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: '10px' }}>
                <div className="card-body text-center p-3">
                  <FaUsers className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">{stats.customerSatisfaction}%</div>
                  <div className="text-muted small">Satisfaction Rate</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="card border-0 bg-light h-100" style={{ borderRadius: '10px' }}>
                <div className="card-body text-center p-3">
                  <FaClipboardList className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">4/8</div>
                  <div className="text-muted small">Areas Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-4">
          <div className="card bg-success text-white h-100" style={{ borderRadius: '10px' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-3">
              <div>
                <div className="small opacity-85">Performance Status</div>
                <div className="h5 mb-0">Ahead of Schedule</div>
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
                <span className="badge bg-primary">{recentActivities.length} activities</span>
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
                      <span className={`badge bg-${activity.type === 'payment' ? 'success' : activity.type === 'reading' ? 'info' : 'warning'} small`}>
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
                {performanceMetrics.map((stat, index) => (
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
          {/* Today's Tasks */}
          <div className="card mb-4" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaBell className="me-2 text-warning" />
                Today's Tasks
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {todaysTasks.map((task, index) => (
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

          {/* Assigned Areas */}
          <div className="card mb-4" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaMapMarkerAlt className="me-2 text-info" />
                Assigned Areas
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-borderless">
                  <thead>
                    <tr>
                      <th className="text-dark small">Area</th>
                      <th className="text-dark small">Progress</th>
                      <th className="text-dark small">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedAreas.map((area, index) => (
                      <tr key={index}>
                        <td className="text-muted small">{area.area}</td>
                        <td className="fw-bold text-dark">{area.completed}/{area.customers}</td>
                        <td>
                          <span className={`badge bg-${area.status === 'completed' ? 'success' : area.status === 'in-progress' ? 'warning' : 'secondary'} small`}>
                            {area.status}
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
                  <FaUserCheck className="me-2" />
                  Start Meter Reading
                </button>
                <button className="btn btn-outline-primary text-start py-2">
                  <FaMoneyCheckAlt className="me-2" />
                  Process Payments
                </button>
                <button className="btn btn-outline-primary text-start py-2">
                  <FaFileInvoice className="me-2" />
                  Generate Bills
                </button>
                <button className="btn btn-outline-warning text-start py-2">
                  <FaUsers className="me-2" />
                  Customer Lookup
                </button>
                <button className="btn btn-outline-info text-start py-2">
                  <FaClipboardList className="me-2" />
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Summary Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-info" style={{ borderRadius: '10px' }}>
            <div className="card-header bg-info text-white py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <FaChartBar className="me-2" />
                Daily Summary
              </h5>
            </div>
            <div className="card-body py-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="alert alert-success mb-0 py-2">
                    <strong>Tasks Completed</strong>
                    <div className="small">{stats.completedTasks} out of 40 daily target</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-warning mb-0 py-2">
                    <strong>Pending Actions</strong>
                    <div className="small">{stats.pendingReadings + stats.pendingPayments} items need attention</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="alert alert-info mb-0 py-2">
                    <strong>Next Route</strong>
                    <div className="small">Market Area - 25 customers</div>
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