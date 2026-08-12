import React from 'react';
import InfoCard from '../common/InfoCard';

const formatCount = (value) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

const InfoCards = ({ cards, loading }) => {
  const display = (value) => (loading ? '—' : formatCount(value));

  return (
    <div className="row g-4 mb-3 pt-3 pt-md-0">
      <InfoCard
        title="Total Finance"
        value={display(cards?.totalFinance)}
        icon="bi-currency-rupee"
        colorClass="text-success"
        iconBgClass="bg-success-subtle"
      />
      <InfoCard
        title="Total Loan"
        value={display(cards?.totalLoan)}
        icon="bi-bank"
        colorClass="text-primary"
        iconBgClass="bg-primary-subtle"
      />
      <InfoCard
        title="Total Users"
        value={display(cards?.totalUsers)}
        icon="bi-people-fill"
        colorClass="text-info"
        iconBgClass="bg-info-subtle"
      />
      <InfoCard
        title="Total Staff"
        value={display(cards?.totalStaff)}
        icon="bi-person-badge-fill"
        colorClass="text-warning"
        iconBgClass="bg-warning-subtle"
      />
    </div>
  );
};

export default InfoCards;
