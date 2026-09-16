import React from 'react';
import SupportStatusBadge from '../../components/support/SupportStatusBadge';
import SupportStatusSelect from '../../components/support/SupportStatusSelect';
import { formatTicketDate } from '../../components/support/SupportTicketSummaryGrid';
import {
  ADMIN_TICKET_STATUSES,
  ADMIN_STATUS_LABELS,
  OWNER_TICKET_STATUSES,
  OWNER_STATUS_LABELS,
  formatTicketNo,
  getAdminStatusSlug,
  truncateText,
  SUPPORT_TITLE_MAX,
} from '../../constants/supportTicket';

const formatOwnerName = (owner) => {
  if (!owner) return '—';
  if (owner.name?.trim()) return owner.name.trim();
  const parts = [owner.own_first_name, owner.own_middle_name, owner.own_last_name].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return owner.own_login_id || owner.own_mobile_no || owner.own_email || 'Owner';
};

const SupportTicketAdminCard = ({
  ticket,
  variant = 'board',
  isMoving = false,
  statusUpdating = false,
  onOpen,
  onStatusChange,
  onDragStart,
  onDragEnd,
}) => {
  const delivery = ticket.st_expected_delivery_at
    ? formatTicketDate(ticket.st_expected_delivery_at)
    : 'Not set yet';

  const started = formatTicketDate(ticket.st_created_at) || '—';
  const ownerName = formatOwnerName(ticket.owner);

  const stopCardAction = (e) => {
    e.stopPropagation();
  };

  const handleAdminStatus = (value) => {
    if (value && value !== ticket.st_admin_status) {
      onStatusChange?.(ticket, { st_admin_status: value });
    }
  };

  const handleOwnerStatus = (value) => {
    if (value && value !== ticket.st_owner_status) {
      onStatusChange?.(ticket, { st_owner_status: value });
    }
  };

  const adminStatusOptions = ADMIN_TICKET_STATUSES.map((s) => ({
    value: s,
    label: ADMIN_STATUS_LABELS[s],
  }));

  const ownerStatusOptions = OWNER_TICKET_STATUSES.map((s) => ({
    value: s,
    label: OWNER_STATUS_LABELS[s],
  }));

  const handleCardClick = () => {
    onOpen?.(ticket);
  };

  const isBoard = variant === 'board';
  const adminStatusSlug = getAdminStatusSlug(ticket.st_admin_status);
  const adminStatusClass = `support-ticket-card--admin-status-${adminStatusSlug}`;
  const boardStatusClass = `support-board__card--admin-status-${adminStatusSlug}`;
  const rootClass = isBoard
    ? `support-board__card ${boardStatusClass} ${isMoving ? 'is-moving' : ''}`
    : `support-ticket-card support-ticket-card--admin ${adminStatusClass} h-100`;

  return (
    <div
      className={rootClass}
      draggable={isBoard}
      onDragStart={
        isBoard
          ? (e) => {
              if (e.target.closest('.support-admin-card__statuses')) {
                e.preventDefault();
                return;
              }
              onDragStart?.(e);
            }
          : undefined
      }
      onDragEnd={isBoard ? onDragEnd : undefined}
      onClick={handleCardClick}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.support-admin-card__statuses')) return;
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className={isBoard ? 'support-board__card-top' : 'support-ticket-card__head'}>
        <span className={isBoard ? 'support-board__card-id' : 'support-ticket-card__no'}>
          {formatTicketNo(ticket.ticket_no)}
        </span>
        <SupportStatusBadge kind="priority" value={ticket.st_priority} />
      </div>

      <p className="support-admin-card__owner small mb-2">
        <span className="support-admin-card__owner-label">Created by</span>
        <span className="support-admin-card__owner-name">{ownerName}</span>
      </p>

      <div className={isBoard ? 'support-board__card-title' : 'support-ticket-card__title'}>
        {truncateText(ticket.st_title, SUPPORT_TITLE_MAX)}
      </div>

      <div className="support-ticket-card__facts support-admin-card__facts">
        <div className="support-ticket-card__fact">
          <span className="support-ticket-card__fact-label">Start date</span>
          <span className="support-ticket-card__fact-value">{started}</span>
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

      <div
        className="support-admin-card__statuses"
        onClick={stopCardAction}
        onMouseDown={stopCardAction}
      >
        <div className="support-admin-card__status-field">
          <label className="support-admin-card__status-label" htmlFor={`admin-st-${ticket.st_uuid}`}>
            Admin status
          </label>
          <SupportStatusSelect
            id={`admin-st-${ticket.st_uuid}`}
            kind="admin"
            value={ticket.st_admin_status || 'Todo'}
            options={adminStatusOptions}
            disabled={statusUpdating}
            onChange={handleAdminStatus}
            size="sm"
          />
        </div>
        <div className="support-admin-card__status-field">
          <label className="support-admin-card__status-label" htmlFor={`owner-st-${ticket.st_uuid}`}>
            Owner status
          </label>
          <SupportStatusSelect
            id={`owner-st-${ticket.st_uuid}`}
            kind="owner"
            value={ticket.st_owner_status || 'Sent'}
            options={ownerStatusOptions}
            disabled={statusUpdating}
            onChange={handleOwnerStatus}
            size="sm"
          />
        </div>
      </div>

    </div>
  );
};

export default SupportTicketAdminCard;
