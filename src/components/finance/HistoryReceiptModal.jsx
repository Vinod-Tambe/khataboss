import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import moment from 'moment';
import { toast } from 'react-toastify';
import '../../css/Modal.css';
import '../../css/Finance.css';
import {
    downloadHistoryReceiptPdf,
    getHistoryReceiptPdfBlob,
    getHistoryReceiptShareText,
    getHistoryReceiptFileName,
} from './downloadHistoryReceiptPdf';
import { tryDispatchReceipt } from '../../utils/dispatchWhatsAppReceipt';

const HistoryReceiptModal = ({ show, onHide, historyData, initialFinance }) => {
    const [sharing, setSharing] = useState(false);

    const receiptOptions = { historyData, initialFinance };

    const handlePrint = () => {
        const content = document.getElementById('history-receipt-print-area')?.outerHTML;
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
        if (!historyData) return;
        downloadHistoryReceiptPdf(receiptOptions);
    };

    const handleWhatsAppShare = async () => {
        if (!historyData) return;
        setSharing(true);
        const shareText = getHistoryReceiptShareText(receiptOptions);
        const fileName = getHistoryReceiptFileName(historyData);
        const firmId = initialFinance?.fin_firm_id || initialFinance?.firm?.firm_id;
        const toPhone = initialFinance?.user?.user_mobile_no;
        const toEmail = initialFinance?.user?.user_email_id;
        const customerName = initialFinance?.user?.user_first_name
            ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ''}`.trim()
            : 'Customer';
        const regNo = initialFinance?.fin_unique_code || initialFinance?.fin_id || 'N/A';
        const payDate = historyData.fm_trans_date
            ? moment(historyData.fm_trans_date).format('DD-MMM-YY')
            : moment().format('DD-MMM-YY');

        try {
            const blob = await getHistoryReceiptPdfBlob(receiptOptions);

            if (firmId && (toPhone || toEmail)) {
                const dispatch = await tryDispatchReceipt({
                    firmId,
                    templateKey: 'finance_collection_receipt',
                    toPhone,
                    toEmail,
                    vars: {
                        1: customerName,
                        2: String(regNo),
                        3: String(historyData.fm_trans_amt || 0),
                        4: payDate,
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
                    title: 'Payment History Receipt',
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

    if (!historyData) return null;

    const customerName = initialFinance?.user?.user_first_name
        ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ''}`
        : 'N/A';

    const regNo = initialFinance?.fin_unique_code || initialFinance?.fin_id || 'N/A';
    const firmName = initialFinance?.firm?.firm_name || 'TAHLKA FINANCE & COMPANY';
    const depositAmt = initialFinance?.fin_prin_amt || 0;

    return (
        <CommonModal
            show={show}
            onHide={onHide}
            title="Payment History Receipt"
            size="md"
        >
            <div className="p-3 bg-light">
                <div
                    id="history-receipt-print-area"
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
                                    <td className="text-dark">{historyData.fm_trans_date ? moment(historyData.fm_trans_date).format('DD-MMM-YY') : moment().format('DD-MMM-YY')}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Deposit Amt :</th>
                                    <td className="text-dark"> {Number(depositAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Trans Type :</th>
                                    <td className="text-dark">{historyData.fm_trans_type || '-'}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Trans Amt :</th>
                                    <td className="text-dark"> {Number(historyData.fm_trans_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Cash Amt :</th>
                                    <td className="text-dark"> {Number(historyData.fm_cash_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Bank Amt :</th>
                                    <td className="text-dark"> {Number(historyData.fm_bank_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Online Amt :</th>
                                    <td className="text-dark"> {Number(historyData.fm_online_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Card Amt :</th>
                                    <td className="text-dark"> {Number(historyData.fm_card_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                                {historyData.fm_other_info && (
                                    <tr>
                                        <th className="fw-bold text-dark">Other Info :</th>
                                        <td className="text-dark">{historyData.fm_other_info}</td>
                                    </tr>
                                )}
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

export default HistoryReceiptModal;
