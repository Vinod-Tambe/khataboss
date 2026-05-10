import React from 'react';
import { Modal } from 'react-bootstrap';

/**
 * CommonModal Component
 * A reusable modal wrapper for rendering forms and other content.
 * 
 * @param {boolean} show - Controls the visibility of the modal
 * @param {function} onHide - Function to call when closing the modal
 * @param {string} title - The title displayed in the modal header
 * @param {React.ReactNode} children - The content to be rendered inside the modal body
 * @param {string} size - Size of the modal ('sm', 'lg', 'xl')
 */
const CommonModal = ({ show, onHide, title, children, size = 'lg' }) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size={size}
            centered
            backdrop="static"
            keyboard={false}
            className="common-modal"
        >
            <Modal.Header closeButton className="bg-light py-2">
                <Modal.Title className="h6 fw-bold mb-0 text-brown">
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {children}
            </Modal.Body>
        </Modal>
    );
};

export default CommonModal;
