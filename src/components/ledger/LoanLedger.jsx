import React, { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFirmsDropdown } from '../../api/firmApi';
import { getGirvis, getGirviById } from '../../api/girviApi';
import { getDefaultFinancialYearStrings, getAssessmentYearLabel } from '../../utils/financialYear';
import { getLoanItems } from '../../utils/loanItems';
import LedgerPageHeader from './LedgerPageHeader';
import LoanLedgerReport from './LoanLedgerReport';
import LoanLedgerStatementModal from './LoanLedgerStatementModal';
import PrintPreviewModal from '../common/PrintPreviewModal';
import useOpenLoanDetails from '../../hooks/useOpenLoanDetails';

const normalizeLoanDetails = (response) => {
  const details = response?.data ?? response ?? {};
  const items = getLoanItems(details);
  return {
    ...details,
    items: items.length ? items : getLoanItems(response),
    additionalPrincipals:
      details.additionalPrincipals ?? details.additional_principals ?? [],
    deposits: details.deposits ?? [],
    releases: details.releases ?? [],
  };
};

const LoanLedger = () => {
  const openLoanDetails = useOpenLoanDetails();
  const { selectedFirmId } = useSelector((state) => state.firm);
  const defaultRange = getDefaultFinancialYearStrings();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [selectedFirm, setSelectedFirm] = useState(
    selectedFirmId === 'all' ? 'N' : selectedFirmId
  );
  const [firms, setFirms] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [girvType, setGirvType] = useState('ALL');
  const [dateScope, setDateScope] = useState('open_in_period');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registerPrintOpen, setRegisterPrintOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [statementOpen, setStatementOpen] = useState(false);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementLoan, setStatementLoan] = useState(null);

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

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        status,
        girvType,
        startDate,
        endDate,
        dateScope,
      };
      if (selectedFirm && selectedFirm !== 'N') {
        params.firmId = selectedFirm;
      }
      const response = await getGirvis(params);
      const data = Array.isArray(response) ? response : response.data || [];
      setRows(data);
      setSelectedLoan((prev) => {
        if (!prev) return null;
        return data.find((r) => r.girv_id === prev.girv_id) || null;
      });
    } catch (err) {
      console.error(err);
      setRows([]);
      setError(err?.error || err?.message || 'Failed to load loan ledger');
      toast.error('Failed to load loan ledger');
    } finally {
      setLoading(false);
    }
  }, [selectedFirm, status, girvType, startDate, endDate, dateScope]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((loan) => {
      const ref = (
        loan.girv_unique_code ||
        loan.girv_loan_no ||
        String(loan.girv_id || '')
      ).toLowerCase();
      const name = `${loan.user?.user_first_name || ''} ${loan.user?.user_last_name || ''}`.toLowerCase();
      const mobile = String(loan.user?.user_mobile_no || '');
      return ref.includes(q) || name.includes(q) || mobile.includes(q);
    });
  }, [rows, search]);

  const firmDisplayName =
    selectedFirm === 'N'
      ? 'All Firms'
      : firms.find((f) => String(f.firm_id) === String(selectedFirm))?.firm_name ||
        'Selected Firm';

  const openStatementForLoan = async (loan) => {
    const id = loan?.girv_id;
    if (!id) {
      toast.error('Loan not found');
      return;
    }
    setSelectedLoan(loan);
    setStatementOpen(true);
    setStatementLoading(true);
    setStatementLoan(null);
    try {
      const response = await getGirviById(id);
      setStatementLoan(normalizeLoanDetails(response));
    } catch (err) {
      console.error(err);
      toast.error(err?.error || 'Failed to load loan ledger statement');
      setStatementOpen(false);
    } finally {
      setStatementLoading(false);
    }
  };

  const handleViewLedgerFromBottom = () => {
    if (!selectedLoan) {
      toast.info('Select a loan from the list first');
      return;
    }
    openStatementForLoan(selectedLoan);
  };

  const customerForStatement = statementLoan?.user || selectedLoan?.user || null;

  const selectedLoanRef =
    selectedLoan?.girv_unique_code ||
    selectedLoan?.girv_loan_no ||
    (selectedLoan?.girv_id ? `LN-${selectedLoan.girv_id}` : null);

  return (
    <div className="card p-3 pt-1 shadow-sm app-module-panel">
      <LedgerPageHeader
        title="Loan Ledger"
        iconClass="bi-journal-text"
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
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="RELEASED">Released</option>
                <option value="CLOSED">Closed</option>
                <option value="AUCTION">Auction</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </div>
            <div className="col-md-2 col-6">
              <select
                className="form-select border-dark"
                value={girvType}
                onChange={(e) => setGirvType(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="secured">Secured</option>
                <option value="unsecured">Unsecured</option>
              </select>
            </div>
            <div className="col-md-3 col-12">
              <select
                className="form-select border-dark"
                value={dateScope}
                onChange={(e) => setDateScope(e.target.value)}
              >
                <option value="open_in_period">Open in period + new loans</option>
                <option value="started_in_period">Only loans started in period</option>
                <option value="all">Ignore date (all loans)</option>
              </select>
            </div>
            <div className="col-md-3 col-12">
              <input
                type="search"
                className="form-control border-dark"
                placeholder="Search loan no, customer, mobile…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="col-12 text-center mt-2">
          <p className="pb-0 mb-0">
            <strong className="text-info-emphasis fw-bold">PERIOD:</strong>{' '}
            {moment(startDate).format('DD-MM-YYYY')} To {moment(endDate).format('DD-MM-YYYY')}
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
        <p className="small text-muted mb-2">
          Click a row to select a loan, then use <strong>View Ledger</strong> below (or the row
          button).
        </p>
        <LoanLedgerReport
          rows={filteredRows}
          loading={loading}
          errorMessage={error}
          selectedLoanId={selectedLoan?.girv_id}
          onSelectLoan={setSelectedLoan}
          onViewStatement={openStatementForLoan}
          onOpenLoanDetails={openLoanDetails}
        />
      </div>

      <div className="text-center mt-3 mb-2 d-flex flex-wrap justify-content-center gap-2 align-items-center">
        {selectedLoanRef && (
          <span className="small text-muted me-2">
            Selected: <strong>{selectedLoanRef}</strong>
          </span>
        )}
        <button
          type="button"
          className="btn btn-primary px-4"
          onClick={handleViewLedgerFromBottom}
          disabled={loading || !selectedLoan}
        >
          <i className="bi bi-journal-text me-2" />
          View Ledger
        </button>
        <button
          type="button"
          className="btn btn-outline-success px-4"
          onClick={() => setRegisterPrintOpen(true)}
          disabled={loading || filteredRows.length === 0}
        >
          Print Register <i className="bi bi-printer-fill" />
        </button>
      </div>

      <PrintPreviewModal
        show={registerPrintOpen}
        onHide={() => setRegisterPrintOpen(false)}
        title="Loan Ledger — Print Preview"
        printAreaId="loan-ledger-register-print"
      >
        <div className="text-center mb-3">
          <h4 className="fw-bold mb-1">Loan Ledger Register</h4>
          <p className="mb-0">{firmDisplayName}</p>
          <p className="mb-0 small text-muted">
            {moment(startDate).format('DD-MM-YYYY')} — {moment(endDate).format('DD-MM-YYYY')}
          </p>
        </div>
        <LoanLedgerReport rows={filteredRows} isPrint />
      </PrintPreviewModal>

      <LoanLedgerStatementModal
        show={statementOpen}
        onHide={() => {
          setStatementOpen(false);
          setStatementLoan(null);
        }}
        loading={statementLoading}
        loanDetails={statementLoan}
        customer={customerForStatement}
        periodStart={startDate}
        periodEnd={endDate}
        firmName={firmDisplayName}
        onOpenLoanDetails={(loan, user) => {
          setStatementOpen(false);
          openLoanDetails(loan, user);
        }}
      />
    </div>
  );
};

export default LoanLedger;
