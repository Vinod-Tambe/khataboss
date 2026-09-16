import React from 'react';
import {
  ADMIN_STATUS_LABELS,
  OWNER_STATUS_LABELS,
  PRIORITY_LABELS,
} from '../../constants/supportTicket';

const variantMap = {
  Urgent: 'danger',
  High: 'warning',
  Medium: 'primary',
  Low: 'secondary',
  Cancelled: 'dark',
  Delivered: 'success',
  Done: 'success',
  Testing: 'info',
  Development: 'info',
  InProgress: 'info',
  ReadyForTesting: 'info',
};

const SupportStatusBadge = ({ kind, value, className = '' }) => {
  if (!value) return null;
  const label =
    kind === 'admin'
      ? ADMIN_STATUS_LABELS[value] || value
      : kind === 'owner'
        ? OWNER_STATUS_LABELS[value] || value
        : PRIORITY_LABELS[value] || value;
  const variant = variantMap[value] || 'secondary';

  return (
    <span
      className={`support-status-badge support-status-badge--${variant} ${className}`.trim()}
      data-variant={variant}
    >
      {label}
    </span>
  );
};

export default SupportStatusBadge;
