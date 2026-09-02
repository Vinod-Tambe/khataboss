import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import DayBookTable from "./DayBookTable";
import DayBookProcessingTable from "./DayBookProcessingTable";
import DayBookFirstMonthInterestTable from "./DayBookFirstMonthInterestTable";
import DayBookSummary from "./DayBookSummary";
import DayBookMobileView from "./DayBookMobileView";
import { getDaybookEntries } from "../../api/daybookApi";
import { useSelector } from "react-redux";
import { getFirmsDropdown } from "../../api/firmApi";
import { showToast } from "../../components/common/ToastAlert";
import { DAYBOOK_SECTIONS, isProcessingDaybookSection, isFirstMonthInterestDaybookSection } from "./dayBookUtils";
import {
  downloadDayBookPdf,
  getDayBookPdfBlob,
  getDayBookShareText,
} from "./downloadDayBookPdf";
import "../../css/DayBook.css";

const Daybook = () => {
  const dateRef = useRef(null);
  const mobileDateRef = useRef(null);
  const { selectedFirmId } = useSelector((state) => state.firm);
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(selectedFirmId === 'all' ? "" : selectedFirmId);

  useEffect(() => {
    setSelectedFirm(selectedFirmId === 'all' ? "" : selectedFirmId);
  }, [selectedFirmId]);

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
    startDate: fyStart.format('YYYY-MM-DD'),
    endDate: fyEnd.format('YYYY-MM-DD')
  });
  const [daybookResponse, setDaybookResponse] = useState({ daybook_data: [], summary: {} });
  const [loading, setLoading] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState("");

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const res = await getFirmsDropdown();
        setFirms(res.data || []);
      } catch (err) {
        console.error("Error fetching firms:", err);
      }
    };
    fetchFirms();
  }, []);

  const fetchDaybook = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        firmId: selectedFirm,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      const res = await getDaybookEntries(filters);
      if (res.success) {
        setDaybookResponse(res.data);
      } else {
        showToast(res.message || "Failed to fetch daybook", "error");
      }
    } catch (err) {
      showToast(err.message || "Failed to fetch daybook", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedFirm, dateRange]);

  useEffect(() => {
    fetchDaybook();
  }, [fetchDaybook]);

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

  const getSectionData = (title) => {
    return (daybookResponse.daybook_data || []).find(d => d.title === title) || { data: [] };
  };

  const keyedDaybookData = (daybookResponse.daybook_data || []).reduce((acc, item) => {
    if (isProcessingDaybookSection(item.title)) {
      const totals = (item.data || []).reduce(
        (t, d) => ({
          total_cash_amt: t.total_cash_amt + (parseFloat(d.db_cash_amt) || 0),
          total_bank_amt: t.total_bank_amt + (parseFloat(d.db_bank_amt) || 0),
          total_online_amt: t.total_online_amt + (parseFloat(d.db_online_amt) || 0),
          total_card_amt: t.total_card_amt + (parseFloat(d.db_card_amt) || 0),
          total_disc_amt: t.total_disc_amt + (parseFloat(d.db_disc_amt) || 0),
        }),
        {
          total_cash_amt: 0,
          total_bank_amt: 0,
          total_online_amt: 0,
          total_card_amt: 0,
          total_disc_amt: 0,
        }
      );

      totals.total_amt =
        totals.total_cash_amt +
        totals.total_bank_amt +
        totals.total_online_amt +
        totals.total_card_amt;
      acc[item.title] = totals;
      return acc;
    }

    if (isFirstMonthInterestDaybookSection(item.title)) {
      const totals = (item.data || []).reduce(
        (t, d) => ({
          total_cash_amt: t.total_cash_amt + (parseFloat(d.db_cash_amt) || 0),
          total_bank_amt: t.total_bank_amt + (parseFloat(d.db_bank_amt) || 0),
          total_online_amt: t.total_online_amt + (parseFloat(d.db_online_amt) || 0),
          total_card_amt: t.total_card_amt + (parseFloat(d.db_card_amt) || 0),
          total_disc_amt: t.total_disc_amt + (parseFloat(d.db_disc_amt) || 0),
        }),
        {
          total_cash_amt: 0,
          total_bank_amt: 0,
          total_online_amt: 0,
          total_card_amt: 0,
          total_disc_amt: 0,
        }
      );

      totals.total_amt =
        totals.total_cash_amt +
        totals.total_bank_amt +
        totals.total_online_amt +
        totals.total_card_amt;
      acc[item.title] = totals;
      return acc;
    }

    const totals = (item.data || []).reduce((t, d) => ({
      total_cash_amt: t.total_cash_amt + (parseFloat(d.db_cash_amt) || 0),
      total_bank_amt: t.total_bank_amt + (parseFloat(d.db_bank_amt) || 0),
      total_online_amt: t.total_online_amt + (parseFloat(d.db_online_amt) || 0),
      total_card_amt: t.total_card_amt + (parseFloat(d.db_card_amt) || 0),
      total_disc_amt: t.total_disc_amt + (parseFloat(d.db_disc_amt) || 0),
    }), { total_cash_amt: 0, total_bank_amt: 0, total_online_amt: 0, total_card_amt: 0, total_disc_amt: 0 });

    totals.total_amt = totals.total_cash_amt + totals.total_bank_amt + totals.total_online_amt + totals.total_card_amt;

    acc[item.title] = totals;
    return acc;
  }, {});

  const selectedFirmData = firms.find((f) => String(f.firm_id) === String(selectedFirm));
  const firmDisplayName = selectedFirm
    ? (selectedFirmData?.firm_name || 'Selected Firm')
    : 'All Firms';

  const formattedStart = moment(dateRange.startDate).format("DD-MM-YYYY");
  const formattedEnd = moment(dateRange.endDate).format("DD-MM-YYYY");
  const openingDisplay = daybookResponse.summary?.total_open_amt || "0.00";

  const availablePanels = useMemo(
    () =>
      DAYBOOK_SECTIONS.map((section) => {
        const data = getSectionData(section.title).data || [];
        return {
          ...section,
          data,
          count: data.length,
          amtColor: section.amtTone === "dr" ? "text-success" : "text-danger",
        };
      }).filter((section) => section.count > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [daybookResponse]
  );

  const displayedPanels = useMemo(() => {
    if (!selectedPanel) return availablePanels;
    const match = availablePanels.filter((p) => p.title === selectedPanel);
    return match.length > 0 ? match : availablePanels;
  }, [availablePanels, selectedPanel]);

  const pdfOptions = {
    panels: availablePanels,
    keyedDaybookData,
    openingData: daybookResponse.summary || {},
    firmName: firmDisplayName,
    periodStart: formattedStart,
    periodEnd: formattedEnd,
    openingDisplay,
  };

  const handlePrint = () => {
    if (loading) return;
    window.print();
  };

  const handleDownloadPdf = () => {
    if (loading) return;
    downloadDayBookPdf(pdfOptions);
  };

  const handleWhatsAppShare = async () => {
    if (loading) return;
    const shareText = getDayBookShareText(pdfOptions);
    const fileName = `Daily_Dairy_${formattedStart}_to_${formattedEnd}.pdf`.replace(/\//g, '-');

    try {
      const blob = await getDayBookPdfBlob(pdfOptions);
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Daily Dairy',
          text: shareText,
        });
        return;
      }
    } catch (error) {
      console.error('WhatsApp share via file failed:', error);
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  const renderPanelTable = (panel, { print = false } = {}) => {
    const key = print ? `print-${panel.title}` : panel.title;

    if (isProcessingDaybookSection(panel.title)) {
      return (
        <DayBookProcessingTable
          key={key}
          title={panel.title}
          data={panel.data}
          isPrint={print}
        />
      );
    }

    if (isFirstMonthInterestDaybookSection(panel.title)) {
      return (
        <DayBookFirstMonthInterestTable
          key={key}
          title={panel.title}
          data={panel.data}
          isPrint={print}
        />
      );
    }

    return (
      <DayBookTable
        key={key}
        title={panel.title}
        colorClass={panel.colorClass}
        amtColor={panel.amtColor}
        data={panel.data}
        isPrint={print}
      />
    );
  };

  return (
    <div className="card p-3 pt-1 shadow-sm mb-4 daybook-page">
      <div className="row align-items-center mt-2 g-2 daybook-filters">
        <div className="col-12 col-md-3 text-center text-md-start">
          <h3 className="text-brown fw-bold mb-0 responsive-text daybook-title">
            <i className="bi bi-journal-text me-2 responsive-text"></i>
            DAILY DAIRY
          </h3>
        </div>

        <div className="col-md-3 d-none d-md-block no-print">
          <input
            type="text"
            ref={dateRef}
            className="form-control border-dark text-center"
            placeholder="Select Date Range"
            readOnly
          />
        </div>

        <div className="col-12 d-md-none no-print">
          <input
            type="text"
            ref={mobileDateRef}
            className="form-control form-control-sm border-dark text-center daybook-filter-control"
            placeholder="Select Date Range"
            readOnly
          />
        </div>

        <div className="col-md-3 d-none d-md-block no-print">
          <select
            className="form-select border-dark text-center"
            value={selectedFirm}
            onChange={(e) => setSelectedFirm(e.target.value)}
            aria-label="Select firm"
          >
            <option value="">All Firms</option>
            {firms.map(firm => (
              <option key={firm.firm_id} value={firm.firm_id}>{firm.firm_name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3 d-none d-md-block no-print">
          <select
            className="form-select border-dark text-center"
            value={selectedPanel}
            onChange={(e) => setSelectedPanel(e.target.value)}
            aria-label="Select panel"
            disabled={!availablePanels.length}
          >
            {!availablePanels.length ? (
              <option value="">Select Panel</option>
            ) : (
              <>
                <option value="">All Panels</option>
                {availablePanels.map((panel) => (
                  <option key={panel.title} value={panel.title}>
                    {panel.title} ({panel.count})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="col-6 d-md-none no-print">
          <select
            className="form-select form-select-sm border-dark text-center daybook-filter-control"
            value={selectedFirm}
            onChange={(e) => setSelectedFirm(e.target.value)}
            aria-label="Select firm"
          >
            <option value="">All Firms</option>
            {firms.map(firm => (
              <option key={firm.firm_id} value={firm.firm_id}>{firm.firm_name}</option>
            ))}
          </select>
        </div>
        <div className="col-6 d-md-none no-print">
          <select
            className="form-select form-select-sm border-dark text-center daybook-filter-control"
            value={selectedPanel}
            onChange={(e) => setSelectedPanel(e.target.value)}
            aria-label="Select panel"
            disabled={!availablePanels.length}
          >
            {!availablePanels.length ? (
              <option value="">Select Panel</option>
            ) : (
              <>
                <option value="">All Panels</option>
                {availablePanels.map((panel) => (
                  <option key={panel.title} value={panel.title}>
                    {panel.title} ({panel.count})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      {/* Print meta (desktop layout) */}
      <div className="daybook-print-meta">
        <h3 className="text-brown fw-bold mb-2 text-center">
          <i className="bi bi-journal-text me-2"></i>
          DAILY DAIRY
        </h3>
        <p className="pb-0 mb-1 text-center daybook-print-period">
          <strong className="text-info-emphasis fw-bold">PERIOD:</strong>{' '}
          {formattedStart} To {formattedEnd}
        </p>
        <p className="pb-0 mb-1 text-center daybook-print-firm">
          <strong className="text-info-emphasis fw-bold">FIRM:</strong>{' '}
          {firmDisplayName}
        </p>
        <p className="pb-0 mb-2 text-center">
          <strong className="text-info-emphasis fw-bold">OPENING BALANCE:</strong>{' '}
          {openingDisplay}
        </p>
      </div>

      {/* Desktop legend + opening */}
      <div className="row mt-1 mb-2 align-items-center gy-2 d-none d-md-flex no-print">
        <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-start gap-4">
          <h6 className="fw-semibold text-danger mb-0">
            CR AMOUNT <i className="bi bi-circle-fill ms-1 small"></i>
          </h6>
          <h6 className="fw-semibold text-success mb-0">
            DR AMOUNT <i className="bi bi-circle-fill ms-1 small"></i>
          </h6>
        </div>
        <div className="col-12 col-md-8 d-flex justify-content-center justify-content-md-end align-items-center gap-2">
          <h6 className="fw-semibold text-dark mb-0">
            OPENING BALANCE :
          </h6>
          <h6 className="fw-semibold text-brown mb-0">
            {openingDisplay}
          </h6>
        </div>
      </div>

      <div className="d-md-none no-print daybook-mobile-meta">
        <div className="daybook-opening-chip">
          <span className="daybook-opening-chip__label">Opening Balance</span>
          <span className="daybook-opening-chip__value">{openingDisplay}</span>
        </div>
        <div className="daybook-legend-mobile">
          <span className="text-danger">CR AMOUNT ●</span>
          <span className="text-success">DR AMOUNT ●</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5 no-print">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Screen desktop tables */}
          <div className="daybook-desktop-screen d-none d-md-block no-print">
            {displayedPanels.length > 0 ? (
              displayedPanels.map((panel) => renderPanelTable(panel))
            ) : (
              <div className="text-center text-muted py-4">
                No records found for the selected period.
              </div>
            )}
            <DayBookSummary
              DayBookData={keyedDaybookData}
              opening_data={daybookResponse.summary || {}}
            />
          </div>

          {/* Screen mobile */}
          <div className="daybook-mobile-screen d-md-none no-print">
            <DayBookMobileView
              panels={availablePanels}
              selectedPanel={selectedPanel}
              onSelectPanel={setSelectedPanel}
              keyedDaybookData={keyedDaybookData}
              openingData={daybookResponse.summary || {}}
            />
          </div>

          {/* Print-only desktop layout (all rows, no DataTables paging) */}
          <div className="daybook-print-area">
            {availablePanels.length > 0 ? (
              availablePanels.map((panel) => renderPanelTable(panel, { print: true }))
            ) : (
              <div className="text-center text-muted py-4">
                No records found for the selected period.
              </div>
            )}
            <DayBookSummary
              DayBookData={keyedDaybookData}
              opening_data={daybookResponse.summary || {}}
            />
          </div>
        </>
      )}

      <div className="text-center mt-3 mb-2 daybook-actions-wrap no-print">
        <div className="daybook-actions d-flex justify-content-center align-items-center gap-2">
          <button
            type="button"
            className="btn daybook-action-btn daybook-action-print"
            onClick={handlePrint}
            disabled={loading}
            title="Print"
            aria-label="Print"
          >
            <i className="bi bi-printer-fill"></i>
          </button>
          <button
            type="button"
            className="btn daybook-action-btn daybook-action-pdf"
            onClick={handleDownloadPdf}
            disabled={loading}
            title="Download PDF"
            aria-label="Download PDF"
          >
            <i className="bi bi-file-earmark-pdf-fill"></i>
          </button>
          <button
            type="button"
            className="btn daybook-action-btn daybook-action-whatsapp"
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
  );
};

export default Daybook;
