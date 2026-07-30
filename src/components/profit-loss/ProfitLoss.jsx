import React, { useRef, useEffect, useState, useMemo } from "react";
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import CapitalAccount from "./CapitalAccount";
import ProfitLossAccount from "./ProfitLossAccount";
import TradingAccount from "./TradingAccount";
import ProfitLossMobileList from "./ProfitLossMobileList";
import { PROFIT_LOSS_ACCOUNTS } from "./profitLossData";
import {
  downloadProfitLossPdf,
  getProfitLossPdfBlob,
  getProfitLossShareText,
} from "./downloadProfitLossPdf";
import "../../css/ProfitLoss.css";

const COMPANY_NAME =
  "TAHLKA FINANCE & COMPANY, MAHESH SHARMA WARD NO 18, RAJGARH CHURU";

const ProfitLoss = () => {
  const dateRef = useRef(null);
  const mobileDateRef = useRef(null);
  const [selectedFirm, setSelectedFirm] = useState("Ram");

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

  const assessmentYear = useMemo(() => {
    const startYear = moment(dateRange.startDate).year();
    const endYear = moment(dateRange.endDate).year();
    return `${startYear} - ${endYear}`;
  }, [dateRange]);

  const formattedStart = moment(dateRange.startDate).format("DD-MM-YYYY");
  const formattedEnd = moment(dateRange.endDate).format("DD-MM-YYYY");

  const pdfOptions = {
    accounts: PROFIT_LOSS_ACCOUNTS,
    firmName: selectedFirm,
    companyName: COMPANY_NAME,
    periodStart: formattedStart,
    periodEnd: formattedEnd,
    assessmentYear,
  };

  useEffect(() => {
    const inputs = [dateRef.current, mobileDateRef.current].filter(Boolean);
    if (!inputs.length) return;

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

    const onApply = (start, end) => {
      const label = `${start.format("DD-MM-YYYY")} - ${end.format("DD-MM-YYYY")}`;
      inputs.forEach((el) => $(el).val(label));
      setDateRange({
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
      });
    };

    inputs.forEach((el) => {
      $(el).daterangepicker(pickerOptions, onApply);
      $(el).val(
        `${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`
      );
    });

    return () => {
      inputs.forEach((el) => {
        $(el).data("daterangepicker")?.remove();
      });
    };
  }, [fyStart, fyEnd]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadProfitLossPdf(pdfOptions);
  };

  const handleWhatsAppShare = async () => {
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
            <option disabled value="">
              Select Firm
            </option>
            <option value="Ram">Ram</option>
            <option value="Sham">Sham</option>
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
                {COMPANY_NAME}
              </strong>
            </p>
            <p className="pb-0 mb-1 d-none profit-loss-print-firm">
              <strong className="text-info-emphasis fw-bold">FIRM:</strong>{" "}
              {selectedFirm}
            </p>
          </div>

        </div>

        <div className="col-12 mt-2">
          <div className="d-none d-md-block profit-loss-desktop-tables">
            <div className="mb-2">
              <TradingAccount />
            </div>
            <div className="mb-2">
              <ProfitLossAccount />
            </div>
            <div className="mb-2">
              <CapitalAccount />
            </div>
          </div>

          <div className="d-md-none no-print">
            <ProfitLossMobileList accounts={PROFIT_LOSS_ACCOUNTS} />
          </div>

          <div className="text-center mt-3 mb-2 profit-loss-actions-wrap no-print">
            <div className="profit-loss-actions d-flex justify-content-center align-items-center gap-2">
              <button
                type="button"
                className="btn profit-loss-action-btn profit-loss-action-print"
                onClick={handlePrint}
                title="Print"
                aria-label="Print"
              >
                <i className="bi bi-printer-fill"></i>
              </button>
              <button
                type="button"
                className="btn profit-loss-action-btn profit-loss-action-pdf"
                onClick={handleDownloadPdf}
                title="Download PDF"
                aria-label="Download PDF"
              >
                <i className="bi bi-file-earmark-pdf-fill"></i>
              </button>
              <button
                type="button"
                className="btn profit-loss-action-btn profit-loss-action-whatsapp"
                onClick={handleWhatsAppShare}
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
