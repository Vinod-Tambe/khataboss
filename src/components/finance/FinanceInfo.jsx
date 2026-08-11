import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import EmiReceiptModal from './EmiReceiptModal';
import {
    downloadFinanceEmiPdf,
    getFinanceEmiPdfBlob,
    getFinanceEmiFileName,
    printFinanceEmiSchedule,
} from './downloadFinanceEmiPdf';
import {
    sendWhatsAppPdfOnly,
    getFinanceDispatchContext,
    buildFinanceReceiptVars,
    FINANCE_RECEIPT_TEMPLATE,
} from '../../utils/dispatchWhatsAppReceipt';
import '../../css/Finance.css';
import { buildFinanceInterestSummary } from '../../utils/financeInterest';

const formatAmt = (value) =>
    Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const formatEmiNo = (value) => {
    if (value == null || value === '') return '-';
    const raw = String(value).trim();
    if (/^emi[-\s]?\d+/i.test(raw)) {
        const num = raw.replace(/^emi[-\s]?/i, '');
        return `EMI-${num}`;
    }
    return `EMI-${raw}`;
};

const statusBadgeClass = (status) => {
    if (status === 'PAID') return 'bg-success-subtle text-success';
    if (status === 'PARTIAL') return 'bg-warning-subtle text-warning';
    if (status === 'DUE') return 'bg-danger-subtle text-danger';
    return 'bg-secondary-subtle text-secondary';
};

const EmiExportActions = ({ disabled, onPrint, onPdf, onWhatsApp, whatsAppLoading }) => (
    <div className="text-center mt-3 mb-2 finance-info-actions-wrap no-print">
        <div className="finance-info-actions d-flex justify-content-center align-items-center gap-2">
            <button
                type="button"
                className="btn finance-info-action-btn finance-info-action-print"
                onClick={onPrint}
                disabled={disabled}
                title="Print all EMIs"
                aria-label="Print all EMIs"
            >
                <i className="bi bi-printer-fill"></i>
            </button>
            <button
                type="button"
                className="btn finance-info-action-btn finance-info-action-pdf"
                onClick={onPdf}
                disabled={disabled}
                title="Download all EMIs PDF"
                aria-label="Download all EMIs PDF"
            >
                <i className="bi bi-file-earmark-pdf-fill"></i>
            </button>
            <button
                type="button"
                className="btn finance-info-action-btn finance-info-action-whatsapp"
                onClick={onWhatsApp}
                disabled={disabled || whatsAppLoading}
                title="WhatsApp share all EMIs"
                aria-label="WhatsApp share all EMIs"
            >
                <i className={`bi ${whatsAppLoading ? 'bi-hourglass-split' : 'bi-whatsapp'}`}></i>
            </button>
        </div>
    </div>
);

