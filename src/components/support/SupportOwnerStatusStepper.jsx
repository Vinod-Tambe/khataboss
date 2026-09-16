import React from 'react';
import {
  getOwnerStatusSlug,
  OWNER_STATUS_LABELS,
  OWNER_TICKET_STATUSES,
} from '../../constants/supportTicket';

const SupportOwnerStatusStepper = ({ statusFilter, statusCounts, onFilterChange }) => {
  const activeIndex =
    statusFilter === 'ALL' ? -1 : OWNER_TICKET_STATUSES.indexOf(statusFilter);

  const lineAfterAllFilled = activeIndex >= 0;

  return (
    <div className="support-status-stepper">
      <div
        className="support-status-stepper__track"
        role="tablist"
        aria-label="Filter by ticket progress"
      >
        <button
          type="button"
          role="tab"
          aria-selected={statusFilter === 'ALL'}
          className={`support-status-stepper__step support-status-stepper__step--all ${
            statusFilter === 'ALL' ? 'is-active' : ''
          } ${statusCounts.ALL > 0 ? 'has-count' : ''}`}
          onClick={() => onFilterChange('ALL')}
          title={`All tickets (${statusCounts.ALL})`}
        >
          <span className="support-status-stepper__node">
            <span className="support-status-stepper__count">{statusCounts.ALL}</span>
          </span>
          <span className="support-status-stepper__label">All</span>
        </button>

        <div
          className={`support-status-stepper__line ${
            lineAfterAllFilled ? 'is-filled' : statusCounts.ALL > 0 ? 'has-tickets' : ''
          }`}
          aria-hidden="true"
        />

        {OWNER_TICKET_STATUSES.map((status, index) => {
          const count = statusCounts[status] || 0;
          const isActive = statusFilter === status;
          const isComplete = activeIndex >= 0 && index < activeIndex;
          const lineFilled = activeIndex >= 0 && index > 0 && index <= activeIndex;
          const statusSlug = getOwnerStatusSlug(status);

          return (
            <React.Fragment key={status}>
              {index > 0 && (
                <div
                  className={`support-status-stepper__line ${
                    lineFilled ? 'is-filled' : count > 0 && activeIndex < 0 ? 'has-tickets' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`support-status-stepper__step support-status-stepper__step--${statusSlug} ${
                  isActive ? 'is-active' : ''
                } ${isComplete ? 'is-complete' : ''} ${count > 0 ? 'has-count' : ''}`}
                onClick={() => onFilterChange(status)}
                title={`${OWNER_STATUS_LABELS[status]} (${count})`}
              >
                <span className="support-status-stepper__node">
                  <span className="support-status-stepper__count">{count}</span>
                </span>
                <span className="support-status-stepper__label">{OWNER_STATUS_LABELS[status]}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SupportOwnerStatusStepper;
