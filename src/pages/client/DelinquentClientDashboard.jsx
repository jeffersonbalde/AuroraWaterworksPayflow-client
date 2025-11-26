// src/pages/client/DelinquentClientDashboard.jsx
import { useAuth } from '../../contexts/AuthContext';

export default function DelinquentClientDashboard() {
  const { user } = useAuth();

  return (
    <div className="container-fluid px-4 py-4">
      {/* Warning Banner */}
      <div className="alert alert-warning d-flex align-items-center mb-4">
        <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
        <div>
          <h5 className="alert-heading mb-1">Account Status: Delinquent</h5>
          <p className="mb-0">
            Your account has been marked as delinquent due to outstanding payments. 
            Please settle your balance to restore full access to your account features.
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 fw-bold text-dark">
                <i className="fas fa-tachometer-alt me-2 text-warning"></i>
                Delinquent Account Dashboard
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Account Status Card */}
                <div className="col-md-6 mb-4">
                  <div className="card border-warning">
                    <div className="card-body">
                      <h6 className="card-title text-warning">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Account Status
                      </h6>
                      <p className="mb-2">Your account is currently <strong className="text-warning">Delinquent</strong></p>
                      <small className="text-muted">
                        This means you have outstanding payments that need to be settled.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="col-md-6 mb-4">
                  <div className="card border-0" style={{ backgroundColor: '#fff8e1' }}>
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="fas fa-clock me-2 text-warning"></i>
                        Required Actions
                      </h6>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                          <i className="fas fa-money-bill-wave me-2 text-success"></i>
                          Settle outstanding balance
                        </li>
                        <li className="mb-2">
                          <i className="fas fa-phone me-2 text-primary"></i>
                          Contact customer service
                        </li>
                        <li>
                          <i className="fas fa-file-invoice me-2 text-info"></i>
                          Review payment history
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Limited Access Notice */}
                <div className="col-12">
                  <div className="card border-light">
                    <div className="card-body text-center py-4">
                      <i className="fas fa-user-lock fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">Limited Access</h5>
                      <p className="text-muted mb-0">
                        Some features may be restricted until your account status is updated to active.
                      </p>
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