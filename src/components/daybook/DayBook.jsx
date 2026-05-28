import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import DayBookTable from "./DayBookTable";
import DayBookSummary from "./DayBookSummary";
import { getDaybookEntries } from "../../api/daybookApi";
import { getFirmsDropdown } from "../../api/firmApi";
import { showToast } from "../../components/common/ToastAlert";

const Daybook = () => {
  const dateRef = useRef(null);
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState("");
  
  // Calculate FY dates for initialization
  const { fyStart, fyEnd } = useMemo(() => {
    const currentYear = moment().year();
    const isAfterMarch = moment().month() >= 3;
    const start = isAfterMarch
      ? moment(`${currentYear}-04-01`)
      : moment(`${currentYear - 1}-04-01`)
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

  // Fetch Firms for dropdown
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

  // Fetch Daybook Data
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
          startDate: start.format('YYYY-MM-DD'),
          endDate: end.format('YYYY-MM-DD')
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

  // Helper to find data by title
  const getSectionData = (title) => {
    return (daybookResponse.daybook_data || []).find(d => d.title === title) || { data: [] };
  };

  // Convert array to keyed object for Summary component
  const keyedDaybookData = (daybookResponse.daybook_data || []).reduce((acc, item) => {
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

  return (
    <div className="card p-3 pt-1 shadow-sm mb-4">
      <div className="row align-items-center mt-2">
        <div className="col-md-3 mt-2">
          <h3 className="text-brown fw-bold mb-0 responsive-text">
            <i className="bi bi-journal-text me-2 responsive-text"></i>
            DAILY DAIRY
          </h3>
        </div>

        <div className="col-md-3 mt-2">
          <input
            type="text"
            ref={dateRef}
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
              <option key={firm.firm_id} value={firm.firm_id}>{firm.firm_name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-3 mt-2">
          <select className="form-select border-dark text-center" defaultValue="Select Panel">
            <option disabled value="Select Panel">Select Panel</option>
            <option value="CR">Add New Finance</option>
            <option value="DR">Release Finance</option>
          </select>
        </div>
      </div>
      <div className="row mt-1 mb-2 align-items-center gy-2">
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
            {daybookResponse.summary?.total_open_amt || "0.00"}
          </h6>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <DayBookTable 
            title="FINANCE ADDED"
            colorClass="bg-green"
            amtColor="text-danger"
            data={getSectionData("FINANCE ADDED").data}
          />
          <DayBookTable 
            title="FINANCE EMI DEPOSIT"
            colorClass="bg-red"
            amtColor="text-success"
            data={getSectionData("FINANCE EMI DEPOSIT").data}
          />
          <DayBookTable 
            title="FINANCE EMI ROLLBACK"
            colorClass="bg-cust-info"
            amtColor="text-danger"
            data={getSectionData("FINANCE EMI ROLLBACK").data}
          />
          
          <DayBookSummary
            DayBookData={keyedDaybookData}
            opening_data={daybookResponse.summary || {}}
          />
        </>
      )}

      <div className="text-center mt-3 mb-2">
        <button className="btn btn-outline-success">
          Print <i className="bi bi-printer-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default Daybook;
