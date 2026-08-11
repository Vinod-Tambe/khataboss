import React from 'react';
import CommonModal from '../common/CommonModal';
import LogsList from './LogsList';

const EntityLogsModal = ({
  show,
  onHide,
  firmId,
  entityType,
  entityId,
  title = 'Loan Activity Logs',
  refNo = '',
}) => {
  const modalTitle = refNo ? `${title} — ${refNo}` : title;

  return (
    <CommonModal show={show} onHide={onHide} title={modalTitle} size="xl">
      <div className="p-3">
        <LogsList
          firmId={firmId}
          entityType={entityType}
          entityId={entityId}
          title={modalTitle}
        />
      </div>
    </CommonModal>
  );
};

export default EntityLogsModal;
