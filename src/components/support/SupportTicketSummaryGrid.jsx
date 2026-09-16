import React from 'react';
import SupportStatusBadge from './SupportStatusBadge';
import SupportStatusLabel from './SupportStatusLabel';
import { formatDateTime } from '../../utils/dateFormat';

export const formatTicketDate = (value) => {
  const formatted = formatDateTime(value);
  return formatted || '—';
};

const SupportTicketSummaryGrid = ({ ticket, compact = false }) => {
  if (!ticket) return null;

  const delivery = ticket.st_expected_delivery_at
    ? formatTicketDate(ticket.st_expected_delivery_at)
    : 'Not set yet';

  return (
    <ul
      className={`support-ticket-summary list-unstyled mb-0 ${
        compact ? 'support-ticket-summary--compact' : ''
      }`}
    >
      <li className="support-ticket-summary__item">
        <span className="support-ticket-summary__label">Priority</span>
        <span className="support-ticket-summary__value">
          <SupportStatusBadge kind="priority" value={ticket.st_priority} />
        </span>
      </li>
      <li className="support-ticket-summary__item">
        <span className="support-ticket-summary__label">Status</span>
        <span className="support-ticket-summary__value">
          <SupportStatusLabel kind="owner" value={ticket.st_owner_status} />
        </span>
      </li>
      <li className="support-ticket-summary__item">
        <span className="support-ticket-summary__label">Created</span>
        <span className="support-ticket-summary__value support-ticket-summary__text">
          {formatTicketDate(ticket.st_created_at)}
        </span>
      </li>
      <li className="support-ticket-summary__item">
        <span className="support-ticket-summary__label">Delivery</span>
        <span
          className={`support-ticket-summary__value support-ticket-summary__text ${
            ticket.st_expected_delivery_at ? 'support-ticket-summary__text--emphasis' : ''
          }`}
        >
          {delivery}
        </span>
      </li>
    </ul>
  );
};

export default SupportTicketSummaryGrid;
