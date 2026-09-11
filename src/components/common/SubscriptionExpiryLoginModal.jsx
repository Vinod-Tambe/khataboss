import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const SubscriptionExpiryLoginModal = ({ show, message, isUrgent = false, onContinue }) => (
  <Modal
    show={show}
    onHide={onContinue}
    centered
    backdrop="static"
    keyboard={false}
    className="subscription-expiry-login-modal"
  >
    <Modal.Header closeButton className={isUrgent ? 'subscription-expiry-login-modal__header--urgent' : ''}>
      <Modal.Title className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
        <i
          className={`bi ${isUrgent ? 'bi-exclamation-octagon-fill' : 'bi-exclamation-triangle-fill'}`}
          aria-hidden="true"
        />
        Subscription Expiring Soon
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="subscription-expiry-login-modal__body">
      <p className="mb-0">{message}</p>
    </Modal.Body>
    <Modal.Footer className="border-0 pt-0">
      <Button variant={isUrgent ? 'danger' : 'warning'} className="fw-semibold px-4" onClick={onContinue}>
        Continue to Dashboard
      </Button>
    </Modal.Footer>
  </Modal>
);

export default SubscriptionExpiryLoginModal;
