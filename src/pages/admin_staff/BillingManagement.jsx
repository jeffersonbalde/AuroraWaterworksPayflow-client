// src/pages/admin_staff/BillingManagement.jsx
export default function BillingManagement() {
  return (
    <div className="container-fluid px-4 py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="mb-4">
            <i className="fas fa-file-invoice-dollar fa-3x text-primary mb-3"></i>
            <h2 className="h4 text-dark">Billing Management</h2>
            <p className="text-muted">Manage billing and payment systems</p>
          </div>
          <div className="alert alert-info mx-auto" style={{maxWidth: '500px'}}>
            <i className="fas fa-tools me-2"></i>
            <strong>Coming Soon</strong>
            <p className="mb-0 mt-2">Billing management features are currently in development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}