import React, { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFirmsDropdown } from '../../api/firmApi';
import { getTransferredLoanDailyLedger } from '../../api/stockApi';
import {
  CALENDAR_MONTH_FILTERS,
  getAssessmentYearLabel,
  getCurrentCalendarMonthFilterValue,
  getCurrentFinancialYearKey,
  getFinancialYearOptions,
  resolveLoanStockLedgerPeriod,
} from '../../utils/financialYear';
import LoanStockLedgerReport from './LoanStockLedgerReport';
import TransferredLoanLedgerLogicNote from './TransferredLoanLedgerLogicNote';
import PrintPreviewModal from '../common/PrintPreviewModal';
import '../../css/LoanStockLedger.css';

const TransferredLoanLedger = () => {
  const { selectedFirmId } = useSelector((state) => state.firm);
  const financialYearOptions = useMemo(() => getFinancialYearOptions(), []);

  const [financialYearKey, setFinancialYearKey] = useState(getCurrentFinancialYearKey());
  const [monthFilter, setMonthFilter] = useState(getCurrentCalendarMonthFilterValue);
  const [selectedFirm, setSelectedFirm] = useState(
    selectedFirmId === 'all' ? 'N' : selectedFirmId
  );
  const [firms, setFirms] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

  const period = useMemo(
    () => resolveLoanStockLedgerPeriod(financialYearKey, monthFilter),
    [financialYearKey, monthFilter]
  );
  const { startDate, endDate } = period;

  useEffect(() => {
    setSelectedFirm(selectedFirmId === 'all' ? 'N' : selectedFirmId);
  }, [selectedFirmId]);

  useEffect(() => {
    getFirmsDropdown()
      .then((res) => setFirms(res.data || []))
      .catch(() => toast.error('Failed to load firms'));
  }, []);

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { startDate, endDate };
      if (selectedFirm && selectedFirm !== 'N') {
        params.firmId = selectedFirm;
      }
      const data = await getTransferredLoanDailyLedger(params);
      setRows(data?.rows || []);
    } catch (err) {
      console.error(err);
      setRows([]);
      setError(err?.error || err?.message || 'Failed to load transferred loan ledger');
      toast.error('Failed to load transferred loan ledger');
    } finally {
      setLoading(false);
    }
  }, [selectedFirm, startDate, endDate]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const firmDisplayName =
    selectedFirm === 'N'
      ? 'All Firms'
      : firms.find((f) => String(f.firm_id) === String(selectedFirm))?.firm_name ||
        'Selected Firm';

  const monthLabel =
    CALENDAR_MONTH_FILTERS.find((m) => m.value === monthFilter)?.label ||
    'All months (full year)';

  const periodTitle = `TRANSFERRED LOAN LEDGER - ${moment(startDate).format('DD/MM/YYYY')} TO ${moment(endDate).format('DD/MM/YYYY')}`;

  return (
    <div className="card p-3 pt-2 shadow-sm app-module-panel loan-stock-ledger-page">
      <div className="loan-stock-ledger-toolbar mb-2">
        <h3 className="loan-stock-ledger-toolbar__title text-brown fw-bold mb-0">
          <i className="bi bi-arrow-left-right me-2" aria-hidden="true" />
          Transferred Loan Ledger
        </h3>
        <div className="loan-stock-ledger-toolbar__filters">
          <select
            className="form-select form-select-sm border-dark loan-stock-ledger-toolbar__select loan-stock-ledger-toolbar__select--year"
            value={financialYearKey}
            onChange={(e) => setFinancialYearKey(e.target.value)}
            aria-label="Financial year"
          >
            {financialYearOptions.map((fy) => (
              <option key={fy.key} value={fy.key}>
                {fy.label}
              </option>
            ))}
          </select>
          <select
            className="form-select form-select-sm border-dark loan-stock-ledger-toolbar__select loan-stock-ledger-toolbar__select--month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            aria-label="Month"
          >
            {CALENDAR_MONTH_FILTERS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            className="form-select form-select-sm border-dark loan-stock-ledger-toolbar__select loan-stock-ledger-toolbar__select--firm"
            value={selectedFirm}
            onChange={(e) => setSelectedFirm(e.target.value)}
            aria-label="Firm"
          >
            <option value="N">All Firms</option>
            {firms.map((firm) => (
              <option key={firm.firm_id} value={firm.firm_id}>
                {firm.firm_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-center text-danger fw-bold small mb-2">{periodTitle}</p>

      <div className="text-center loan-stock-ledger-page__meta mb-2">
        <p className="pb-0 mb-0 small">
          <strong className="loan-stock-ledger-page__meta-label">MONTH:</strong> {monthLabel}
          <span className="loan-stock-ledger-page__meta-sep" aria-hidden="true">|</span>
          <strong className="loan-stock-ledger-page__meta-label">FIRM:</strong> {firmDisplayName}
        </p>
        <p className="pb-0 mb-0 small">
          <strong className="loan-stock-ledger-page__meta-label">PERIOD:</strong>{' '}
          {moment(startDate).format('DD-MM-YYYY')} To {moment(endDate).format('DD-MM-YYYY')}
          <span className="loan-stock-ledger-page__meta-sep" aria-hidden="true">|</span>
          <strong className="loan-stock-ledger-page__meta-label">ASSESSMENT YEAR:</strong>{' '}
          {getAssessmentYearLabel(endDate)}
        </p>
      </div>

      <TransferredLoanLedgerLogicNote />

      <LoanStockLedgerReport
        rows={rows}
        loading={loading}
        errorMessage={error}
        inflowColumnTitle="TRANSFERRED GIRVI"
        loadingMessage="Loading transferred loan ledger…"
        emptyMessage="No transferred loan rows for the selected period."
      />

      <div className="loan-stock-ledger-page__footer text-center mt-3 pt-2 border-top">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm px-4"
          onClick={() => setPrintOpen(true)}
          disabled={loading || !rows.length}
        >
          <i className="bi bi-printer me-1" />
          Print
        </button>
      </div>

      <PrintPreviewModal
        show={printOpen}
        onHide={() => setPrintOpen(false)}
        title="Transferred Loan Ledger — Print Preview"
        printAreaId="transferred-loan-ledger-print"
      >
        <div id="transferred-loan-ledger-print">
          <p className="small text-center text-danger fw-bold mb-1">{periodTitle}</p>
          <p className="small text-center mb-2">
            Month: {monthLabel} · Firm: {firmDisplayName} · Period:{' '}
            {moment(startDate).format('DD-MM-YYYY')} To {moment(endDate).format('DD-MM-YYYY')} ·
            Assessment year: {getAssessmentYearLabel(endDate)}
          </p>
          <LoanStockLedgerReport
            rows={rows}
            isPrint
            inflowColumnTitle="TRANSFERRED GIRVI"
          />
        </div>
      </PrintPreviewModal>
    </div>
  );
};

export default TransferredLoanLedger;
