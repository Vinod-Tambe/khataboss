import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiArrowRight, FiPlus, FiTrash2 } from 'react-icons/fi';
import { getFirmsDropdown } from '../../api/firmApi';
import { getAccountsDropdown } from '../../api/accountApi';
import { createMoneyTransaction } from '../../api/moneyTransactionApi';
import useFormNavigation from '../../hooks/useFormNavigation';

const emptyLineRow = () => ({ acc_id: '', amt: '', remarks: '' });

const roundMoney = (value) => Math.round((parseFloat(value) || 0) * 100) / 100;

const isLineRowEmpty = (row) =>
  !String(row.acc_id || '').trim() && !String(row.amt || '').trim();

const isLineRowComplete = (row) => {
  const accId = parseInt(row.acc_id, 10);
  const amt = parseFloat(row.amt);
  return accId > 0 && Number.isFinite(amt) && amt > 0;
};

const formatInr = (value) =>
  parseFloat(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TRANSFER_DIRECTION = {
  CR_TO_DR: 'CR_TO_DR',
  DR_TO_CR: 'DR_TO_CR',
};

const MAX_VOUCHER_NARRATION_LENGTH = 200;

const accountBalanceType = (acc) =>
  String(acc?.acc_balance_type || 'DR').toUpperCase() === 'CR' ? 'CR' : 'DR';

const formatAccountDisplayName = (acc) => {
  if (!acc) return '-';
  const main = String(acc.acc_name || '').trim();
  const primary = String(acc.acc_pre_acc || '').trim();
  if (!main && !primary) return '-';
  if (!main) return primary;
  if (!primary) return main;
  return `${main} (${primary})`;
};

const getLineRowValidationMessage = (row, index, allRows, oppositeAccIds, entryLabel) => {
  if (!isLineRowComplete(row)) {
    if (!row.acc_id) return `Select a ${entryLabel} account.`;
    return 'Enter a valid amount greater than zero.';
  }
  const accId = parseInt(row.acc_id, 10);
  if (oppositeAccIds.has(accId)) {
    return 'This account is already used in the other section.';
  }
  const duplicate = allRows.some(
    (other, i) => i !== index && parseInt(other.acc_id, 10) === accId && accId > 0
  );
  if (duplicate) return 'This account is already used on another row in this section.';
  return null;
};

const getSectionValidationError = (rows, entryLabel, oppositeAccIds, accounts, sectionTitle) => {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (isLineRowEmpty(row)) {
      return `${sectionTitle} row ${i + 1} is empty. Fill it or remove it.`;
    }
    if (!isLineRowComplete(row)) {
      return `${sectionTitle} row ${i + 1}: enter both account and amount.`;
    }
    const acc = accounts.find((a) => String(a.acc_id) === String(row.acc_id));
    if (acc && accountBalanceType(acc) !== entryLabel) {
      return `${sectionTitle} row ${i + 1}: must be a ${entryLabel} account.`;
    }
    const rowMsg = getLineRowValidationMessage(
      row,
      i,
      rows,
      oppositeAccIds,
      entryLabel
    );
    if (rowMsg) {
      return `${sectionTitle} row ${i + 1}: ${rowMsg}`;
    }
  }
  return null;
};

