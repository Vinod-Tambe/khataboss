import React from 'react';
import { getAdminStatusSlug, getOwnerStatusSlug } from '../../constants/supportTicket';

const SupportStatusDot = ({ kind = 'owner', value, className = '', title }) => {
  if (!value) return null;
  const slug =
    kind === 'admin' ? getAdminStatusSlug(value) : getOwnerStatusSlug(value);
  return (
    <span
      className={`support-status-dot support-status-dot--${kind}-${slug} ${className}`.trim()}
      title={title}
      aria-hidden="true"
    />
  );
};

export default SupportStatusDot;
