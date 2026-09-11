import React from 'react';
import NewsPanel from './NewsPanel';
import DashboardQuickActions from './DashboardQuickActions';

const DashboardHomeSection = ({ firms, selectedFirmId }) => (
  <div className="row g-3 g-lg-4 mb-3 dashboard-home-section">
    <div className="col-12 col-lg-6">
      <DashboardQuickActions firms={firms} selectedFirmId={selectedFirmId} />
    </div>
    <div className="col-12 col-lg-6">
      <NewsPanel />
    </div>
  </div>
);

export default DashboardHomeSection;
