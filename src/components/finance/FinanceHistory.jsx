import React, { useState, useMemo } from 'react';
import List from '../common/List';
import moment from 'moment';
import HistoryReceiptModal from './HistoryReceiptModal';
import {
    downloadFinanceHistoryPdf,
    getFinanceHistoryPdfBlob,
    getFinanceHistoryShareText,
    getFinanceHistoryFileName,
    printFinanceHistorySchedule,
} from './downloadFinanceHistoryPdf';
import '../../css/Finance.css';

const formatAmt = (value) =>
    Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const typeBadgeClass = (type = '') => {
    const t = String(type).toUpperCase();
    if (t.includes('ROLLBACK')) return 'bg-danger-subtle text-danger';
    if (t.includes('FINE')) return 'bg-warning-subtle text-warning';
    if (t.includes('PAID') || t.includes('PAYMENT') || t.includes('CLOSE')) return 'bg-success-subtle text-success';
    return 'bg-primary-subtle text-primary';
};

const HistoryExportActions = ({ disabled, onPrint, onPdf, onWhatsApp }) => (
    <div className="text-center mt-3 mb-2 finance-info-actions-wrap no-print">
        <div className="finance-info-actions d-flex justify-content-center align-items-center gap-2">
            <button
                type="button"
                className="btn finance-info-action-btn finance-info-action-print"
                onClick={onPrint}
                disabled={disabled}
                title="Print all history"
                aria-label="Print all history"
            >
                <i className="bi bi-printer-fill"></i>
            </button>
            <button
                type="button"
                className="btn finance-info-action-btn finance-info-action-pdf"
                onClick={onPdf}
                disabled={disabled}
                title="Download all history PDF"
                aria-label="Download all history PDF"
            >
                <i className="bi bi-file-earmark-pdf-fill"></i>
            </button>
            <button
                type="button"
                className="btn finance-info-action-btn finance-info-action-whatsapp"
                onClick={onWhatsApp}
                disabled={disabled}
                title="WhatsApp share all history"
                aria-label="WhatsApp share all history"
            >
                <i className="bi bi-whatsapp"></i>
            </button>
        </div>
    </div>
);

