import React from 'react';
import CommonModal from './CommonModal';
import '../../css/DataTable.css';
import '../../css/PrintPreview.css';

const loadIframeStyles = (doc) => {
  document.querySelectorAll('style').forEach((styleEl) => {
    const style = doc.createElement('style');
    style.textContent = styleEl.textContent;
    doc.head.appendChild(style);
  });

  const linkPromises = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(
    (linkEl) =>
      new Promise((resolve) => {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = linkEl.href;
        link.onload = () => resolve();
        link.onerror = () => resolve();
        doc.head.appendChild(link);
        setTimeout(resolve, 2500);
      })
  );

  return Promise.all(linkPromises);
};

export const printDocumentById = (printAreaId) => {
  const printArea = document.getElementById(printAreaId);
  if (!printArea) return;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:0;top:0;width:1100px;height:100%;border:none;z-index:-1;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Print</title></head>');
  doc.write('<body class="print-preview-body">');
  doc.write(printArea.outerHTML);
  doc.write('</body></html>');
  doc.close();

  loadIframeStyles(doc).then(() => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 600);
  });
};

const PrintPreviewModal = ({ show, onHide, title, printAreaId = 'print-preview-area', children }) => {
  const handlePrint = () => printDocumentById(printAreaId);

  return (
    <CommonModal show={show} onHide={onHide} title={title} size="xl">
      <div className="print-preview-wrapper p-3">
        <div id={printAreaId} className="print-preview-document card p-3 pt-1 shadow-sm mb-0">
          {children}
        </div>
        <div className="print-preview-actions d-flex justify-content-center gap-3 mt-4 mb-2">
          <button className="btn btn-outline-success px-4" onClick={handlePrint}>
            <i className="bi bi-printer-fill me-2"></i> Print
          </button>
          <button className="btn btn-secondary px-4" onClick={onHide}>
            <i className="bi bi-x-circle me-2"></i> Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default PrintPreviewModal;
