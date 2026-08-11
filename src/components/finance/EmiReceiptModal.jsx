import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import moment from 'moment';
import { toast } from 'react-toastify';
import '../../css/Modal.css';
import '../../css/Finance.css';
import {
    downloadEmiReceiptPdf,
    getEmiReceiptPdfBlob,
    getEmiReceiptFileName,
} from './downloadEmiReceiptPdf';
import {
    sendWhatsAppPdfOnly,
    getFinanceDispatchContext,
    buildFinanceReceiptVars,
    FINANCE_RECEIPT_TEMPLATE,
} from '../../utils/dispatchWhatsAppReceipt';

const EmiReceiptModal = ({ show, onHide, emiData, initialFinance }) => {
    const [sharing, setSharing] = useState(false);

    const receiptOptions = { emiData, initialFinance };

    const handlePrint = () => {
        const content = document.getElementById('emi-receipt-print-area')?.outerHTML;
        if (!content) return;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.contentDocument.write('<html><head><title>Print Receipt</title>');
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach(style => {
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
        if (!emiData) return;
        downloadEmiReceiptPdf(receiptOptions);
    };

    const handleWhatsAppShare = async () => {
        if (!emiData) return;
        setSharing(true);
        const fileName = getEmiReceiptFileName(emiData);
        const ctx = getFinanceDispatchContext(initialFinance);
        const payDate = emiData.ft_payment_date
            ? moment(emiData.ft_payment_date).format('DD-MMM-YY')
            : moment().format('DD-MMM-YY');

        try {
            const blob = await getEmiReceiptPdfBlob(receiptOptions);
            const { message } = await sendWhatsAppPdfOnly({
                firmId: ctx.firmId,
                toPhone: ctx.toPhone,
                toEmail: ctx.toEmail,
                templateKey: FINANCE_RECEIPT_TEMPLATE,
                vars: buildFinanceReceiptVars(initialFinance, emiData.ft_paid_amt || 0, payDate),
                pdfBlob: blob,
                fileName,
            });
            toast.success(message);
        } catch (error) {
            console.error('WhatsApp share failed:', error);
            toast.error(error.message || 'Failed to send WhatsApp message.');
        } finally {
            setSharing(false);
        }
    };

    if (!emiData) return null;

    const customerName = initialFinance?.user?.user_first_name
        ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ''}`
        : 'N/A';

    const regNo = initialFinance?.fin_unique_code || initialFinance?.fin_id || 'N/A';
    const firmName = initialFinance?.firm?.firm_name || 'TAHLKA FINANCE & COMPANY';
    const depositAmt = initialFinance?.fin_prin_amt || 0;
    const remAmt = emiData.ft_pending_amt || 0;

    return (
        <CommonModal
            show={show}
            onHide={onHide}
            title="Finance Payment Receipt"
            size="md"
        >
            <div className="p-3 bg-light">
                <div
                    id="emi-receipt-print-area"
                    className="bg-white emi-receipt-print-box"
                    style={{ border: '1px solid #dee2e6', borderRadius: '4px', maxWidth: '500px', margin: '0 auto' }}
                >
                    <div className="text-center mt-4 mb-2">
                        <h5 className="fw-bold text-uppercase mb-0">{firmName}</h5>
                    </div>

                    <div style={{ padding: '0 20px' }}>
                        <hr style={{ borderTop: '2px solid #000', opacity: 1, margin: '10px 0 20px 0' }} />
                    </div>

                    <div className="px-3 pb-4">
                        <table className="table table-bordered border-dark mb-0" style={{ fontSize: '0.85rem' }}>
                            <tbody>
                                <tr>
                                    <th className="fw-bold text-dark" style={{ width: '40%' }}>Name :</th>
                                    <td className="text-dark">{customerName}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Reg No / Unique Code :</th>
                                    <td className="fw-bold text-dark">{regNo}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Payment Date :</th>
                                    <td className="text-dark">{emiData.ft_payment_date ? moment(emiData.ft_payment_date).format('DD-MMM-YY') : moment().format('DD-MMM-YY')}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Payment Amt :</th>
                                    <td className="text-dark"> {Number(emiData.ft_paid_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">From Date :</th>
                                    <td className="text-dark">{emiData.ft_start_date ? moment(emiData.ft_start_date).format('DD-MMM-YY') : '-'}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">To Date :</th>
                                    <td className="text-dark">{emiData.ft_due_date ? moment(emiData.ft_due_date).format('DD-MMM-YY') : '-'}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Deposit Amt :</th>
                                    <td className="text-dark"> {Number(depositAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Rem. Amt :</th>
                                    <td className="text-dark"> {Number(remAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">EMI No :</th>
                                    <td className="text-dark">{emiData.ft_emi_no == null || emiData.ft_emi_no === '' ? '-' : `EMI-${String(emiData.ft_emi_no).replace(/^emi[-\s]?/i, '')}`}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">EMI Amt :</th>
                                    <td className="text-dark"> {Number(emiData.ft_emi_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Status :</th>
                                    <td className="fw-bold text-dark">{emiData.ft_emi_status}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="emi-receipt-actions d-flex flex-wrap justify-content-center gap-2 mt-4 mb-2">
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

export default EmiReceiptModal;
