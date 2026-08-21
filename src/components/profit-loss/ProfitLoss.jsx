import React, { useRef, useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import CapitalAccount from "./CapitalAccount";
import ProfitLossAccount from "./ProfitLossAccount";
import TradingAccount from "./TradingAccount";
import ProfitLossMobileList from "./ProfitLossMobileList";
import ProfitLossCompliance from "./ProfitLossCompliance";
import { buildProfitLossAccounts, getAccountById } from "./profitLossData";
import {
  downloadProfitLossPdf,
  getProfitLossPdfBlob,
  getProfitLossShareText,
} from "./downloadProfitLossPdf";
import { getFirmsDropdown } from "../../api/firmApi";
import { getProfitLossEntries } from "../../api/profitLossApi";
import "../../css/ProfitLoss.css";

const ProfitLoss = () => {
  const { selectedFirmId } = useSelector((state) => state.firm);
  const dateRef = useRef(null);
  const mobileDateRef = useRef(null);
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(
    selectedFirmId === "all" ? "" : selectedFirmId
  );
  const [accounts, setAccounts] = useState([]);
  const [scheduleIII, setScheduleIII] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(false);

  const { fyStart, fyEnd } = useMemo(() => {
    const currentYear = moment().year();
    const isAfterMarch = moment().month() >= 3;
    const start = isAfterMarch
      ? moment(`${currentYear}-04-01`)
      : moment(`${currentYear - 1}-04-01`);
    const end = isAfterMarch
      ? moment(`${currentYear + 1}-03-31`)
      : moment(`${currentYear}-03-31`);
    return { fyStart: start, fyEnd: end };
  }, []);

  const [dateRange, setDateRange] = useState({
    startDate: fyStart.format("YYYY-MM-DD"),
    endDate: fyEnd.format("YYYY-MM-DD"),
  });

  useEffect(() => {
    setSelectedFirm(selectedFirmId === "all" ? "" : selectedFirmId);
  }, [selectedFirmId]);

  const assessmentYear = useMemo(() => {
    const endYear = moment(dateRange.endDate).year();
    return `${endYear} - ${endYear + 1}`;
  }, [dateRange.endDate]);

  const formattedStart = moment(dateRange.startDate).format("DD-MM-YYYY");
  const formattedEnd = moment(dateRange.endDate).format("DD-MM-YYYY");

  const selectedFirmData = firms.find(
    (f) => String(f.firm_id) === String(selectedFirm)
  );
  const firmDisplayName = selectedFirm
    ? selectedFirmData?.firm_name || "Selected Firm"
    : "All Firms";
  const companyName = selectedFirmData
    ? [selectedFirmData.firm_name, selectedFirmData.firm_address]
        .filter(Boolean)
        .join(", ")
    : firmDisplayName;

  const pdfOptions = {
    accounts,
    scheduleIII,
    compliance,
    firmName: firmDisplayName,
    companyName,
    periodStart: formattedStart,
    periodEnd: formattedEnd,
    assessmentYear,
  };

  const fetchFirms = async () => {
    try {
      const response = await getFirmsDropdown();
      if (response.success) {
        setFirms(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching firms:", error);
    }
  };

  const fetchProfitLoss = async (filters) => {
    setLoading(true);
    try {
      const response = await getProfitLossEntries(filters);
      if (response.success) {
        setAccounts(buildProfitLossAccounts(response.data));
        setScheduleIII(response.data?.scheduleIII || null);
        setCompliance(response.data?.compliance || null);
      } else {
        setAccounts([]);
        setScheduleIII(null);
        setCompliance(null);
      }
    } catch (error) {
      console.error("Error fetching profit & loss:", error);
      setAccounts([]);
      setScheduleIII(null);
      setCompliance(null);
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
        "This Month": [moment().startOf("month"), moment().endOf("month")],
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
    fetchProfitLoss({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      firmId: selectedFirm,
    });
  }, [dateRange, selectedFirm]);

  const handlePrint = () => {
    if (loading) return;
    window.print();
  };

  const handleDownloadPdf = () => {
    if (loading || !accounts.length) return;
    downloadProfitLossPdf(pdfOptions);
  };

  const handleWhatsAppShare = async () => {
    if (loading || !accounts.length) return;
    const shareText = getProfitLossShareText(pdfOptions);
    const fileName =
      `Profit_Loss_${formattedStart}_to_${formattedEnd}.pdf`.replace(
        /\//g,
        "-"
      );

    try {
      const blob = await getProfitLossPdfBlob(pdfOptions);
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Profit & Loss",
          text: shareText,
        });
        return;
      }
    } catch (error) {
      console.error("WhatsApp share failed:", error);
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const tradingAccount = getAccountById(accounts, "trading");
  const profitLossAccount = getAccountById(accounts, "profit-loss");
  const capitalAccount = getAccountById(accounts, "capital");

  return (
    <div className="card p-3 pt-1 shadow-sm profit-loss-page">
      <div className="row align-items-center mt-2">
        <div className="col-md-3 d-none d-md-flex mt-2 no-print">
          <input
            type="text"
            className="form-control border-dark text-center"
            placeholder="Select Date Range"
            ref={dateRef}
            readOnly
          />
        </div>
        <div className="col-12 col-md-6 mt-2 text-center">
          <h3 className="text-brown fw-bold mb-0 responsive-text">
            <i className="bi bi-bar-chart-line-fill me-2 responsive-text"></i>
            Profit & Loss
          </h3>
        </div>
        <div className="col-12 d-md-none mt-2 no-print">
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
            aria-label="Select firm"
          >
            <option value="">All Firms</option>
            {firms.map((firm) => (
              <option key={firm.firm_id} value={firm.firm_id}>
                {firm.firm_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 text-center">
          <div className="d-none d-md-block profit-loss-print-meta">
            <p className="pb-0 mb-0">
              <strong className="text-info-emphasis fw-bold">
                FINANCIAL YEAR:
              </strong>{" "}
              {formattedStart} To {formattedEnd}
            </p>
            <p className="pb-0 mb-0">
              <strong className="text-success-emphasis fw-bold">
                ASSESSMENT YEAR:
              </strong>{" "}
              {assessmentYear}
            </p>
            <p>
              <strong className="text-primary-emphasis fw-bold">
                {companyName}
              </strong>
            </p>
            <p className="pb-0 mb-1 d-none profit-loss-print-firm">
              <strong className="text-info-emphasis fw-bold">FIRM:</strong>{" "}
              {firmDisplayName}
            </p>
          </div>
          <div className="profit-loss-period-mobile d-md-none no-print">
            <i className="bi bi-calendar3" aria-hidden="true" />
            <span className="profit-loss-period-mobile__label">Period:</span>
            <span className="profit-loss-period-mobile__dates">
              {formattedStart} To {formattedEnd}
            </span>
          </div>
        </div>

        <div className="col-12 mt-2">
          {loading ? (
            <div className="text-center p-5 no-print">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="d-none d-md-block profit-loss-desktop-tables">
                <div className="mb-2">
                  <TradingAccount account={tradingAccount} />
                </div>
                <div className="mb-2">
                  <ProfitLossAccount account={profitLossAccount} />
                </div>
                <div className="mb-2">
                  <CapitalAccount account={capitalAccount} />
                </div>
                <ProfitLossCompliance
                  scheduleIII={scheduleIII}
                  compliance={compliance}
                />
              </div>

              <div className="d-md-none no-print">
                <ProfitLossMobileList accounts={accounts} />
                <ProfitLossCompliance
                  scheduleIII={scheduleIII}
                  compliance={compliance}
                />
              </div>
            </>
          )}

          <div className="text-center mt-3 mb-2 profit-loss-actions-wrap no-print">
            <div className="profit-loss-actions d-flex justify-content-center align-items-center gap-2">
              <button
                type="button"
                className="btn profit-loss-action-btn profit-loss-action-print"
                onClick={handlePrint}
                disabled={loading || !accounts.length}
                title="Print"
                aria-label="Print"
              >
                <i className="bi bi-printer-fill"></i>
              </button>
              <button
                type="button"
                className="btn profit-loss-action-btn profit-loss-action-pdf"
                onClick={handleDownloadPdf}
                disabled={loading || !accounts.length}
                title="Download PDF"
                aria-label="Download PDF"
              >
                <i className="bi bi-file-earmark-pdf-fill"></i>
              </button>
              <button
                type="button"
                className="btn profit-loss-action-btn profit-loss-action-whatsapp"
                onClick={handleWhatsAppShare}
                disabled={loading || !accounts.length}
                title="WhatsApp Share"
                aria-label="WhatsApp Share"
              >
                <i className="bi bi-whatsapp"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