const FinanceHistory = ({ data = [], isLoading, financeData, initialFinance }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
    const [selectedHistoryData, setSelectedHistoryData] = useState(null);

    const handlePrintPreview = (row) => {
        setSelectedHistoryData(row);
        setIsPrintPreviewOpen(true);
    };

    const filteredData = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return data;
        return data.filter((item) =>
            (item.fm_trans_date ? moment(item.fm_trans_date).format('DD-MM-YYYY') : '').includes(q) ||
            (item.fm_trans_type?.toLowerCase() || '').includes(q) ||
            (item.fm_other_info?.toLowerCase() || '').includes(q) ||
            (item.fm_trans_amt?.toString() || '').includes(q) ||
            (item.fm_cash_amt?.toString() || '').includes(q) ||
            (item.fm_bank_amt?.toString() || '').includes(q)
        );
    }, [data, searchQuery]);

    const totals = useMemo(() => {
        return filteredData.reduce(
            (acc, current) => {
                acc.transAmt += parseFloat(current.fm_trans_amt) || 0;
                acc.cashAmt += parseFloat(current.fm_cash_amt) || 0;
                acc.bankAmt += parseFloat(current.fm_bank_amt) || 0;
                acc.onlineAmt += parseFloat(current.fm_online_amt) || 0;
                acc.cardAmt += parseFloat(current.fm_card_amt) || 0;
                return acc;
            },
            { transAmt: 0, cashAmt: 0, bankAmt: 0, onlineAmt: 0, cardAmt: 0 }
        );
    }, [filteredData]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, currentPage, rowsPerPage]);

    const scheduleOptions = useMemo(
        () => ({
            rows: filteredData,
            totals,
            initialFinance,
            financeData,
        }),
        [filteredData, totals, initialFinance, financeData]
    );

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNo) => {
        if (pageNo >= 1 && pageNo <= totalPages) {
            setCurrentPage(pageNo);
        }
    };

    const handlePrintAll = () => {
        if (!filteredData.length) return;
        printFinanceHistorySchedule(scheduleOptions);
    };

    const handleDownloadAllPdf = () => {
        if (!filteredData.length) return;
        downloadFinanceHistoryPdf(scheduleOptions);
    };

    const handleWhatsAppAll = async () => {
        if (!filteredData.length) return;
        const shareText = getFinanceHistoryShareText(scheduleOptions);
        const fileName = getFinanceHistoryFileName(initialFinance);

        try {
            const blob = await getFinanceHistoryPdfBlob(scheduleOptions);
            const file = new File([blob], fileName, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Finance History',
                    text: shareText,
                });
                return;
            }
        } catch (error) {
            console.error('WhatsApp share failed:', error);
        }

        window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const columns = [
        {
            key: 'fm_trans_date',
            title: 'Date',
            orderable: true,
            searchable: true,
            dateFilter: true,
            render: (val) => moment(val).format('DD-MM-YYYY'),
        },
        { key: 'fm_trans_amt', title: 'Trans Amt', orderable: true, searchable: true, sum: true },
        { key: 'fm_cash_amt', title: 'Cash', orderable: true, searchable: true, sum: true },
        { key: 'fm_bank_amt', title: 'Bank', orderable: true, searchable: true, sum: true },
        { key: 'fm_online_amt', title: 'Online', orderable: true, searchable: true, sum: true },
        { key: 'fm_card_amt', title: 'Card', orderable: true, searchable: true, sum: true },
        { key: 'fm_trans_type', title: 'Trans Type', orderable: true, searchable: true },
        { key: 'fm_other_info', title: 'Other', orderable: true, searchable: true },
        {
            key: 'action',
            title: 'Actions',
            orderable: false,
            searchable: false,
            className: 'text-center',
            render: (val, type, row) => {
                return `<button class="btn btn-sm btn-link text-warning p-0 print-btn" data-id="${row.id || ''}" title="Share Receipt"><i class="bi bi-share-fill fs-6"></i></button>`;
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading finance history...</p>
            </div>
        );
    }

    const receiptModal = (
        <HistoryReceiptModal
            show={isPrintPreviewOpen}
            onHide={() => {
                setIsPrintPreviewOpen(false);
                setSelectedHistoryData(null);
            }}
            historyData={selectedHistoryData}
            initialFinance={initialFinance}
        />
    );

    return (
        <div className="finance-history-page">
            {/* ========== Mobile app view ========== */}
            <div className="d-md-none finance-mobile finance-history-mobile">
                <div className="finance-mobile-hero">
                    <div className="finance-mobile-hero__tile is-paid">
                        <span className="finance-mobile-hero__label">Total Trans</span>
                        <span className="finance-mobile-hero__value">{formatAmt(totals.transAmt)}</span>
                    </div>
                    <div className="finance-mobile-hero__tile is-pending finance-history-hero-count">
                        <span className="finance-mobile-hero__label">Entries</span>
                        <span className="finance-mobile-hero__value">{filteredData.length}</span>
                    </div>
                </div>

                <div className="finance-mobile-stats">
                    <div className="finance-mobile-stat">
                        <span className="finance-mobile-stat__label">Cash</span>
                        <span className="finance-mobile-stat__value text-success">{formatAmt(totals.cashAmt)}</span>
                    </div>
                    <div className="finance-mobile-stat">
                        <span className="finance-mobile-stat__label">Bank</span>
                        <span className="finance-mobile-stat__value text-info">{formatAmt(totals.bankAmt)}</span>
                    </div>
                    <div className="finance-mobile-stat">
                        <span className="finance-mobile-stat__label">Online</span>
                        <span className="finance-mobile-stat__value">{formatAmt(totals.onlineAmt)}</span>
                    </div>
                    <div className="finance-mobile-stat">
                        <span className="finance-mobile-stat__label">Card</span>
                        <span className="finance-mobile-stat__value text-warning">{formatAmt(totals.cardAmt)}</span>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="input-group input-group-sm finance-info-search">
                        <span className="input-group-text bg-white border-secondary-subtle">
                            <i className="bi bi-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-secondary-subtle"
                            placeholder="Search history..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                <div className="finance-mobile-list">
                    {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                            <article key={item.fm_id || item.id || index} className="finance-mobile-emi">
                                <div className="finance-mobile-emi__top">
                                    <div>
                                        <p className="finance-mobile-emi__no">
                                            {item.fm_trans_date
                                                ? moment(item.fm_trans_date).format('DD-MM-YYYY')
                                                : '-'}
                                        </p>
                                        <div className="finance-mobile-emi__dates">
                                            Trans Amt: {formatAmt(item.fm_trans_amt)}
                                        </div>
                                    </div>
                                    <span className={`badge rounded-pill finance-mobile-emi__badge ${typeBadgeClass(item.fm_trans_type)}`}>
                                        {item.fm_trans_type || '-'}
                                    </span>
                                </div>

                                <div className="finance-mobile-emi__grid finance-history-grid">
                                    <div className="finance-mobile-emi__cell">
                                        <span className="finance-mobile-emi__cell-label">Cash</span>
                                        <span className="finance-mobile-emi__cell-value is-paid">{formatAmt(item.fm_cash_amt)}</span>
                                    </div>
                                    <div className="finance-mobile-emi__cell">
                                        <span className="finance-mobile-emi__cell-label">Bank</span>
                                        <span className="finance-mobile-emi__cell-value is-emi">{formatAmt(item.fm_bank_amt)}</span>
                                    </div>
                                    <div className="finance-mobile-emi__cell">
                                        <span className="finance-mobile-emi__cell-label">Online</span>
                                        <span className="finance-mobile-emi__cell-value is-emi">{formatAmt(item.fm_online_amt)}</span>
                                    </div>
                                    <div className="finance-mobile-emi__cell">
                                        <span className="finance-mobile-emi__cell-label">Card</span>
                                        <span className="finance-mobile-emi__cell-value is-emi">{formatAmt(item.fm_card_amt)}</span>
                                    </div>
                                </div>

                                {item.fm_other_info ? (
                                    <div className="finance-history-other text-muted small mb-2">
                                        {item.fm_other_info}
                                    </div>
                                ) : null}

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
                        <div className="finance-mobile-empty">No history records found</div>
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

                <HistoryExportActions
                    disabled={!filteredData.length}
                    onPrint={handlePrintAll}
                    onPdf={handleDownloadAllPdf}
                    onWhatsApp={handleWhatsAppAll}
                />
            </div>

            {/* ========== Desktop view ========== */}
            <div className="d-none d-md-block">
                <List
                    data={data}
                    columns={columns}
                    title="Finance Payment History"
                    showMobileList={false}
                    hasEdit={false}
                    hasDelete={false}
                    hasPrint={false}
                    hasView={false}
                    isLoading={false}
                    showFooter={true}
                    onPrint={handlePrintPreview}
                />
                <HistoryExportActions
                    disabled={!data.length}
                    onPrint={handlePrintAll}
                    onPdf={handleDownloadAllPdf}
                    onWhatsApp={handleWhatsAppAll}
                />
            </div>

            {receiptModal}
        </div>
    );
};

export default FinanceHistory;
