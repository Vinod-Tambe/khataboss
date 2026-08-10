import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import { toast } from 'react-toastify';
import '../../css/Modal.css';
import '../../css/ActiveLoanPanel.css';
import {
  downloadLoanRecordPdf,
  getLoanRecordPdfBlob,
  getLoanRecordShareText,
  getLoanRecordFileName,
  getLoanRecordTitle,
  buildLoanRecordReceiptRows,
} from './downloadLoanRecordPdf';
import {
  tryDispatchReceipt,
  LOAN_RECEIPT_TEMPLATE_BY_TYPE,
} from '../../utils/dispatchWhatsAppReceipt';

const LoanRecordReceiptModal = ({
  show,
  onHide,
  type = 'principal',
  record,
  loanDetails,
  customer,
}) => {
  const [sharing, setSharing] = useState(false);

  if (!record) return null;

  const options = { type, record, loanDetails, customer };
  const title = getLoanRecordTitle(type);
  const firmName = loanDetails?.firm?.firm_name || 'TAHLKA FINANCE & COMPANY';
  // Firm is already in shared rows; skip it in the preview table body after header
  const rows = buildLoanRecordReceiptRows(options).filter(([label]) => label !== 'Firm');

  const handlePrint = () => {
    const content = document.getElementById('loan-record-print-area')?.outerHTML;
    if (!content) return;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument.write('<html><head><title>Print Receipt</title>');
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => {
      iframe.contentDocument.head.appendChild(style.cloneNode(true));
    });
    iframe.contentDocument.write('</head><body style="padding: 20px;">');
    iframe.contentDocument.write(content);
    iframe.contentDocument.write('</body></html>');
    iframe.contentDocument.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  const handleDownloadPdf = () => {
    downloadLoanRecordPdf(options);
  };

  const handleWhatsAppShare = async () => {
    setSharing(true);
    const shareText = getLoanRecordShareText(options);
    const fileName = getLoanRecordFileName(options);
    const firmId = loanDetails?.girv_firm_id || loanDetails?.firm?.firm_id;
    const toPhone = customer?.user_mobile_no;
    const toEmail = customer?.user_email_id;
    const customerName = customer?.user_first_name
      ? `${customer.user_first_name} ${customer.user_last_name || ''}`.trim()
      : 'Customer';
    const loanNo = loanDetails?.girv_loan_no || loanDetails?.girv_id || 'N/A';
    const templateKey = LOAN_RECEIPT_TEMPLATE_BY_TYPE[type] || 'loan_created';

    try {
      const blob = await getLoanRecordPdfBlob(options);

      if (firmId && (toPhone || toEmail)) {
        const dispatch = await tryDispatchReceipt({
          firmId,
          templateKey,
          toPhone,
          toEmail,
          vars: {
            1: customerName,
            2: String(loanNo),
            3: String(record?.amount || record?.rel_payable_amt || record?.dep_amt || ''),
            4: record?.date || record?.rel_trans_date || record?.dep_date || '',
          },
          pdfBlob: blob,
          fileName,
        });
        if (dispatch.dispatched) {
          toast.success('Receipt sent via WhatsApp / email');
          setSharing(false);
          return;
        }
      }

      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: shareText,
        });
        setSharing(false);
        return;
      }
    } catch (error) {
      console.error('WhatsApp share failed:', error);
    } finally {
      setSharing(false);
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <CommonModal show={show} onHide={onHide} title={title} size="md">
      <div className="p-3 bg-light">
        <div
          id="loan-record-print-area"
          className="bg-white loan-record-print-box"
          style={{
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          <div className="text-center mt-4 mb-2">
            <h5 className="fw-bold text-uppercase mb-0">{firmName}</h5>
          </div>
          <div style={{ padding: '0 20px' }}>
            <hr style={{ borderTop: '2px solid #000', opacity: 1, margin: '10px 0 12px 0' }} />
            <p className="text-center fw-semibold mb-3">{title}</p>
          </div>
          <div className="px-3 pb-4">
            <table className="table table-bordered border-dark mb-0" style={{ fontSize: '0.85rem' }}>
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}>
                    <th className="fw-bold text-dark" style={{ width: '42%' }}>{label} :</th>
                    <td className="text-dark">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="loan-record-actions d-flex flex-wrap justify-content-center gap-2 mt-4 mb-2">
          <button
            type="button"
            className="btn btn-outline-primary px-3 py-2 d-flex align-items-center rounded"
            onClick={handlePrint}
          >
            <i className="bi bi-printer me-2"></i> Print
          </button>
          <button
            type="button"
            className="btn btn-outline-danger px-3 py-2 d-flex align-items-center rounded"
            onClick={handleDownloadPdf}
          >
            <i className="bi bi-filetype-pdf me-2"></i> PDF
          </button>
          <button
            type="button"
            className="btn btn-outline-success px-3 py-2 d-flex align-items-center rounded"
            onClick={handleWhatsAppShare}
            disabled={sharing}
          >
            <i className="bi bi-whatsapp me-2"></i>
            {sharing ? 'Sharing...' : 'WhatsApp'}
          </button>
          <button
            type="button"
            className="btn btn-secondary px-3 py-2 d-flex align-items-center rounded"
            onClick={onHide}
          >
            <i className="bi bi-x-circle me-2"></i> Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default LoanRecordReceiptModal;
