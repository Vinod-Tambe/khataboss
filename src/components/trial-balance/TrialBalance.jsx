import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux';
import TrialBalanceReport from './TrialBalanceReport'
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import { getFirmsDropdown } from '../../api/firmApi';
import { getTrialBalanceEntries } from '../../api/trialBalanceApi';
import {
  downloadTrialBalancePdf,
  getTrialBalancePdfBlob,
  getTrialBalanceShareText,
} from './downloadTrialBalancePdf';
import '../../css/TrialBalance.css';

const TrialBalance = () => {
  const { selectedFirmId } = useSelector((state) => state.firm);
  const dateRef = useRef(null);
  const mobileDateRef = useRef(null);
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(selectedFirmId === 'all' ? "" : selectedFirmId);
  const [trialBalanceData, setTrialBalanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Calculate current financial year (April to March)
  const { fyStart, fyEnd } = useMemo(() => {
    const currentYear = moment().year();
    const isAfterMarch = moment().month() >= 3;
    const start = isAfterMarch ? moment(`${currentYear}-04-01`) : moment(`${currentYear - 1}-04-01`);
    const end = isAfterMarch ? moment(`${currentYear + 1}-03-31`) : moment(`${currentYear}-03-31`);
    return { fyStart: start, fyEnd: end };
  }, []);

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
      if (response.success) {
        setFirms(response.data);
      }
    } catch (error) {
      console.error("Error fetching firms:", error);
    }
  };

  const fetchTrialBalance = async (filters) => {
    setLoading(true);
    try {
      const response = await getTrialBalanceEntries(filters);
      if (response.success) {
        setTrialBalanceData(response.data);
      }
    } catch (error) {
      console.error("Error fetching trial balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  useEffect(() => {
    const pickerOptions = {
      startDate: fyStart,
      endDate: fyEnd,
      autoUpdateInput: false,
      locale: { format: "DD-MM-YYYY", cancelLabel: "Clear" },
      ranges: {
        Today: [moment(), moment()],
        "This Month": [
          moment().startOf("month"),
          moment().endOf("month"),
        ],
        "Last Month": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
        "Current Financial Year": [fyStart, fyEnd],
        "Last Financial Year": [
          moment(fyStart).subtract(1, "year"),
          moment(fyEnd).subtract(1, "year"),
        ],
      },
    };

    const defaultLabel = `${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`;

    const bindPicker = (inputEl) => {
      if (!inputEl) return () => {};
      $(inputEl).daterangepicker(pickerOptions, (start, end) => {
        const label = `${start.format("DD-MM-YYYY")} - ${end.format("DD-MM-YYYY")}`;
        $(dateRef.current).val(label);
        $(mobileDateRef.current).val(label);
        setDateRange({
          startDate: start.format("YYYY-MM-DD"),
          endDate: end.format("YYYY-MM-DD"),
        });
      });
      $(inputEl).val(defaultLabel);
      return () => {
        $(inputEl).data("daterangepicker")?.remove();
      };
    };

    const cleanupDesktop = bindPicker(dateRef.current);
    const cleanupMobile = bindPicker(mobileDateRef.current);
    return () => {
      cleanupDesktop();
      cleanupMobile();
    };
  }, [fyStart, fyEnd]);

  useEffect(() => {
    const filters = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      firmId: selectedFirm
    };
    fetchTrialBalance(filters);
  }, [dateRange, selectedFirm]);

  const selectedFirmData = firms.find((f) => String(f.firm_id) === String(selectedFirm));
  const firmDisplayName = selectedFirm
    ? (selectedFirmData?.firm_name || 'Selected Firm')
    : 'All Firms';

  const formattedStart = moment(dateRange.startDate).format("DD-MM-YYYY");
  const formattedEnd = moment(dateRange.endDate).format("DD-MM-YYYY");

  const pdfOptions = {
    data: trialBalanceData,
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
    downloadTrialBalancePdf(pdfOptions);
  };

  const handleWhatsAppShare = async () => {
    if (loading) return;
    const shareText = getTrialBalanceShareText(pdfOptions);
    const fileName = `Trial_Balance_${formattedStart}_to_${formattedEnd}.pdf`.replace(/\//g, '-');

    try {
      const blob = await getTrialBalancePdfBlob(pdfOptions);
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Trial Balance',
          text: shareText,
        });
        return;
      }
    } catch (error) {
      console.error('WhatsApp share via file failed:', error);
    }

    // Fallback: open WhatsApp with summary text
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card p-3 pt-1 shadow-sm trial-balance-page">
      <div className="row align-items-center mt-2">
        <div className="col-md-3 d-none d-md-flex mt-2 no-print">
          <input
            type="text"
            className="form-control border-dark text-center"
            placeholder="Select Date Range"
            ref={dateRef}
          />
        </div>
        <div className="col-md-6 mt-2 text-center">
          <h3 className="text-brown fw-bold mb-0 responsive-text">
            <i className="bi bi-bar-chart-line-fill me-2 responsive-text"></i>
            Trial Balance
          </h3>
        </div>
        <div className="col-12 col-md-3 d-md-none mt-2 no-print">
          <input
            type="text"
            className="form-control border-dark text-center"
            placeholder="Select Date Range"
            ref={mobileDateRef}
            readOnly
          />
        </div>
        <div className="col-12 col-md-3 mt-2 no-print">
          <select
            className="form-select border-dark text-center"
            value={selectedFirm}
            onChange={(e) => setSelectedFirm(e.target.value)}
          >
            <option value="">All Firms</option>
            {firms.map(firm => (
              <option key={firm.firm_id} value={firm.firm_id}>
                {firm.firm_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 text-center">
          {/* Desktop period — also used when printing */}
          <p className="pb-0 mb-0 d-none d-md-block trial-balance-print-period">
            <strong className="text-info-emphasis fw-bold">PERIOD:</strong>{' '}
            {formattedStart} To {formattedEnd}
          </p>
          <p className="pb-0 mb-1 d-none trial-balance-print-firm">
            <strong className="text-info-emphasis fw-bold">FIRM:</strong>{' '}
            {firmDisplayName}
          </p>
          {/* Mobile period chip — screen only */}
          <div className="trial-balance-period-mobile d-md-none no-print">
            <i className="bi bi-calendar3"></i>
            <span className="trial-balance-period-mobile__label">Period:</span>
            <span className="trial-balance-period-mobile__dates">
              {formattedStart} To {formattedEnd}
            </span>
          </div>
        </div>
        <div className="col-md-12">
          {loading ? (
            <div className="text-center p-5 no-print">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <TrialBalanceReport data={trialBalanceData} />
          )}
        </div>
      </div>
      {/* Same icon actions for desktop + mobile */}
      <div className="text-center mt-3 mb-2 trial-balance-actions-wrap no-print">
        <div className="trial-balance-actions d-flex justify-content-center align-items-center gap-2">
          <button
            type="button"
            className="btn trial-balance-action-btn trial-balance-action-print"
            onClick={handlePrint}
            disabled={loading}
            title="Print"
            aria-label="Print"
          >
            <i className="bi bi-printer-fill"></i>
          </button>
          <button
            type="button"
            className="btn trial-balance-action-btn trial-balance-action-pdf"
            onClick={handleDownloadPdf}
            disabled={loading}
            title="Download PDF"
            aria-label="Download PDF"
          >
            <i className="bi bi-file-earmark-pdf-fill"></i>
          </button>
          <button
            type="button"
            className="btn trial-balance-action-btn trial-balance-action-whatsapp"
            onClick={handleWhatsAppShare}
            disabled={loading}
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

export default TrialBalance
