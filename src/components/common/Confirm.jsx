import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Confirm Component
 * A reusable confirmation modal for dangerous actions.
 * 
 * @param {boolean} show - Controls visibility
 * @param {function} onHide - Close handler
 * @param {function} onConfirm - Success handler
 * @param {string} title - Modal title
 * @param {string} message - Main confirmation text
 */
const Confirm = ({ show, onHide, onConfirm, title = "Confirm Delete", message = "Are you sure you want to delete this record?" }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="confirm-modal">
      <Modal.Header closeButton className="bg-light py-2">
        <Modal.Title className="h6 fw-bold mb-0 text-brown">
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4 text-center">
        <div className="mb-3">
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
        </div>
        <h5 className="mb-2 fw-semibold">{message}</h5>
        <p className="text-muted small mb-0">This action cannot be undone and will permanently remove the data.</p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 pb-4 d-flex justify-content-center gap-3">
        <Button variant="light" onClick={onHide} className="px-4 border shadow-sm">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} className="px-4 shadow-sm">
          Delete Now
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Confirm;
