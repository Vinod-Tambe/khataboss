import React, { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFirmsDropdown } from '../../api/firmApi';
import { getStockLedger } from '../../api/stockApi';
import { getDefaultFinancialYearStrings, getAssessmentYearLabel } from '../../utils/financialYear';
import LedgerPageHeader from './LedgerPageHeader';
import LoanItemLedgerReport from './LoanItemLedgerReport';
import PrintPreviewModal from '../common/PrintPreviewModal';
import useOpenLoanDetails from '../../hooks/useOpenLoanDetails';

const LoanItemLedger = () => {
  const openLoanDetails = useOpenLoanDetails();
  const { selectedFirmId } = useSelector((state) => state.firm);
  const defaultRange = getDefaultFinancialYearStrings();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [selectedFirm, setSelectedFirm] = useState(
    selectedFirmId === 'all' ? 'N' : selectedFirmId
  );
  const [firms, setFirms] = useState([]);
  const [metalType, setMetalType] = useState('ALL');
  const [loanStatus, setLoanStatus] = useState('ACTIVE');
  const [itemStatus, setItemStatus] = useState('ALL');
  const [useDateFilter, setUseDateFilter] = useState(false);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    setSelectedFirm(selectedFirmId === 'all' ? 'N' : selectedFirmId);
  }, [selectedFirmId]);

  useEffect(() => {
    const loadFirms = async () => {
      try {
        const response = await getFirmsDropdown();
        setFirms(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadFirms();
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        metalType,
        loanStatus,
        itemStatus,
      };
      if (selectedFirm && selectedFirm !== 'N') {
        params.firmId = selectedFirm;
      }
      if (useDateFilter) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const response = await getStockLedger(params);
      const data = Array.isArray(response) ? response : response.data || [];
      setRows(data);
    } catch (err) {
      console.error(err);
      setRows([]);
      setError(err?.error || err?.message || 'Failed to load loan item ledger');
      toast.error('Failed to load loan item ledger');
    } finally {
      setLoading(false);
    }
  }, [
    selectedFirm,
    metalType,
    loanStatus,
    itemStatus,
    useDateFilter,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const item = String(row.st_item_name || '').toLowerCase();
      const loan = row.loan;
      const ref = (
        loan?.girv_unique_code ||
        loan?.girv_loan_no ||
        String(loan?.girv_id || '')
      ).toLowerCase();
      const name = `${row.user?.user_first_name || ''} ${row.user?.user_last_name || ''}`.toLowerCase();
      return item.includes(q) || ref.includes(q) || name.includes(q);
    });
  }, [rows, search]);

  const firmDisplayName =
    selectedFirm === 'N'
      ? 'All Firms'
      : firms.find((f) => String(f.firm_id) === String(selectedFirm))?.firm_name ||
        'Selected Firm';

  return (
    <div className="card p-3 pt-1 shadow-sm app-module-panel">
      <LedgerPageHeader
        title="Loan Item Ledger"
        iconClass="bi-box-seam"
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
        selectedFirm={selectedFirm}
        onFirmChange={setSelectedFirm}
        firms={firms}
      >
        <div className="col-12 mt-2">
          <div className="row g-2 justify-content-center">
            <div className="col-md-2 col-6">
              <select
                className="form-select border-dark"
                value={loanStatus}
                onChange={(e) => setLoanStatus(e.target.value)}
              >
                <option value="ALL">All Loan Status</option>
                <option value="ACTIVE">Active</option>
                <option value="RELEASED">Released</option>
                <option value="AUCTION">Auction</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="col-md-2 col-6">
              <select
                className="form-select border-dark"
                value={metalType}
                onChange={(e) => setMetalType(e.target.value)}
              >
                <option value="ALL">All Metals</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
              </select>
            </div>
            <div className="col-md-2 col-6">
              <select
                className="form-select border-dark"
                value={itemStatus}
                onChange={(e) => setItemStatus(e.target.value)}
              >
                <option value="ALL">All Item Status</option>
                <option value="active">Active</option>
                <option value="released">Released</option>
              </select>
            </div>
            <div className="col-md-3 col-12">
              <input
                type="search"
                className="form-control border-dark"
                placeholder="Search item, loan no, customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3 col-12 d-flex align-items-center justify-content-center">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="item-ledger-date-filter"
                  checked={useDateFilter}
                  onChange={(e) => setUseDateFilter(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="item-ledger-date-filter">
                  Filter by pledge date
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 text-center mt-2">
          <p className="pb-0 mb-0">
            <strong className="text-info-emphasis fw-bold">PERIOD:</strong>{' '}
            {useDateFilter
              ? `${moment(startDate).format('DD-MM-YYYY')} To ${moment(endDate).format('DD-MM-YYYY')}`
              : 'All dates (pledge date filter off)'}
          </p>
          <p className="pb-0 mb-0">
            <strong className="text-success-emphasis fw-bold">ASSESSMENT YEAR:</strong>{' '}
            {getAssessmentYearLabel(endDate)}
          </p>
          <p className="mb-0">
            <strong className="text-primary-emphasis fw-bold">FIRM:</strong> {firmDisplayName}
          </p>
        </div>
      </LedgerPageHeader>

      <div className="col-md-12">
        <LoanItemLedgerReport
          rows={filteredRows}
          loading={loading}
          errorMessage={error}
          onOpenLoanDetails={openLoanDetails}
        />
      </div>

      <div className="text-center mt-3 mb-2">
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={() => setPrintOpen(true)}
          disabled={loading || filteredRows.length === 0}
        >
          Print <i className="bi bi-printer-fill" />
        </button>
      </div>

      <PrintPreviewModal
        show={printOpen}
        onHide={() => setPrintOpen(false)}
        title="Loan Item Ledger — Print Preview"
        printAreaId="loan-item-ledger-print"
      >
        <div className="text-center mb-3">
          <h4 className="fw-bold mb-1">Loan Item / Stock Ledger</h4>
          <p className="mb-0">{firmDisplayName}</p>
          {useDateFilter && (
            <p className="mb-0 small text-muted">
              {moment(startDate).format('DD-MM-YYYY')} — {moment(endDate).format('DD-MM-YYYY')}
            </p>
          )}
        </div>
        <LoanItemLedgerReport rows={filteredRows} isPrint />
      </PrintPreviewModal>
    </div>
  );
};

export default LoanItemLedger;
