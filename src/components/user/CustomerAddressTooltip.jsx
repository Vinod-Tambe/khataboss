import React from 'react';
import { useSelector } from 'react-redux';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { buildCustomerHoverDetails } from '../../utils/customerFormatters';

const CustomerAddressTooltip = ({
  user,
  children,
  placement = 'top',
  tooltipId,
  wrapperClassName = 'd-inline-block w-100',
}) => {
  const { firms } = useSelector((state) => state.firm);
  const details = buildCustomerHoverDetails(user, firms);
  const id = tooltipId || `customer-details-${user?.user_id || 'unknown'}`;

  if (!details.length) {
    return children;
  }

  return (
    <OverlayTrigger
      placement={placement}
      delay={{ show: 200, hide: 100 }}
      overlay={
        <Tooltip id={id} style={{ maxWidth: 360 }}>
          <div className="text-start text-break small">
            {details.map(({ label, value }) => (
              <div key={label} className="mb-1">
                <span className="fw-semibold">{label}:</span>{' '}
                <span>{value}</span>
              </div>
            ))}
          </div>
        </Tooltip>
      }
    >
      <span className={wrapperClassName} style={{ cursor: 'help' }}>
        {children}
      </span>
    </OverlayTrigger>
  );
};

export default CustomerAddressTooltip;
