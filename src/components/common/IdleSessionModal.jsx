import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../../css/IdleSession.css';

const IdleSessionModal = ({ show, secondsLeft = 10, onContinue }) => (
  <Modal
    show={show}
    centered
    backdrop="static"
    keyboard={false}
    className="idle-session-modal"
    aria-labelledby="idle-session-title"
  >
    <Modal.Header className="idle-session-modal__header border-0 pb-0">
      <Modal.Title id="idle-session-title" className="h5 fw-bold mb-0 d-flex align-items-center gap-2">
        <i className="bi bi-hourglass-split text-warning" aria-hidden="true" />
        Session timeout
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center pt-2 pb-3">
      <p className="text-muted mb-3 mb-md-4">
        No activity detected for 2 minutes. You will be signed out unless you continue.
      </p>
      <div className="idle-session-modal__timer" aria-live="polite">
        <span className="idle-session-modal__timer-value">{secondsLeft}</span>
        <span className="idle-session-modal__timer-label">seconds remaining</span>
      </div>
    </Modal.Body>
    <Modal.Footer className="border-0 pt-0 justify-content-center pb-4">
      <Button variant="primary" className="fw-bold px-4 py-2" onClick={onContinue} autoFocus>
        Continue session
      </Button>
    </Modal.Footer>
  </Modal>
);

export default IdleSessionModal;
