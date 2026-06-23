import React from 'react';

const InfoCard = ({ title, value, icon, colorClass, iconBgClass, wrapperClass = "col-6 col-md-6 col-lg-3" }) => {
  return (
    <div className={wrapperClass}>
      <div className="info-card h-100 shadow-sm border">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="text-muted mb-1 fw-medium small">{title}</p>
              <h5 className={`display-number mb-0 ${colorClass}`}>
                {value}
              </h5>
            </div>
            <div className={`card-icon ${iconBgClass} ${colorClass}`}>
              <i className={`bi ${icon} fs-4`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
