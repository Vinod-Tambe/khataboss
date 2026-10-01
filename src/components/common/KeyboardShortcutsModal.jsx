import React from 'react';
import { Modal } from 'react-bootstrap';
import { KEYBOARD_SHORTCUT_GROUPS } from '../../config/keyboardShortcuts';
import './KeyboardShortcutsModal.css';

const KeyChip = ({ label }) => (
  <kbd className="keyboard-shortcuts-kbd">{label}</kbd>
);

const ShortcutRow = ({ item }) => (
  <tr>
    <td className="keyboard-shortcuts-keys">
      {item.keys.map((part, index) => (
        <span key={`${part}-${index}`} className="keyboard-shortcuts-keypart">
          {index > 0 ? <span className="keyboard-shortcuts-plus">+</span> : null}
          <KeyChip label={part} />
        </span>
      ))}
    </td>
    <td className="keyboard-shortcuts-desc">{item.description}</td>
  </tr>
);

const KeyboardShortcutsModal = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} centered size="lg" scrollable>
    <Modal.Header closeButton>
      <Modal.Title className="d-flex align-items-center gap-2">
        <i className="bi bi-keyboard" aria-hidden="true" />
        Keyboard shortcuts
      </Modal.Title>
    </Modal.Header>
    <Modal.Body className="keyboard-shortcuts-body">
      <p className="text-muted small mb-3">
        Shortcuts are helpers only. They do not run while you are typing in a text field,
        and they do not replace mouse or touch actions. Browser shortcuts (new tab, refresh,
        etc.) are unchanged.
      </p>
      {KEYBOARD_SHORTCUT_GROUPS.map((group) => (
        <section key={group.id} className="keyboard-shortcuts-group mb-4">
          <h6 className="keyboard-shortcuts-group-title fw-bold mb-2">{group.title}</h6>
          <div className="table-responsive">
            <table className="table table-sm table-borderless keyboard-shortcuts-table mb-0">
              <tbody>
                {group.items.map((item, idx) => (
                  <ShortcutRow key={`${group.id}-${idx}`} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </Modal.Body>
    <Modal.Footer>
      <button type="button" className="btn btn-secondary" onClick={onHide}>
        Close
      </button>
    </Modal.Footer>
  </Modal>
);

export default KeyboardShortcutsModal;
