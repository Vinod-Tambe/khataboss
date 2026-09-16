import React from 'react';
import {
  ADMIN_STATUS_LABELS,
  OWNER_STATUS_LABELS,
} from '../../constants/supportTicket';
import SupportStatusDot from './SupportStatusDot';

const SupportStatusLabel = ({ kind = 'owner', value, className = '' }) => {
  if (!value) return null;
  const label =
    kind === 'admin'
      ? ADMIN_STATUS_LABELS[value] || value
      : OWNER_STATUS_LABELS[value] || value;

  return (
    <span className={`support-status-label ${className}`.trim()}>
      <SupportStatusDot kind={kind} value={value} />
      <span className="support-status-label__text">{label}</span>
    </span>
  );
};

export default SupportStatusLabel;
