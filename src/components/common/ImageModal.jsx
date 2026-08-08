import React from 'react';
import { Modal } from 'react-bootstrap';

const ImageModal = ({ show, onHide, imageUrl, title = "Image Preview" }) => {
  const backendUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9000/' : 'https://khataboss.in/';
  let finalUrl = typeof imageUrl === 'string' ? imageUrl : (imageUrl?.path || imageUrl?.url || null);
  if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('blob:')) {
    const clean = finalUrl.replace(/\\/g, '/').replace(/^\/+/, '');
    finalUrl = `${backendUrl}${clean}`;
  }

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
