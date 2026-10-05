import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import { getFinancialYearMoments } from '../../utils/financialYear';

const LedgerPageHeader = ({
  title,
  iconClass = 'bi-journal-text',
  startDate,
  endDate,
  onDateRangeChange,
  selectedFirm,
  onFirmChange,
  firms = [],
  children,
  showDateRange = true,
}) => {
  const dateRef = useRef(null);

  useEffect(() => {
    if (!showDateRange || !dateRef.current) return;

    const { fyStart, fyEnd } = getFinancialYearMoments();

    $(dateRef.current).daterangepicker(
      {
        startDate: moment(startDate),
        endDate: moment(endDate),
        autoUpdateInput: false,
        locale: { format: 'DD-MM-YYYY', cancelLabel: 'Clear' },
        ranges: {
          Today: [moment(), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [
            moment().subtract(1, 'month').startOf('month'),
            moment().subtract(1, 'month').endOf('month'),
          ],
          'Current Financial Year': [fyStart, fyEnd],
          'Last Financial Year': [
            moment(fyStart).subtract(1, 'year'),
            moment(fyEnd).subtract(1, 'year'),
          ],
        },
      },
      (start, end) => {
        $(dateRef.current).val(
          `${start.format('DD-MM-YYYY')} - ${end.format('DD-MM-YYYY')}`
        );
        onDateRangeChange(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
      }
    );

    $(dateRef.current).val(
      `${moment(startDate).format('DD-MM-YYYY')} - ${moment(endDate).format('DD-MM-YYYY')}`
    );

    const dateInput = dateRef.current;
    return () => {
      $(dateInput).data('daterangepicker')?.remove();
    };
  }, [startDate, endDate, onDateRangeChange, showDateRange]);

  return (
    <div className="row align-items-center mt-2">
      {showDateRange ? (
        <div className="col-md-3 col-12 mt-2">
          <input
            type="text"
            className="form-control border-dark text-center"
            placeholder="Select Date Range"
            ref={dateRef}
            readOnly
          />
        </div>
      ) : null}
      <div
        className={`${showDateRange ? 'col-md-6' : 'col-md-9'} col-12 mt-2 text-center`}
      >
        <h3 className="text-brown fw-bold mb-0 responsive-text">
          <i className={`bi ${iconClass} me-2 responsive-text`}></i>
          {title}
        </h3>
      </div>
      <div className="col-md-3 mt-2">
        <select
          className="form-select border-dark text-center"
          value={selectedFirm}
          onChange={(e) => onFirmChange(e.target.value)}
        >
          <option value="N">All Firms</option>
          {firms.map((firm) => (
            <option key={firm.firm_id} value={firm.firm_id}>
              {firm.firm_name}
            </option>
          ))}
        </select>
      </div>
      {children}
    </div>
  );
};

export default LedgerPageHeader;
