import React from 'react';
import CommonModal from '../common/CommonModal';
import moment from 'moment';
import '../../css/Modal.css';

const EmiReceiptModal = ({ show, onHide, emiData, initialFinance }) => {
    
    const handlePrint = () => {
        const content = document.getElementById('receipt-print-area').outerHTML;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        iframe.contentDocument.write('<html><head><title>Print Receipt</title>');
        // Clone all stylesheets and style blocks from the parent window
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach(style => {
            iframe.contentDocument.head.appendChild(style.cloneNode(true));
        });
        iframe.contentDocument.write('</head><body style="padding: 20px;">');
        iframe.contentDocument.write(content);
        iframe.contentDocument.write('</body></html>');
        iframe.contentDocument.close();
        
        // Wait for styles to load then print
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    };

    if (!emiData) return null;

    const customerName = initialFinance?.user?.user_first_name 
        ? `${initialFinance.user.user_first_name} ${initialFinance.user.user_last_name || ''}`
        : 'N/A';
    
    // Fallbacks if data missing
    const regNo = initialFinance?.fin_id || 'N/A';
    const firmName = initialFinance?.firm?.firm_name || 'TAHLKA FINANCE & COMPANY';
    // const firmAddress = initialFinance?.firm?.firm_address || '';

    // Calculate total amount based on principal and EMI count, or just use what's available
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
                <div id="receipt-print-area" className="bg-white emi-receipt-print-box" style={{ border: '1px solid #dee2e6', borderRadius: '4px', maxWidth: '500px', margin: '0 auto' }}>
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
                                    <th className="fw-bold text-dark">Reg No :</th>
                                    <td className="text-dark">{regNo}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Payment Date :</th>
                                    <td className="text-dark">{emiData.ft_payment_date ? moment(emiData.ft_payment_date).format('DD-MMM-YY') : moment().format('DD-MMM-YY')}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Payment Amt :</th>
                                    <td className="text-dark">₹ {Number(emiData.ft_paid_amt || 0).toLocaleString()}</td>
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
                                    <td className="text-dark">₹ {Number(depositAmt).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Rem. Amt :</th>
                                    <td className="text-dark">₹ {Number(remAmt).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">EMI No :</th>
                                    <td className="text-dark">{emiData.ft_emi_no}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">EMI Amt :</th>
                                    <td className="text-dark">₹ {Number(emiData.ft_emi_amt || 0).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th className="fw-bold text-dark">Status :</th>
                                    <td className="fw-bold text-dark">{emiData.ft_emi_status}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="d-flex justify-content-center gap-3 mt-4 mb-2">
                    <button className="btn btn-outline-primary px-4 py-1 d-flex align-items-center rounded" onClick={handlePrint}>
                        <i className="bi bi-printer me-2"></i> Print
                    </button>
                    <button className="btn btn-outline-success px-4 py-1 d-flex align-items-center rounded">
                        <i className="bi bi-whatsapp me-2"></i> WhatsApp
                    </button>
                    <button className="btn btn-secondary px-4 py-1 d-flex align-items-center rounded" onClick={onHide}>
                        <i className="bi bi-x-circle me-2"></i> Close
                    </button>
                </div>
            </div>
        </CommonModal>
    );
};

export default EmiReceiptModal;
