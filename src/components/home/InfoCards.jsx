import React from 'react';
import InfoCard from '../common/InfoCard';

const InfoCards = () => {
  return (
    <div className="row g-4 mb-3 pt-3 pt-md-0">
      <InfoCard
        title="TOTAL FINANCE"
        value="300"
        icon="bi-currency-rupee"
        colorClass="text-success"
        iconBgClass="bg-success-subtle"
      />
      <InfoCard
        title="TOTAL LOAN"
        value="590"
        icon="bi-bank"
        colorClass="text-primary"
        iconBgClass="bg-primary-subtle"
      />
      <InfoCard
        title="TOTAL USERS"
        value="700"
        icon="bi-people-fill"
        colorClass="text-info"
        iconBgClass="bg-info-subtle"
      />
      <InfoCard
        title="TOTAL STAFF"
        value="599"
        icon="bi-person-badge-fill"
        colorClass="text-warning"
        iconBgClass="bg-warning-subtle"
      />
    </div>
  );
};

export default InfoCards;