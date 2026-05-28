import React, { useState, useMemo } from 'react';
import moment from 'moment';
import EmiReceiptModal from './EmiReceiptModal';

const FinanceInfo = ({ data = [], onPayment, onRollback, onHistory, isLoading, financeData, initialFinance }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
    const [selectedEmiData, setSelectedEmiData] = useState(null);

    const handlePrintPreview = (row) => {
        setSelectedEmiData(row);
        setIsPrintPreviewOpen(true);
    };

    // Search and Filter Logic
    const filteredData = useMemo(() => {
        return data.filter(item =>
            (item.ft_emi_no?.toString() || '').includes(searchQuery) ||
            (item.ft_start_date?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.ft_due_date?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.ft_emi_status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.ft_emi_amt?.toString() || '').includes(searchQuery)
        );
    }, [data, searchQuery]);

    // Totals Calculation
    const totals = useMemo(() => {
        return filteredData.reduce((acc, current) => {
            acc.emiAmt += (parseFloat(current.ft_emi_amt) || 0);
            acc.paidAmt += (parseFloat(current.ft_paid_amt) || 0);
            acc.pendingAmt += (parseFloat(current.ft_pending_amt) || 0);
            return acc;
        }, { emiAmt: 0, paidAmt: 0, pendingAmt: 0 });
    }, [filteredData]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, currentPage, rowsPerPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (pageNo) => {
        if (pageNo >= 1 && pageNo <= totalPages) {
            setCurrentPage(pageNo);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading finance information...</p>
            </div>
        );
    }

    return (
        <div className="card border-0 p-4 ps-0 pe-0">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex align-items-center">
                    <span className="me-2 text-muted small">Show</span>
                    <select
                        className="form-select form-select-sm w-auto border-secondary-subtle"
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={1000000}>All</option>
                    </select>
                    <span className="ms-2 text-muted small">Entries</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-sm btn-success px-3 border-2"
                        onClick={onPayment}
                        disabled={totals.pendingAmt <= 0}
                        title={totals.pendingAmt <= 0 ? "All installments are paid" : "Make a payment"}
                    >
                        <i className="bi bi-wallet2 me-1"></i> Payment
                    </button>
                    <button
                        className="btn btn-sm btn-danger px-3"
                        onClick={onRollback}
                        disabled={totals.paidAmt <= 0}
                        title={totals.paidAmt <= 0 ? "No payment records to rollback" : "Rollback a payment"}
                    >
                        <i className="bi bi-arrow-counterclockwise me-1"></i> Rollback
                    </button>
                    <button className="btn btn-sm btn-primary px-3" onClick={onHistory}>
                        <i className="bi bi-clock-history me-1"></i> History
                    </button>

                    <div className="ms-2" style={{ minWidth: '200px' }}>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white border-secondary-subtle">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-secondary-subtle"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {financeData && (
                <div className="bg-light border rounded mb-3 shadow-sm overflow-x-auto">
                    <div className="row g-0 flex-nowrap align-items-center text-nowrap">
                        <div className="col-auto px-3 py-2 border-end">
                            <span className="text-muted small me-2">Prin Amt:</span>
                            <span className="fw-bold text-primary">{Number(financeData.fin_prin_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="col-auto px-3 py-2 border-end">
                            <span className="text-muted small me-2">EMI Amt:</span>
                            <span className="fw-bold text-dark">{Number(financeData.fin_emi_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="col-auto px-3 py-2 border-end">
                            <span className="text-muted small me-2">Cash Amt:</span>
                            <span className="fw-bold text-success">{Number(financeData.fin_cash_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="col-auto px-3 py-2 border-end">
                            <span className="text-muted small me-2">Bank Amt:</span>
                            <span className="fw-bold text-info">{Number(financeData.fin_bank_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="col-auto px-3 py-2 border-end">
                            <span className="text-muted small me-2">Online Amt:</span>
                            <span className="fw-bold text-secondary">{Number(financeData.fin_online_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="col-auto px-3 py-2 border-end">
                            <span className="text-muted small me-2">Card Amt:</span>
                            <span className="fw-bold text-warning">{Number(financeData.fin_card_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="col-auto px-3 py-2 border-end bg-success bg-opacity-10">
                            <span className="text-success small fw-bold me-2">Paid Amt:</span>
                            <span className="fw-bold text-success">{Number(totals.paidAmt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="col-auto px-3 py-2 bg-danger bg-opacity-10">
                            <span className="text-danger small fw-bold me-2">Pen Amt:</span>
                            <span className="fw-bold text-danger">{Number(totals.pendingAmt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="table-responsive">
                <table className="table table-hover table-bordered border-secondary mb-2 dataTable dtr-inline text-capitalize dynamic-data-table">
                    <thead className="table-secondary border-bottom border-dark-subtle">
                        <tr>
                            <th className="fw-semibold border">EMI No</th>
                            <th className="fw-semibold border">Start Date</th>
                            <th className="fw-semibold  border">EMI Amt</th>
                            <th className="fw-semibold   border">Due Date</th>
                            <th className="fw-semibold  border">Paid Amt</th>
                            <th className="fw-semibold  border">Pending Amt</th>
                            <th className="fw-semibold  text-center border">Status</th>
                            <th className="fw-semibold text-center border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <tr key={item.ft_id || index}>
                                    <td className="fw-bold text-dark" >{item.ft_emi_no}</td>
                                    <td className="text-secondary">{item.ft_start_date ? moment(item.ft_start_date).format("DD-MM-YYYY") : '-'}</td>
                                    <td className=" fw-medium text-dark"> {(item.ft_emi_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="">{item.ft_due_date ? moment(item.ft_due_date).format("DD-MM-YYYY") : '-'}</td>
                                    <td className=" text-success"> {(item.ft_paid_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className=" text-danger"> {(item.ft_pending_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="text-center">
                                        <span className={`badge rounded-pill ${item.ft_emi_status === 'PAID' ? 'bg-success-subtle text-success' :
                                            item.ft_emi_status === 'PARTIAL' ? 'bg-warning-subtle text-warning' :
                                                'bg-danger-subtle text-danger'
                                            }`} style={{ fontSize: '0.75rem' }}>
                                            {item.ft_emi_status}
                                        </span>
                                    </td>
                                    <td className='text-center'>
                                        <button
                                            className="btn btn-sm btn-link text-warning p-0"
                                            title="Print Receipt"
                                            onClick={() => handlePrintPreview(item)}
                                        >
                                            <i className="bi bi-printer-fill fs-6"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-muted">No records found</td>
                            </tr>
                        )}
                    </tbody>
                    {filteredData.length > 0 && (
                        <tfoot className="table-light">
                            <tr className="fw-bold">
                                <th colSpan="2" className="text-center text-dark">Grand Total</th>
                                <th className=" text-primary"> {totals.emiAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th>
                                <th></th>
                                <th className=" text-success"> {totals.paidAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th>
                                <th className=" text-danger"> {totals.pendingAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</th>
                                <th colSpan="2"></th>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                <div className="text-muted small">
                    Showing {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
                </div>
                {totalPages > 1 && (
                    <nav aria-label="Page navigation">
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                    <i className="bi bi-chevron-left small"></i>
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                    <i className="bi bi-chevron-right small"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
            <EmiReceiptModal
                show={isPrintPreviewOpen}
                onHide={() => {
                    setIsPrintPreviewOpen(false);
                    setSelectedEmiData(null);
                }}
                emiData={selectedEmiData}
                initialFinance={initialFinance}
                financeData={financeData}
            />
        </div>
    );
};

export default FinanceInfo;