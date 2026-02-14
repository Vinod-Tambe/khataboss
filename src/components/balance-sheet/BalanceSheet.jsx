import React,{useState,useRef,useEffect} from 'react'
import BalanceSheetReport from './BalanceSheetReport'
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";

const BalanceSheet = () => {
  const dateRef = useRef(null);
    const [dateRange, setDateRange] = useState({
      startDate: "",
      endDate: "",
    });
    const dummyBalanceSheetData = {
  assets: [
    { "Cash in Hand": 45000 },
    { "Cash at Bank": 185000 },
    { "Debtors": 92000 },
    { "Secured Loan": 348000 },
    { "Unsecured Loan": 120000 },
    { "Stock Account": 450000 },
    { "Building": 1200000 },
    { "Land": 800000 },
  ],
  liabilities: [
    { "Capital Account": 1800000 },
    { "Bank Loan": 650000 },
    { "Creditors": 145000 },
    { "Bills Payable": 60000 },
    { "Expenses": 35000 },
    { "Net Profit": 125000 },     // ← you can include or remove this
  ],
};
     useEffect(() => {
    if (!dateRef.current) return;
  
    const currentYear = moment().year();
    const isAfterMarch = moment().month() >= 3;

    const fyStart = isAfterMarch
      ? moment(`${currentYear}-04-01`)
      : moment(`${currentYear - 1}-04-01`);

    const fyEnd = isAfterMarch
      ? moment(`${currentYear + 1}-03-31`)
      : moment(`${currentYear}-03-31`);

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
          endDate: end.format("YYYY-MM-DD"),
        });
      }
    );

    // Set default value
    $(dateRef.current).val(
      `${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`
    );

    setDateRange({
      startDate: fyStart.format("YYYY-MM-DD"),
      endDate: fyEnd.format("YYYY-MM-DD"),
    });

    return () => {
      $(dateRef.current).data("daterangepicker")?.remove();
    };
  }, []);
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
            <i className="bi bi-clipboard-data me-2 responsive-text"></i>
            Balance Sheet
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
          <select className="form-select border-dark text-center">
            <option disabled>Select Firm</option>
            <option value="CR">Ram</option>
            <option value="DR">Sham</option>
          </select>
        </div>
        <div className="col-12 text-center">
             <p className="pb-0 mb-0">
            <strong className="text-info-emphasis fw-bold">FINANCIAL YEAR:</strong>{' '}
            12-12-2025 To 23-04-2025
          </p>
           <p className="pb-0 mb-0">
            <strong className="text-success-emphasis fw-bold">ASSESSMENT YEAR:</strong>{' '}
            2025 - 2026
          </p>
          <p>
            <strong className="text-primary-emphasis fw-bold">
              TAHLKA FINANCE & COMPANY, MAHESH SHARMA WARD NO 18, RAJGARH CHURU
            </strong>
          </p>
        </div>
        <div className="col-md-12">
          <BalanceSheetReport balanceSheetData={dummyBalanceSheetData}/>
        </div>
      </div>
          <div class="text-center mt-3 mb-2">
                        <button class="btn btn-outline-success">
                            Print <i class="bi bi-printer-fill"></i>
                        </button>
                    </div>
    </div>
  )
}

export default BalanceSheet
