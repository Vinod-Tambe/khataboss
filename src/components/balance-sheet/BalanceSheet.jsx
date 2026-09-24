import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux';
import BalanceSheetReport from './BalanceSheetReport'
import moment from "moment";

import { getFirmsDropdown } from '../../api/firmApi';
import { getBalanceSheetEntries } from '../../api/balanceSheetApi';
import {
  downloadBalanceSheetPdf,
  getBalanceSheetPdfBlob,
} from './downloadBalanceSheetPdf';
import '../../css/BalanceSheet.css';
import { toast } from 'react-toastify';
import {
  resolveWhatsAppFirmId,
  sendReportWhatsAppPdf,
} from '../../utils/dispatchWhatsAppReport';

const BalanceSheet = () => {
    const { selectedFirmId } = useSelector((state) => state.firm);
    const authUser = useSelector((state) => state.auth.user);
    
    // Calculate current financial year (April to March)
    const { fyStart, fyEnd, currentFY } = useMemo(() => {
        const now = moment();
        const currentYear = now.year();
        const isAfterMarch = now.month() >= 3;
        const start = isAfterMarch ? moment(`${currentYear}-04-01`) : moment(`${currentYear - 1}-04-01`);
        const end = isAfterMarch ? moment(`${currentYear + 1}-03-31`) : moment(`${currentYear}-03-31`);
        const fyString = `${start.year()}-${end.year()}`;
        return { fyStart: start, fyEnd: end, currentFY: fyString };
    }, []);

    const [selectedYear, setSelectedYear] = useState(currentFY);
    const [firms, setFirms] = useState([]);
    const [selectedFirm, setSelectedFirm] = useState(selectedFirmId === 'all' ? "" : selectedFirmId);
    const [balanceSheetData, setBalanceSheetData] = useState({ assets: [], liabilities: [] });
    const [loading, setLoading] = useState(false);
    const [sharingWhatsApp, setSharingWhatsApp] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: fyStart.format("YYYY-MM-DD"),
        endDate: fyEnd.format("YYYY-MM-DD")
    });

    // Sync with global firm selection
    useEffect(() => {
        setSelectedFirm(selectedFirmId === 'all' ? "" : selectedFirmId);
    }, [selectedFirmId]);

    const fetchFirms = async () => {
        try {
            const response = await getFirmsDropdown();
            if (response.success && response.data.length > 0) {
                setFirms(response.data);
            }
        } catch (error) {
            console.error("Error fetching firms:", error);
        }
    };

    const fetchBalanceSheet = async (filters) => {
        setLoading(true);
        try {
            const response = await getBalanceSheetEntries(filters);
            if (response.success) {
                setBalanceSheetData(response.data);
            }
        } catch (error) {
            console.error("Error fetching balance sheet:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFirms();
    }, []);

    useEffect(() => {
        const filters = {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            firmId: selectedFirm
        };
        fetchBalanceSheet(filters);
    }, [dateRange, selectedFirm]);

    const selectedFirmData = firms.find((f) => String(f.firm_id) === String(selectedFirm));
    const firmDisplayName = selectedFirm
        ? (selectedFirmData?.firm_name || 'Selected Firm')
        : 'All Firms';

    const formattedStart = moment(dateRange.startDate).format("DD-MM-YYYY");
    const formattedEnd = moment(dateRange.endDate).format("DD-MM-YYYY");

    const pdfOptions = {
        data: balanceSheetData,
        firmName: firmDisplayName,
        periodStart: formattedStart,
        periodEnd: formattedEnd,
    };

    const handlePrint = () => {
        if (loading) return;
        window.print();
    };

    const handleDownloadPdf = () => {
        if (loading) return;
        downloadBalanceSheetPdf(pdfOptions);
    };

    const handleWhatsAppShare = async () => {
        if (loading || sharingWhatsApp) return;
        setSharingWhatsApp(true);
        const fileName = `Balance_Sheet_${formattedStart}_to_${formattedEnd}.pdf`.replace(/\//g, '-');
        const periodText = `${formattedStart} to ${formattedEnd}`;
        const firmId = resolveWhatsAppFirmId(selectedFirm, firms, selectedFirmId);

        try {
            const blob = await getBalanceSheetPdfBlob(pdfOptions);
            const { message } = await sendReportWhatsAppPdf({
                reportType: 'balanceSheet',
                firmId,
                authUser,
                pdfBlob: blob,
                fileName,
                reportLabel: 'Balance Sheet',
                periodText,
            });
            toast.success(message);
        } catch (error) {
            console.error('WhatsApp share failed:', error);
            toast.error(error.message || 'Failed to send WhatsApp message.');
        } finally {
            setSharingWhatsApp(false);
        }
    };

    return (
        <div className="card p-3 pt-1 shadow-sm balance-sheet-page app-module-panel">
            <div className="row align-items-center mt-2 g-2">
                <div className="col-6 col-md-3 no-print">
                    <select 
                        className="form-select border-dark text-center"
                        value={selectedYear}
                        onChange={(e) => {
                            const yearVal = e.target.value;
                            setSelectedYear(yearVal);
                            const [startYear, endYear] = yearVal.split("-");
                            setDateRange({
                                startDate: `${startYear}-04-01`,
                                endDate: `${endYear}-03-31`
                            });
                        }}
                        aria-label="Financial year"
                    >
                        <option value="2023-2024">2023-2024</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                    </select>
                </div>
                <div className="col-12 col-md-6 order-first order-md-0 text-center">
                    <h3 className="text-brown fw-bold mb-0 responsive-text">
                        <i className="bi bi-clipboard-data me-2 responsive-text"></i>
                        Balance Sheet
                    </h3>
                </div>
                <div className="col-6 col-md-3 no-print">
                    <select 
                        className="form-select border-dark text-center"
                        value={selectedFirm}
                        onChange={(e) => setSelectedFirm(e.target.value)}
                        aria-label="Select firm"
                    >
                        <option value="">All Firms</option>
                        {firms.map(firm => (
                            <option key={firm.firm_id} value={firm.firm_id}>
                                {firm.firm_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row mt-2">
                <div className="col-12 text-center">
                    {selectedFirmData && (
                        <div className="d-none d-md-block">
                            <h4 className="text-primary-emphasis fw-bold mb-1">
                                {selectedFirmData.firm_name.toUpperCase()}
                            </h4>
                            <p className="mb-1 fw-bold text-secondary">
                                {selectedFirmData.firm_address || ""}
                            </p>
                        </div>
                    )}
                    <p className="pb-0 mb-0 d-none d-md-block balance-sheet-print-period">
                        <strong className="text-info-emphasis fw-bold">PERIOD:</strong>{' '}
                        {formattedStart} To {formattedEnd}
                    </p>
                    <p className="pb-0 mb-1 d-none balance-sheet-print-firm">
                        <strong className="text-info-emphasis fw-bold">FIRM:</strong>{' '}
                        {firmDisplayName}
                    </p>
                    <div className="balance-sheet-period-mobile d-md-none no-print">
                        <i className="bi bi-calendar3"></i>
                        <span className="balance-sheet-period-mobile__label">Period:</span>
                        <span className="balance-sheet-period-mobile__dates">
                            {formattedStart} To {formattedEnd}
                        </span>
                    </div>
                </div>
                <div className="col-md-12 mt-3">
                    {loading ? (
                        <div className="text-center p-5 no-print">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <BalanceSheetReport balanceSheetData={balanceSheetData} />
                    )}
                </div>
            </div>

            <div className="text-center mt-3 mb-2 balance-sheet-actions-wrap no-print">
                <div className="balance-sheet-actions d-flex justify-content-center align-items-center gap-2">
                    <button
                        type="button"
                        className="btn balance-sheet-action-btn balance-sheet-action-print"
                        onClick={handlePrint}
                        disabled={loading}
                        title="Print"
                        aria-label="Print"
                    >
                        <i className="bi bi-printer-fill"></i>
                    </button>
                    <button
                        type="button"
                        className="btn balance-sheet-action-btn balance-sheet-action-pdf"
                        onClick={handleDownloadPdf}
                        disabled={loading}
                        title="Download PDF"
                        aria-label="Download PDF"
                    >
                        <i className="bi bi-file-earmark-pdf-fill"></i>
                    </button>
                    <button
                        type="button"
                        className="btn balance-sheet-action-btn balance-sheet-action-whatsapp"
                        onClick={handleWhatsAppShare}
                        disabled={loading || sharingWhatsApp}
                        title="WhatsApp Share"
                        aria-label="WhatsApp Share"
                    >
                        <i className="bi bi-whatsapp"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BalanceSheet
