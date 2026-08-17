import React from 'react';
import { Modal } from 'react-bootstrap';
import { resolveImageUrl } from '../../utils/imageHelpers';

const ImageModal = ({ show, onHide, imageUrl, title = "Image Preview" }) => {
  const finalUrl = resolveImageUrl(imageUrl);

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="text-primary fs-5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center p-4">
        {finalUrl ? (
          <img 
            src={finalUrl} 
            alt="Preview" 
            className="img-fluid rounded shadow-sm"
            style={{ maxHeight: '60vh', objectFit: 'contain' }} 
          />
        ) : (
          <div className="text-muted p-5">No image available</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>Close</button>
        {finalUrl && (
          <a 
            href={finalUrl} 
            download 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
          >
            <i className="bi bi-download me-2"></i> Download Image
          </a>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ImageModal;
