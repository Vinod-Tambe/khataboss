import React, { useEffect, useRef } from "react";
import $ from "jquery";
import moment from "moment";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import DayBookTable from "./DayBookTable";
import DayBookSummary from "./DayBookSummary";

const Daybook = () => {
  const dateRef = useRef(null);

  const dayBookData = {
    "FINANCE EMI DEPOSIT": {
      total_cash_amt: 1000,
      total_bank_amt: 2000,
      total_online_amt: 500,
      total_card_amt: 300,
      total_disc_amt: 0,
      total_amt: 3800
    },
    "FINANCE ADDED": {
      total_cash_amt: 200,
      total_bank_amt: 100,
      total_online_amt: 0,
      total_card_amt: 0,
      total_disc_amt: 0,
      total_amt: 300
    },
    "FINANCE EMI ROLLBACK": {
      total_cash_amt: 50,
      total_bank_amt: 0,
      total_online_amt: 0,
      total_card_amt: 0,
      total_disc_amt: 0,
      total_amt: 50
    }
  };

  const openingData = {
    total_cash_amt: 5000,
    total_bank_amt: 3000,
    total_online_amt: 1000,
    total_card_amt: 500
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


      }
    );

    // Set default value
    $(dateRef.current).val(
      `${fyStart.format("DD-MM-YYYY")} - ${fyEnd.format("DD-MM-YYYY")}`
    );



    const dateInput = dateRef.current;
    return () => {
      $(dateInput).data("daterangepicker")?.remove();
    };
  }, []);

  return (
    <div className="card p-3 pt-1 shadow-sm">
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
          <select className="form-select border-dark text-center">
            <option disabled>Select Firm</option>
            <option value="CR">Ram</option>
            <option value="DR">Sham</option>
          </select>
        </div>

        <div className="col-md-3 mt-2">
          <select className="form-select border-dark text-center">
            <option disabled>Select Panel</option>
            <option value="CR">Add New Finance</option>
            <option value="DR">Release Finance</option>
          </select>
        </div>
      </div>
      <div class="row mt-1 mb-2 align-items-center gy-2">
        <div class="col-12 col-md-4 d-flex justify-content-center justify-content-md-start gap-4">
          <h6 class="fw-semibold text-danger mb-0">
            CR AMOUNT <i class="bi bi-circle-fill ms-1 small"></i>
          </h6>
          <h6 class="fw-semibold text-success mb-0">
            DR AMOUNT <i class="bi bi-circle-fill ms-1 small"></i>
          </h6>
        </div>
        <div class="col-12 col-md-8 d-flex justify-content-center justify-content-md-end align-items-center gap-2">
          <h6 class="fw-semibold text-dark mb-0">
            OPENING BALANCE :
          </h6>
          <h6 class="fw-semibold text-brown mb-0">
            0.00
          </h6>
        </div>

      </div>

      <DayBookTable />
      <DayBookTable />
      <DayBookTable />
      <DayBookSummary
        DayBookData={dayBookData}
        opening_data={openingData}
      />
           <div class="text-center mt-3 mb-2">
                        <button class="btn btn-outline-success">
                            Print <i class="bi bi-printer-fill"></i>
                        </button>
                    </div>
    </div>
  );
};

export default Daybook;
