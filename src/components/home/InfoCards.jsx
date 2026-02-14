import React from 'react';

const InfoCards = () => {
  return (
    <div className="row g-4 mb-3 pt-3 pt-md-0">
      {/* Total Finance */}
      <div className="col-6 col-md-6 col-lg-3">
        <div className="info-card h-100 shadow-sm border">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted mb-1 fw-medium small">TOTAL FINANCE</p>
                <h5 className="display-number mb-0 text-success">300</h5>
              </div>
              <div className="card-icon bg-success-subtle text-success">
                <i className="bi bi-currency-rupee fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Loan */}
      <div className="col-6 col-md-6 col-lg-3">
        <div className="info-card h-100 shadow-sm border">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted mb-1 fw-medium small">TOTAL LOAN</p>
                <h5 className="display-number mb-0 text-primary">590</h5>
              </div>
              <div className="card-icon bg-primary-subtle text-primary  ">
                <i className="bi bi-bank fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Users */}
      <div className="col-6 col-md-6 col-lg-3">
        <div className="info-card h-100 shadow-sm border">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted mb-1 fw-medium small">TOTAL USERS</p>
                <h5 className="display-number mb-0 text-info">700</h5>
              </div>
              <div className="card-icon bg-info-subtle text-info  ">
                <i className="bi bi-people-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Staff */}
      <div className="col-6 col-md-6 col-lg-3">
        <div className="info-card h-100 shadow-sm border">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted mb-1 fw-medium small">TOTAL STAFF</p>
                <h5 className="display-number mb-0 text-warning">599</h5>
              </div>
              <div className="card-icon bg-warning-subtle text-warning  ">
                <i className="bi bi-person-badge-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards