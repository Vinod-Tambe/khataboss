import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { getCustomerFullAddress } from '../../utils/customerFormatters';

const CustomerAddressTooltip = ({
  user,
  children,
  placement = 'top',
  tooltipId,
  wrapperClassName = 'd-inline-block w-100',
}) => {
  const address = getCustomerFullAddress(user);
  const id = tooltipId || `customer-address-${user?.user_id || 'unknown'}`;

  if (!address || address === '-') {
    return children;
  }

  return (
    <OverlayTrigger
      placement={placement}
      delay={{ show: 200, hide: 100 }}
      overlay={
        <Tooltip id={id} style={{ maxWidth: 320 }}>
          <div className="text-start text-break">{address}</div>
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
