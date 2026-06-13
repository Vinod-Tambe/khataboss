import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux';
import TrialBalanceReport from './TrialBalanceReport'
import TrialBalancePrintPreview from './TrialBalancePrintPreview'
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import { getFirmsDropdown } from '../../api/firmApi';
import { getTrialBalanceEntries } from '../../api/trialBalanceApi';

const TrialBalance = () => {
  const { selectedFirmId } = useSelector((state) => state.firm);
  const dateRef = useRef(null);
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(selectedFirmId === 'all' ? "" : selectedFirmId);
  const [trialBalanceData, setTrialBalanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
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
    if (!dateRef.current) return;

    $(dateRef.current).daterangepicker(
      {
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
      },
      (start, end) => {
        $(dateRef.current).val(
          `${start.format("DD-MM-YYYY")} - ${end.format("DD-MM-YYYY")}`
        );
        setDateRange({
          startDate: start.format("YYYY-MM-DD"),
          endDate: end.format("YYYY-MM-DD")
        });
      }
    );

    // Set default value in input
    $(dateRef.current).val(
      `${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`
    );

    const dateInput = dateRef.current;
    return () => {
      $(dateInput).data("daterangepicker")?.remove();
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

  return (
    <div className="card p-3 pt-1 shadow-sm">
      <div className="row align-items-center mt-2">
        <div className="col-md-3 d-none d-md-flex mt-2">
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
        <div className="col-md-3 d-md-none mt-2">
          <input
            type="text"
            className="form-control border-dark text-center"
            placeholder="Select Date Range"
            readOnly
          />
        </div>
        <div className="col-md-3 mt-2">
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
          <p className="pb-0 mb-0">
            <strong className="text-info-emphasis fw-bold">PERIOD:</strong>{' '}
            {moment(dateRange.startDate).format("DD-MM-YYYY")} To {moment(dateRange.endDate).format("DD-MM-YYYY")}
          </p>
        </div>
        <div className="col-md-12">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <TrialBalanceReport data={trialBalanceData} />
          )}
        </div>
      </div>
      <div className="text-center mt-3 mb-2">
        <button
          className="btn btn-outline-success"
          onClick={() => setIsPrintPreviewOpen(true)}
          disabled={loading}
        >
          Print <i className="bi bi-printer-fill"></i>
        </button>
      </div>

      <TrialBalancePrintPreview
        show={isPrintPreviewOpen}
        onHide={() => setIsPrintPreviewOpen(false)}
        data={trialBalanceData}
        firmName={firmDisplayName}
        periodStart={dateRange.startDate}
        periodEnd={dateRange.endDate}
      />
    </div>
  )
}

export default TrialBalance