const InterAccountTransferForm = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const dateRef = useRef(null);
  useFormNavigation(formRef);

  const { selectedFirmId, firms: reduxFirms } = useSelector((state) => state.firm);

  const [firms, setFirms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    mtf_firm_id: '',
    mtf_trans_date: moment().format('YYYY-MM-DD'),
    mtf_direction: TRANSFER_DIRECTION.CR_TO_DR,
    mtf_from_acc_id: '',
    mtf_narration: '',
    to_rows: [emptyLineRow()],
  });

  const isCrToDr = form.mtf_direction === TRANSFER_DIRECTION.CR_TO_DR;
  const fromEntryLabel = isCrToDr ? 'CR' : 'DR';
  const toEntryLabel = isCrToDr ? 'DR' : 'CR';
  const topPanelClass = isCrToDr ? 'bg-red' : 'bg-green';
  const bottomPanelClass = isCrToDr ? 'bg-green' : 'bg-red';

  const fromAccounts = useMemo(
    () => accounts.filter((acc) => accountBalanceType(acc) === fromEntryLabel),
    [accounts, fromEntryLabel]
  );

  const toAccounts = useMemo(
    () => accounts.filter((acc) => accountBalanceType(acc) === toEntryLabel),
    [accounts, toEntryLabel]
  );

  const setTransferDirection = (direction) => {
    setForm((prev) => ({
      ...prev,
      mtf_direction: direction,
      mtf_from_acc_id: '',
      to_rows: [emptyLineRow()],
    }));
  };

  useEffect(() => {
    getFirmsDropdown()
      .then((res) => setFirms(res.data || []))
      .catch(() => toast.error('Failed to load firms'));
  }, []);

  useEffect(() => {
    if (selectedFirmId === 'all') {
      if (reduxFirms.length > 0) {
        setForm((prev) => ({ ...prev, mtf_firm_id: reduxFirms[0].firm_id }));
      }
    } else {
      setForm((prev) => ({ ...prev, mtf_firm_id: selectedFirmId }));
    }
  }, [selectedFirmId, reduxFirms]);

  useEffect(() => {
    if (!form.mtf_firm_id) return;
    getAccountsDropdown(form.mtf_firm_id)
      .then((res) => setAccounts(res.data || []))
      .catch(() => setAccounts([]));
  }, [form.mtf_firm_id]);

  useEffect(() => {
    const dateEl = dateRef.current;
    if (!dateEl) return undefined;
    $(dateEl).daterangepicker(
      {
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: { format: 'DD-MM-YYYY' },
      },
      (start) => {
        setForm((prev) => ({ ...prev, mtf_trans_date: start.format('YYYY-MM-DD') }));
      }
    );
    return () => {
      $(dateEl).data('daterangepicker')?.remove();
    };
  }, []);

  const totalToAmount = useMemo(
    () => roundMoney(form.to_rows.reduce((sum, row) => sum + (parseFloat(row.amt) || 0), 0)),
    [form.to_rows]
  );

  const totalFromAmount = totalToAmount;

  const oppositeToAccIds = useMemo(() => {
    const fromId = parseInt(form.mtf_from_acc_id, 10);
    return fromId > 0 ? new Set([fromId]) : new Set();
  }, [form.mtf_from_acc_id]);

  const getFromAccountValidationError = useCallback(() => {
    if (!form.mtf_from_acc_id) {
      return `Select one ${fromEntryLabel} account on top.`;
    }
    const acc = accounts.find((a) => String(a.acc_id) === String(form.mtf_from_acc_id));
    if (acc && accountBalanceType(acc) !== fromEntryLabel) {
      return `Top account must be a ${fromEntryLabel} balance type account.`;
    }
    const toIds = form.to_rows.map((r) => parseInt(r.acc_id, 10)).filter((id) => id > 0);
    if (toIds.includes(parseInt(form.mtf_from_acc_id, 10))) {
      return 'Top account cannot be the same as a split account below.';
    }
    return null;
  }, [form.mtf_from_acc_id, form.to_rows, fromEntryLabel, accounts]);

  const updateToRow = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      to_rows: prev.to_rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  };

  const tryAddToRow = (index) => {
    if (!form.mtf_from_acc_id) {
      toast.error(`Select one ${fromEntryLabel} account on top first.`);
      return;
    }
    const row = form.to_rows[index];
    const message = getLineRowValidationMessage(
      row,
      index,
      form.to_rows,
      oppositeToAccIds,
      toEntryLabel
    );
    if (message) {
      toast.error(`${toEntryLabel} row ${index + 1}: ${message}`);
      return;
    }
    setForm((prev) => ({ ...prev, to_rows: [...prev.to_rows, emptyLineRow()] }));
  };

  const removeToRow = (index) => {
    setForm((prev) => {
      if (prev.to_rows.length <= 1) {
        toast.error(`At least one ${toEntryLabel} row is required.`);
        return prev;
      }
      return { ...prev, to_rows: prev.to_rows.filter((_, i) => i !== index) };
    });
  };

  const formValidationError = useMemo(() => {
    if (!form.mtf_firm_id) return 'Select a firm.';
    if (!form.mtf_trans_date) return 'Transfer date is required.';
    const fromErr = getFromAccountValidationError();
    if (fromErr) return fromErr;
    const toErr = getSectionValidationError(
      form.to_rows,
      toEntryLabel,
      oppositeToAccIds,
      accounts,
      toEntryLabel
    );
    if (toErr) return toErr;
    if (!(totalToAmount > 0)) {
      return 'Enter split amounts below (total must be greater than zero).';
    }
    const narration = (form.mtf_narration || '').trim();
    if (!narration) {
      return 'Voucher narration is required.';
    }
    if (narration.length > MAX_VOUCHER_NARRATION_LENGTH) {
      return `Voucher narration must be at most ${MAX_VOUCHER_NARRATION_LENGTH} characters.`;
    }
    return null;
  }, [
    form.mtf_firm_id,
    form.mtf_trans_date,
    form.mtf_narration,
    form.to_rows,
    toEntryLabel,
    oppositeToAccIds,
    accounts,
    totalToAmount,
    getFromAccountValidationError,
  ]);

  const isFormValid = formValidationError === null;

  const validate = useCallback(() => {
    if (formValidationError) {
      toast.error(formValidationError);
      return false;
    }
    return true;
  }, [formValidationError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fromAccId = parseInt(form.mtf_from_acc_id, 10);
    const from_rows = [
      {
        mfl_acc_id: fromAccId,
        mfl_amt: totalToAmount,
        mfl_remarks: '',
      },
    ];

    const to_rows = form.to_rows.map((row) => ({
      mtt_to_acc_id: parseInt(row.acc_id, 10),
      mtt_amt: parseFloat(row.amt),
      mtt_remarks: row.remarks?.trim() || '',
    }));

    setLoading(true);
    try {
      await createMoneyTransaction({
        mtf_firm_id: form.mtf_firm_id,
        mtf_trans_date: form.mtf_trans_date,
        mtf_direction: form.mtf_direction,
        mtf_narration: form.mtf_narration.trim(),
        from_rows,
        to_rows,
      });
      toast.success('Transfer saved (journal updated).');
      navigate('/account/transfer/list');
    } catch (error) {
      toast.error(error.message || 'Failed to save transfer');
    } finally {
      setLoading(false);
    }
  };

  const renderAccountOptions = (list, balanceType, placeholder) => {
    if (list.length === 0) {
      return (
        <>
          <option value="">{placeholder}</option>
          <option value="" disabled>{`No ${balanceType} accounts for this firm`}</option>
        </>
      );
    }
    return (
      <>
        <option value="">{placeholder}</option>
        {list.map((acc) => (
          <option key={acc.acc_id} value={acc.acc_id}>
            {formatAccountDisplayName(acc)} — {accountBalanceType(acc)}
          </option>
        ))}
      </>
    );
  };

  const renderSplitSection = () => (
    <div className={`row g-3 ${bottomPanelClass} p-3 pt-2 border-top border-dark`}>
      <div className="col-12 mt-0">
        <h6 className="fw-bold text-uppercase small text-brown mb-2">
          <FiArrowRight className="me-1" aria-hidden />
          Split to {toEntryLabel} accounts ({isCrToDr ? 'debit' : 'credit'})
        </h6>
      </div>
      <div className="col-12">
        <div className="row g-2 mb-2 d-none d-md-flex small fw-bold text-brown px-1">
          <div className="col-md-3">{toEntryLabel} account</div>
          <div className="col-md-3">Amount (₹)</div>
          <div className="col-md-4">Information</div>
          <div className="col-md-2 text-center">Action</div>
        </div>
        {form.to_rows.map((row, index) => (
          <div className="row g-2 align-items-center mb-2" key={`to-${index}`}>
            <div className="col-12 col-md-3">
              <label className="form-label d-md-none small fw-bold text-muted mb-1">
                {toEntryLabel} account
              </label>
              <select
                className="form-select border-dark"
                value={row.acc_id}
                onChange={(e) => updateToRow(index, 'acc_id', e.target.value)}
              >
                {renderAccountOptions(
                  toAccounts,
                  toEntryLabel,
                  `Select ${toEntryLabel} account (${isCrToDr ? 'debit' : 'credit'})`
                )}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label d-md-none small fw-bold text-muted mb-1">Amount (₹)</label>
              <input
                type="text"
                inputMode="decimal"
                className="form-control border-dark text-end"
                placeholder="0.00"
                value={row.amt}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, '');
                  updateToRow(index, 'amt', cleaned);
                }}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label d-md-none small fw-bold text-muted mb-1">Information</label>
              <input
                type="text"
                className="form-control border-dark"
                placeholder="Optional remark"
                value={row.remarks}
                onChange={(e) => updateToRow(index, 'remarks', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label d-md-none small fw-bold text-muted mb-1">Action</label>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary bg-white border-dark"
                  onClick={() => tryAddToRow(index)}
                  title="Add split row"
                  aria-label="Add split row"
                >
                  <FiPlus />
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger bg-white border-dark"
                  onClick={() => removeToRow(index)}
                  disabled={form.to_rows.length <= 1}
                  title={
                    form.to_rows.length <= 1 ? 'At least one row is required' : 'Remove row'
                  }
                  aria-label="Remove split row"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="row mt-2 pt-2 border-top border-dark">
          <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="small text-muted">{toEntryLabel} total (split)</span>
            <span className="fw-bold fs-6 text-brown">₹ {formatInr(totalToAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="card p-3 p-md-4 shadow-sm border-0 app-module-panel">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div className="flex-grow-1">
          <h4 className="fw-bold text-brown mb-1">Inter-Account Transfer</h4>
          <p className="text-muted small mb-0">
            Select one {fromEntryLabel} account on top, then split the amount across{' '}
            {toEntryLabel} accounts below. Use <strong>+</strong> to add split rows.
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2 ms-md-auto">
          <div className="btn-group btn-group-sm" role="group" aria-label="Transfer entry type">
            <button
              type="button"
              className={`btn ${isCrToDr ? 'btn-primary' : 'btn-outline-primary border-dark bg-white'}`}
              onClick={() => setTransferDirection(TRANSFER_DIRECTION.CR_TO_DR)}
            >
              CR → DR
            </button>
            <button
              type="button"
              className={`btn ${!isCrToDr ? 'btn-primary' : 'btn-outline-primary border-dark bg-white'}`}
              onClick={() => setTransferDirection(TRANSFER_DIRECTION.DR_TO_CR)}
            >
              DR → CR
            </button>
          </div>
          <Link to="/account/transfer/list" className="btn btn-outline-secondary btn-sm">
            <FiArrowLeft className="me-1" /> Transaction list
          </Link>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <label className="form-label fw-bold small text-muted mb-1">
              Firm <span className="text-danger">*</span>
            </label>
            <select
              className="form-select border-dark"
              value={form.mtf_firm_id}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  mtf_firm_id: e.target.value,
                  mtf_from_acc_id: '',
                  to_rows: [emptyLineRow()],
                }))
              }
              required
            >
              <option value="">Select firm</option>
              {firms.map((f) => (
                <option key={f.firm_id} value={f.firm_id}>
                  {f.firm_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label fw-bold small text-muted mb-1">
              Transfer date <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              ref={dateRef}
              className="form-control border-dark"
              defaultValue={moment(form.mtf_trans_date).format('DD-MM-YYYY')}
              required
            />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label fw-bold small text-muted mb-1">
              Voucher narration <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control border-dark"
              rows={2}
              placeholder="Enter voucher narration"
              value={form.mtf_narration}
              maxLength={MAX_VOUCHER_NARRATION_LENGTH}
              required
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  mtf_narration: e.target.value.slice(0, MAX_VOUCHER_NARRATION_LENGTH),
                }))
              }
            />
            <div className="form-text text-end">
              {(form.mtf_narration || '').length}/{MAX_VOUCHER_NARRATION_LENGTH}
            </div>
          </div>
        </div>

        {isFormValid && totalToAmount > 0 && (
          <div className="alert alert-success py-2 small mb-3" role="status">
            {fromEntryLabel} and {toEntryLabel} totals match (₹ {formatInr(totalToAmount)}).
          </div>
        )}

        <div className="rounded border border-dark overflow-hidden">
          <div className={`row g-3 ${topPanelClass} p-3 pb-4`}>
            <div className="col-12">
              <h6 className="fw-bold text-uppercase small text-brown mb-2">
                One {fromEntryLabel} account ({isCrToDr ? 'credit' : 'debit'})
              </h6>
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label fw-bold small text-muted mb-1">
                {fromEntryLabel} account <span className="text-danger">*</span>
              </label>
              <select
                className="form-select border-dark"
                value={form.mtf_from_acc_id}
                onChange={(e) => setForm((prev) => ({ ...prev, mtf_from_acc_id: e.target.value }))}
                required
              >
                {renderAccountOptions(
                  fromAccounts,
                  fromEntryLabel,
                  `Select ${fromEntryLabel} account (${isCrToDr ? 'credit' : 'debit'})`
                )}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-2 bg-light border border-dark rounded h-100 d-flex flex-column justify-content-center">
                <div className="small text-muted">{fromEntryLabel} total</div>
                <div className="fw-bold text-brown fs-5">₹ {formatInr(totalFromAmount)}</div>
                <div className="small text-muted mt-1">From split amounts below</div>
              </div>
            </div>
          </div>
          {renderSplitSection()}
        </div>

        <div className="d-grid d-md-flex justify-content-md-center gap-2 mt-4">
          <button
            type="submit"
            className="btn btn-primary btn-lg px-5"
            disabled={loading || !isFormValid}
            title={formValidationError || undefined}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Saving…
              </>
            ) : (
              'Save transfer'
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-lg"
            onClick={() => navigate('/account/transfer/list')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterAccountTransferForm;
