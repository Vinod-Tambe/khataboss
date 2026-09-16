import React from 'react';
import { Link } from 'react-router-dom';
import SupportStatusBadge from './SupportStatusBadge';
import SupportStatusLabel from './SupportStatusLabel';
import { formatTicketNo, getOwnerStatusSlug } from '../../constants/supportTicket';
import { formatTicketDate } from './SupportTicketSummaryGrid';

const SupportTicketCard = ({ ticket, to, onOpen, showAdminStatus = false }) => {
  const statusSlug = getOwnerStatusSlug(ticket.st_owner_status);
  const statusClass = `support-ticket-card--status-${statusSlug}`;

  const delivery = ticket.st_expected_delivery_at
    ? formatTicketDate(ticket.st_expected_delivery_at)
    : 'Not set yet';

  const content = (
    <>
      <div className="support-ticket-card__head">
        <span className="support-ticket-card__no">{formatTicketNo(ticket.ticket_no)}</span>
        <div className="support-ticket-card__badges">
          <SupportStatusBadge kind="priority" value={ticket.st_priority} />
          {showAdminStatus && ticket.st_admin_status ? (
            <SupportStatusLabel kind="admin" value={ticket.st_admin_status} />
          ) : (
            <SupportStatusLabel kind="owner" value={ticket.st_owner_status} />
          )}
        </div>
      </div>

      <h6 className="support-ticket-card__title">{ticket.st_title}</h6>

      <div className="support-ticket-card__facts">
        <div className="support-ticket-card__fact">
          <span className="support-ticket-card__fact-label">Created</span>
          <span className="support-ticket-card__fact-value">{formatTicketDate(ticket.st_created_at)}</span>
        </div>
        <div className="support-ticket-card__fact">
          <span className="support-ticket-card__fact-label">Delivery</span>
          <span
            className={`support-ticket-card__fact-value ${
              ticket.st_expected_delivery_at ? 'support-ticket-card__fact-value--accent' : ''
            }`}
          >
            {delivery}
          </span>
        </div>
      </div>
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        className={`support-ticket-card support-ticket-card--button ${statusClass} text-decoration-none h-100 w-100`}
        onClick={() => onOpen(ticket)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className={`support-ticket-card ${statusClass} text-decoration-none h-100`}>
      {content}
    </Link>
  );
};

export default SupportTicketCard;