const FinanceInfo = ({ data = [], onPayment, onRollback, onClose, onPaidFine, onPayInterest, onHistory, isLoading, financeData, initialFinance }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
    const [selectedEmiData, setSelectedEmiData] = useState(null);
    const [sharingWhatsApp, setSharingWhatsApp] = useState(false);

    const fineSummary = financeData?.fine_summary;
    const interestSummary = useMemo(
        () => financeData?.interest_summary || (financeData ? buildFinanceInterestSummary(financeData) : null),
        [financeData]
    );
    const showInterest = (interestSummary?.interest_amt || 0) > 0;
    const pendingInterestAmt = parseFloat(interestSummary?.pending_interest) || 0;
    const showInterestPayBtn =
        Boolean(interestSummary?.interest_separate) && pendingInterestAmt > 0;
    const showFineColumn = Boolean(fineSummary?.enabled);
    const showPaidFineBtn =
        Boolean(fineSummary?.enabled) ||
        (parseFloat(fineSummary?.collectAmt) || 0) > 0 ||
        (parseFloat(fineSummary?.pendingCollect) || 0) > 0 ||
        (parseFloat(fineSummary?.pendingFine) || 0) > 0;

    const handlePrintPreview = (row) => {
        setSelectedEmiData(row);
        setIsPrintPreviewOpen(true);
    };

    const filteredData = useMemo(() => {
        return data.filter(item =>
            (item.ft_emi_no?.toString() || '').includes(searchQuery) ||
            (item.ft_start_date?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.ft_due_date?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.ft_emi_status?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (item.ft_emi_amt?.toString() || '').includes(searchQuery)
        );
    }, [data, searchQuery]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, current) => {
            acc.emiAmt += (parseFloat(current.ft_emi_amt) || 0);
            acc.paidAmt += (parseFloat(current.ft_paid_amt) || 0);
            acc.pendingAmt += (parseFloat(current.ft_pending_amt) || 0);
            acc.fineAmt += (parseFloat(current.ft_fine_amt) || 0);
            return acc;
        }, { emiAmt: 0, paidAmt: 0, pendingAmt: 0, fineAmt: 0 });
    }, [filteredData]);

    const canCloseFinance =
        totals.pendingAmt > 0 &&
        (!interestSummary?.interest_separate || pendingInterestAmt <= 0);

    const rollbackSummary = financeData?.rollback_summary || {};
    const canRollback =
        Boolean(rollbackSummary.can_rollback_emi) ||
        Boolean(rollbackSummary.can_rollback_interest) ||
        Boolean(rollbackSummary.can_rollback_fine) ||
        totals.paidAmt > 0;

    const pendingFineTotal = parseFloat(fineSummary?.pendingTotal) || 0;

    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, currentPage, rowsPerPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
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

    /** Full EMI schedule (all rows, not page-limited) — desktop table export */
    const scheduleOptions = useMemo(
        () => ({
            rows: filteredData,
            totals,
            initialFinance,
            financeData,
        }),
        [filteredData, totals, initialFinance, financeData]
    );

    const handlePrintAll = () => {
        if (!filteredData.length) return;
        printFinanceEmiSchedule(scheduleOptions);
    };

    const handleDownloadAllPdf = () => {
        if (!filteredData.length) return;
        downloadFinanceEmiPdf(scheduleOptions);
    };

    const handleWhatsAppAll = async () => {
        if (!filteredData.length || sharingWhatsApp) return;
        const fileName = getFinanceEmiFileName(initialFinance);
        const ctx = getFinanceDispatchContext(initialFinance);

        setSharingWhatsApp(true);
        try {
            const blob = await getFinanceEmiPdfBlob(scheduleOptions);
            const { message } = await sendWhatsAppPdfOnly({
                firmId: ctx.firmId,
                toPhone: ctx.toPhone,
                toEmail: ctx.toEmail,
                templateKey: FINANCE_RECEIPT_TEMPLATE,
                vars: buildFinanceReceiptVars(
                    initialFinance,
                    totals.pendingAmt ?? totals.paidAmt ?? 0,
                    moment().format('DD-MMM-YY')
                ),
                pdfBlob: blob,
                fileName,
            });
            toast.success(message);
        } catch (error) {
            console.error('WhatsApp share failed:', error);
            toast.error(error.message || 'Failed to send WhatsApp message.');
        } finally {
            setSharingWhatsApp(false);
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

    const renderSearch = (placeholder = 'Search...') => (
        <div className="input-group input-group-sm finance-info-search">
            <span className="input-group-text bg-white border-secondary-subtle">
                <i className="bi bi-search text-muted"></i>
            </span>
            <input
                type="text"
                className="form-control border-secondary-subtle"
                placeholder={placeholder}
                value={searchQuery}
                onChange={handleSearchChange}
            />
        </div>
    );

    const receiptModal = (
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
    );

    return (
        <div className="card border-0 p-4 ps-0 pe-0 finance-info-card">
            {/* ========== Mobile app view ========== */}
            <div className="d-md-none finance-mobile">
                {financeData && (
                    <>
                        <div className="finance-mobile-hero">
                            <div className="finance-mobile-hero__tile is-paid">
                                <span className="finance-mobile-hero__label">Paid</span>
                                <span className="finance-mobile-hero__value">{formatAmt(totals.paidAmt)}</span>
                            </div>
                            <div className="finance-mobile-hero__tile is-pending">
                                <span className="finance-mobile-hero__label">Pending</span>
                                <span className="finance-mobile-hero__value">{formatAmt(totals.pendingAmt)}</span>
                            </div>
                        </div>

                        <div className="finance-mobile-stats">
                            <div className="finance-mobile-stat">
                                <span className="finance-mobile-stat__label">Principal</span>
                                <span className="finance-mobile-stat__value text-primary">{formatAmt(financeData.fin_prin_amt)}</span>
                            </div>
                            {showInterest && (
                                <>
                                    <div className="finance-mobile-stat">
                                        <span className="finance-mobile-stat__label">ROI</span>
                                        <span className="finance-mobile-stat__value">{interestSummary.roi_display}</span>
                                    </div>
                                    <div className="finance-mobile-stat">
                                        <span className="finance-mobile-stat__label">Int Amt</span>
                                        <span className="finance-mobile-stat__value text-warning">{formatAmt(interestSummary.interest_amt)}</span>
                                    </div>
                                    {interestSummary.interest_separate && (
                                        <>
                                            <div className="finance-mobile-stat">
                                                <span className="finance-mobile-stat__label">Int Paid</span>
                                                <span className="finance-mobile-stat__value text-success">{formatAmt(interestSummary.interest_paid)}</span>
                                            </div>
                                            <div className="finance-mobile-stat">
                                                <span className="finance-mobile-stat__label">Int Pending</span>
                                                <span className="finance-mobile-stat__value text-danger">{formatAmt(interestSummary.pending_interest)}</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            <div className="finance-mobile-stat">
                                <span className="finance-mobile-stat__label">EMI Amt</span>
                                <span className="finance-mobile-stat__value">{formatAmt(financeData.fin_emi_amt)}</span>
                            </div>
                            <div className="finance-mobile-stat">
                                <span className="finance-mobile-stat__label">Cash</span>
                                <span className="finance-mobile-stat__value text-success">{formatAmt(financeData.fin_cash_amt)}</span>
                            </div>
                            <div className="finance-mobile-stat">
                                <span className="finance-mobile-stat__label">Bank</span>
                                <span className="finance-mobile-stat__value text-info">{formatAmt(financeData.fin_bank_amt)}</span>
                            </div>
                            <div className="finance-mobile-stat">
                                <span className="finance-mobile-stat__label">Online</span>
                                <span className="finance-mobile-stat__value">{formatAmt(financeData.fin_online_amt)}</span>
                            </div>
                            <div className="finance-mobile-stat">
                                <span className="finance-mobile-stat__label">Card</span>
                                <span className="finance-mobile-stat__value text-warning">{formatAmt(financeData.fin_card_amt)}</span>
                            </div>
                        </div>
                    </>
                )}

                {showPaidFineBtn && fineSummary && (
                    <div className="alert alert-warning border py-2 mb-3 small">
                        {showFineColumn && (
                            <div className="fw-semibold">{fineSummary.label}</div>
                        )}
                        <div>
                            {showFineColumn && (
                                <>
                                    Overdue EMIs: {fineSummary.overdueCount || 0}
                                    {' · '}Total fine: ₹{formatAmt(fineSummary.totalFine)}
                                    {' · '}Pending fine: ₹{formatAmt(fineSummary.pendingFine)}
                                </>
                            )}
                            {(parseFloat(fineSummary.collectAmt) || 0) > 0 && (
                                <>
                                    {showFineColumn ? ' · ' : ''}
                                    Collect pending: ₹{formatAmt(fineSummary.pendingCollect)}
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="finance-mobile-actions">
                    <button
                        className="btn btn-success"
                        onClick={onPayment}
                        disabled={totals.pendingAmt <= 0}
                        title={totals.pendingAmt <= 0 ? 'All installments are paid' : 'Make a payment'}
                    >
                        <i className="bi bi-wallet2"></i>
                        <span>Pay</span>
                    </button>
                    {showInterestPayBtn && (
                        <button
                            className="btn btn-outline-warning"
                            onClick={onPayInterest}
                            disabled={financeData?.fin_status === 'CLOSED'}
                            title="Pay pending interest separately"
                        >
                            <i className="bi bi-percent"></i>
                            <span>Pay Interest</span>
                        </button>
                    )}
                    {showPaidFineBtn && (
                        <button
                            className="btn btn-outline-danger"
                            onClick={onPaidFine}
                            disabled={pendingFineTotal <= 0 || financeData?.fin_status === 'CLOSED'}
                            title={pendingFineTotal <= 0 ? 'No pending fine/collect' : 'Pay fine / collect amount'}
                        >
                            <i className="bi bi-exclamation-octagon"></i>
                            <span>Paid Fine</span>
                        </button>
                    )}
                    <button
                        className="btn btn-warning"
                        onClick={onRollback}
                        disabled={!canRollback}
                        title={
                            !canRollback
                                ? 'No payment records to rollback'
                                : 'Rollback EMI, interest, or fine payment'
                        }
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                        <span>Rollback</span>
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={onClose}
                        disabled={!canCloseFinance || financeData?.fin_status === 'CLOSED'}
                        title={
                            financeData?.fin_status === 'CLOSED'
                                ? 'Finance is already closed'
                                : !canCloseFinance
                                    ? 'Pay all EMIs and pending interest before closing'
                                    : 'Close this finance'
                        }
                    >
                        <i className="bi bi-x-circle"></i>
                        <span>Close</span>
                    </button>
                    <button className="btn btn-primary" onClick={onHistory}>
                        <i className="bi bi-clock-history"></i>
                        <span>History</span>
                    </button>
                </div>

                <div className="mb-3">{renderSearch('Search EMI...')}</div>

                <div className="finance-mobile-list">
                    {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                            <article key={item.ft_id || index} className="finance-mobile-emi">
                                <div className="finance-mobile-emi__top">
                                    <div>
                                        <p className="finance-mobile-emi__no">{formatEmiNo(item.ft_emi_no)}</p>
                                        <div className="finance-mobile-emi__dates">
                                            {item.ft_start_date ? moment(item.ft_start_date).format('DD-MM-YYYY') : '-'}
                                            {' → '}
                                            {item.ft_due_date ? moment(item.ft_due_date).format('DD-MM-YYYY') : '-'}
                                        </div>
                                    </div>
                                    <span className={`badge rounded-pill finance-mobile-emi__badge ${statusBadgeClass(item.ft_emi_status)}`}>
                                        {item.ft_emi_status}
                                    </span>
                                </div>

                                <div className="finance-mobile-emi__grid">
                                    <div className="finance-mobile-emi__cell">
                                        <span className="finance-mobile-emi__cell-label">EMI</span>
                                        <span className="finance-mobile-emi__cell-value is-emi">{formatAmt(item.ft_emi_amt)}</span>
                                    </div>
                                    <div className="finance-mobile-emi__cell">
                                        <span className="finance-mobile-emi__cell-label">Paid</span>
                                        <span className="finance-mobile-emi__cell-value is-paid">{formatAmt(item.ft_paid_amt)}</span>
                                    </div>
                                    <div className="finance-mobile-emi__cell">
                                        <span className="finance-mobile-emi__cell-label">Pending</span>
                                        <span className="finance-mobile-emi__cell-value is-pending">{formatAmt(item.ft_pending_amt)}</span>
                                    </div>
                                    {showFineColumn && (
                                        <div className="finance-mobile-emi__cell">
                                            <span className="finance-mobile-emi__cell-label">Fine</span>
                                            <span className="finance-mobile-emi__cell-value text-danger">
                                                {formatAmt(item.ft_fine_amt)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="finance-mobile-emi__footer">
                                    <span className="text-muted small">Receipt</span>
                                    <button
                                        type="button"
                                        className="btn btn-outline-warning finance-mobile-emi__print"
                                        onClick={() => handlePrintPreview(item)}
                                    >
                                        <i className="bi bi-share-fill me-1"></i>
                                        Share
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="finance-mobile-empty">No EMI records found</div>
                    )}
                </div>

                {filteredData.length > 0 && (
                    <div className="finance-mobile-pager">
                        <div className="finance-mobile-pager__info">
                            {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
                        </div>
                        {totalPages > 1 && (
                            <div className="finance-mobile-pager__nav">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    aria-label="Previous page"
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <span className="finance-mobile-pager__page">{currentPage}/{totalPages}</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    aria-label="Next page"
                                >
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <EmiExportActions
                    disabled={!filteredData.length}
                    onPrint={handlePrintAll}
                    onPdf={handleDownloadAllPdf}
                    onWhatsApp={handleWhatsAppAll}
                    whatsAppLoading={sharingWhatsApp}
                />
            </div>

            {/* ========== Desktop view ========== */}
            <div className="d-none d-md-block">
                <div className="row g-2 align-items-center mb-3">
                    <div className="col-12 col-md-auto">
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
                    </div>

                    <div className="col-12 col-md">
                        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-md-end">
                            <button
                                className="btn btn-sm btn-success px-3 border-2"
                                onClick={onPayment}
                                disabled={totals.pendingAmt <= 0}
                                title={totals.pendingAmt <= 0 ? 'All installments are paid' : 'Make a payment'}
                            >
                                <i className="bi bi-wallet2 me-1"></i> Payment
                            </button>
                            {showInterestPayBtn && (
                                <button
                                    className="btn btn-sm btn-outline-warning px-3"
                                    onClick={onPayInterest}
                                    disabled={financeData?.fin_status === 'CLOSED'}
                                    title="Pay pending interest separately"
                                >
                                    <i className="bi bi-percent me-1"></i> Pay Interest
                                </button>
                            )}
                            {showPaidFineBtn && (
                                <button
                                    className="btn btn-sm btn-outline-danger px-3"
                                    onClick={onPaidFine}
                                    disabled={pendingFineTotal <= 0 || financeData?.fin_status === 'CLOSED'}
                                    title={pendingFineTotal <= 0 ? 'No pending fine/collect' : 'Pay fine / collect amount'}
                                >
                                    <i className="bi bi-exclamation-octagon me-1"></i> Paid Fine
                                </button>
                            )}
                            <button
                                className="btn btn-sm btn-warning px-3 text-dark"
                                onClick={onRollback}
                                disabled={!canRollback}
                                title={
                                    !canRollback
                                        ? 'No payment records to rollback'
                                        : 'Rollback EMI, interest, or fine payment'
                                }
                            >
                                <i className="bi bi-arrow-counterclockwise me-1"></i> Rollback
                            </button>
                            <button
                                className="btn btn-sm btn-danger px-3"
                                onClick={onClose}
                                disabled={!canCloseFinance || financeData?.fin_status === 'CLOSED'}
                                title={
                                    financeData?.fin_status === 'CLOSED'
                                        ? 'Finance is already closed'
                                        : !canCloseFinance
                                            ? 'Pay all EMIs and pending interest before closing'
                                            : 'Close this finance'
                                }
                            >
                                <i className="bi bi-x-circle me-1"></i> Close
                            </button>
                            <button className="btn btn-sm btn-primary px-3" onClick={onHistory}>
                                <i className="bi bi-clock-history me-1"></i> History
                            </button>
                        </div>
                    </div>

                    <div className="col-12 col-md-auto">{renderSearch()}</div>
                </div>

                {financeData && (
                    <div className="bg-light border rounded mb-3 shadow-sm overflow-x-auto">
                        <div className="row g-0 flex-nowrap align-items-center text-nowrap">
                            <div className="col-auto px-3 py-2 border-end">
                                <span className="text-muted small me-2">Prin Amt:</span>
                                <span className="fw-bold text-primary">{formatAmt(financeData.fin_prin_amt)}</span>
                            </div>
                            {showInterest && (
                                <>
                                    <div className="col-auto px-3 py-2 border-end">
                                        <span className="text-muted small me-2">ROI:</span>
                                        <span className="fw-bold text-dark">{interestSummary.roi_display}</span>
                                    </div>
                                    <div className="col-auto px-3 py-2 border-end">
                                        <span className="text-muted small me-2">Int Amt:</span>
                                        <span className="fw-bold text-warning">{formatAmt(interestSummary.interest_amt)}</span>
                                    </div>
                                    {interestSummary.interest_separate && (
                                        <>
                                            <div className="col-auto px-3 py-2 border-end bg-success bg-opacity-10">
                                                <span className="text-success small fw-bold me-2">Int Paid:</span>
                                                <span className="fw-bold text-success">{formatAmt(interestSummary.interest_paid)}</span>
                                            </div>
                                            <div className="col-auto px-3 py-2 border-end bg-warning bg-opacity-10">
                                                <span className="text-danger small fw-bold me-2">Int Pending:</span>
                                                <span className="fw-bold text-danger">{formatAmt(interestSummary.pending_interest)}</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            <div className="col-auto px-3 py-2 border-end">
                                <span className="text-muted small me-2">EMI Amt:</span>
                                <span className="fw-bold text-dark">{formatAmt(financeData.fin_emi_amt)}</span>
                            </div>
                            <div className="col-auto px-3 py-2 border-end">
                                <span className="text-muted small me-2">Cash Amt:</span>
                                <span className="fw-bold text-success">{formatAmt(financeData.fin_cash_amt)}</span>
                            </div>
                            <div className="col-auto px-3 py-2 border-end">
                                <span className="text-muted small me-2">Bank Amt:</span>
                                <span className="fw-bold text-info">{formatAmt(financeData.fin_bank_amt)}</span>
                            </div>
                            <div className="col-auto px-3 py-2 border-end">
                                <span className="text-muted small me-2">Online Amt:</span>
                                <span className="fw-bold text-secondary">{formatAmt(financeData.fin_online_amt)}</span>
                            </div>
                            <div className="col-auto px-3 py-2 border-end">
                                <span className="text-muted small me-2">Card Amt:</span>
                                <span className="fw-bold text-warning">{formatAmt(financeData.fin_card_amt)}</span>
                            </div>
                            <div className="col-auto px-3 py-2 border-end bg-success bg-opacity-10">
                                <span className="text-success small fw-bold me-2">Paid Amt:</span>
                                <span className="fw-bold text-success">{formatAmt(totals.paidAmt)}</span>
                            </div>
                            <div className="col-auto px-3 py-2 bg-danger bg-opacity-10">
                                <span className="text-danger small fw-bold me-2">Pen Amt:</span>
                                <span className="fw-bold text-danger">{formatAmt(totals.pendingAmt)}</span>
                            </div>
                            {showPaidFineBtn && (
                                <>
                                    {showFineColumn && (
                                        <div className="col-auto px-3 py-2 border-start border-end">
                                            <span className="text-muted small me-2">{fineSummary.label}:</span>
                                            <span className="fw-bold text-danger">{formatAmt(fineSummary.totalFine)}</span>
                                        </div>
                                    )}
                                    <div className="col-auto px-3 py-2">
                                        {showFineColumn && (
                                            <>
                                                <span className="text-muted small me-2">Fine Pending:</span>
                                                <span className="fw-bold text-danger">{formatAmt(fineSummary.pendingFine)}</span>
                                            </>
                                        )}
                                        {(parseFloat(fineSummary.collectAmt) || 0) > 0 && (
                                            <>
                                                {showFineColumn && <span className="text-muted small mx-2">|</span>}
                                                <span className="text-muted small me-2">Collect:</span>
                                                <span className="fw-bold text-primary">{formatAmt(fineSummary.pendingCollect)}</span>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="table table-hover table-bordered border-secondary mb-2 dataTable dtr-inline text-capitalize dynamic-data-table">
                        <thead className="table-secondary border-bottom border-dark-subtle">
                            <tr>
                                <th className="fw-semibold border">EMI No</th>
                                <th className="fw-semibold border">Start Date</th>
                                <th className="fw-semibold border">EMI Amt</th>
                                <th className="fw-semibold border">Due Date</th>
                                <th className="fw-semibold border">Paid Amt</th>
                                <th className="fw-semibold border">Pending Amt</th>
                                {showFineColumn && <th className="fw-semibold border">Fine</th>}
                                <th className="fw-semibold text-center border">Status</th>
                                <th className="fw-semibold text-center border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <tr key={item.ft_id || index}>
                                        <td className="fw-bold text-dark">{item.ft_emi_no}</td>
                                        <td className="text-secondary">{item.ft_start_date ? moment(item.ft_start_date).format('DD-MM-YYYY') : '-'}</td>
                                        <td className="fw-medium text-dark">{formatAmt(item.ft_emi_amt)}</td>
                                        <td>{item.ft_due_date ? moment(item.ft_due_date).format('DD-MM-YYYY') : '-'}</td>
                                        <td className="text-success">{formatAmt(item.ft_paid_amt)}</td>
                                        <td className="text-danger">{formatAmt(item.ft_pending_amt)}</td>
                                        {showFineColumn && (
                                            <td className="text-danger fw-medium">{formatAmt(item.ft_fine_amt)}</td>
                                        )}
                                        <td className="text-center">
                                            <span
                                                className={`badge rounded-pill ${statusBadgeClass(item.ft_emi_status)}`}
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                {item.ft_emi_status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-link text-warning p-0"
                                                title="Share Receipt"
                                                onClick={() => handlePrintPreview(item)}
                                            >
                                                <i className="bi bi-share-fill fs-6"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={showFineColumn ? 9 : 8} className="text-center py-4 text-muted">No records found</td>
                                </tr>
                            )}
                        </tbody>
                        {filteredData.length > 0 && (
                            <tfoot className="table-light">
                                <tr className="fw-bold">
                                    <th colSpan="2" className="text-center text-dark">Grand Total</th>
                                    <th className="text-primary">{formatAmt(totals.emiAmt)}</th>
                                    <th></th>
                                    <th className="text-success">{formatAmt(totals.paidAmt)}</th>
                                    <th className="text-danger">{formatAmt(totals.pendingAmt)}</th>
                                    {showFineColumn && (
                                        <th className="text-danger">{formatAmt(totals.fineAmt)}</th>
                                    )}
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

                <EmiExportActions
                    disabled={!filteredData.length}
                    onPrint={handlePrintAll}
                    onPdf={handleDownloadAllPdf}
                    onWhatsApp={handleWhatsAppAll}
                    whatsAppLoading={sharingWhatsApp}
                />
            </div>

            {receiptModal}
        </div>
    );
};

export default FinanceInfo;
