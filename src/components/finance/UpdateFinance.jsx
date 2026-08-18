import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import useFormNavigation from '../../hooks/useFormNavigation';
import useAddFinanceCalculator from '../../hooks/useAddFinanceCalculator';
import { getFirmsDropdown } from '../../api/firmApi';
import { getAccountsDropdown } from '../../api/accountApi';
import { getFinanceDetails, updateFinance } from '../../api/financeApi';
import { toast } from 'react-hot-toast';

const UpdateFinance = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasPayments, setHasPayments] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [finId, setFinId] = useState(null);
  const [collectPaid, setCollectPaid] = useState(0);

  const [formData, setFormData] = useState({
    fin_prin_amt: '',
    fin_no_of_emi: '',
    fin_start_date: moment().format('YYYY-MM-DD'),
    fin_firm_id: '',
    fin_freq: '1',
    fin_freq_type: 'MONTHLY',
    fin_roi: '',
    fin_collec_amt: '',
    fin_proccess_amt: '',
    fin_fine_amt: '',
    fin_fine_emi_no: '',
    fin_staff_id: '',
    fin_user_id: '',
    fin_dr_acc_id: '',
    fin_emi_amt: '0.00',
    fin_final_amt: '0.00',
    fin_cash_acc_id: '',
    fin_cash_amt: '',
    fin_cash_info: '',
    fin_bank_acc_id: '',
    fin_bank_amt: '',
    fin_bank_info: '',
    fin_online_acc_id: '',
    fin_online_amt: '',
    fin_online_info: '',
    fin_card_acc_id: '',
    fin_card_amt: '',
    fin_card_info: '',
    fin_pay_info: '',
    fin_other_info: '',
  });

  const [firms, setFirms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const { selectedUser } = useSelector((state) => state.user);
  const formRef = useRef(null);
  const startDateRef = useRef(null);
  useFormNavigation(formRef);

  const lockFinancial = hasPayments || isClosed;
  const lockAllExceptNotes = isClosed;

  const { fin_emi_amt, fin_final_amt, fin_interest_amt, fin_receivable_amt, isEmiInvalid, emiError } = useAddFinanceCalculator({
    fin_prin_amt: formData.fin_prin_amt,
    fin_no_of_emi: formData.fin_no_of_emi,
    fin_freq_type: formData.fin_freq_type,
    fin_proccess_amt: formData.fin_proccess_amt,
    fin_roi: formData.fin_roi,
  });

  const hasEmiInputs =
    (parseFloat(formData.fin_prin_amt) || 0) > 0 && (parseInt(formData.fin_no_of_emi, 10) || 0) > 0;

  useEffect(() => {
    if (lockFinancial) return;
    setFormData((prev) => {
      const updates = { fin_emi_amt, fin_final_amt };
      if (!prev.fin_cash_amt || prev.fin_cash_amt === prev.fin_final_amt) {
        updates.fin_cash_amt = fin_final_amt;
      }
      return { ...prev, ...updates };
    });
  }, [fin_emi_amt, fin_final_amt, lockFinancial]);

  useEffect(() => {
    const load = async () => {
      const financeId = id || location.state?.finance?.fin_id;
      if (!financeId) {
        toast.error('Finance id missing');
        navigate('/user/home/active-finance');
        return;
      }
      try {
        setFetching(true);
        const res = await getFinanceDetails(financeId);
        const d = res.data;
        setFinId(d.fin_id);
        setHasPayments(Boolean(d.has_payments));
        setIsClosed(d.fin_status === 'CLOSED');
        setCollectPaid(parseFloat(d.fine_summary?.collectPaid) || 0);
        setFormData({
          fin_prin_amt: d.fin_prin_amt != null ? String(d.fin_prin_amt) : '',
          fin_no_of_emi: d.fin_no_of_emi != null ? String(d.fin_no_of_emi) : '',
          fin_start_date: d.fin_start_date || moment().format('YYYY-MM-DD'),
          fin_firm_id: d.fin_firm_id != null ? String(d.fin_firm_id) : '',
          fin_freq: d.fin_freq != null && String(d.fin_freq).trim() !== '' ? String(d.fin_freq) : '1',
          fin_freq_type: d.fin_freq_type || 'MONTHLY',
          fin_roi: d.fin_roi != null ? String(d.fin_roi) : '',
          fin_collec_amt: d.fin_collec_amt != null ? String(d.fin_collec_amt) : '',
          fin_proccess_amt: d.fin_proccess_amt != null ? String(d.fin_proccess_amt) : '',
          fin_fine_amt: d.fin_fine_amt != null ? String(d.fin_fine_amt) : '',
          fin_fine_emi_no: d.fin_fine_emi_no != null ? String(d.fin_fine_emi_no) : '',
          fin_staff_id: d.fin_staff_id != null ? String(d.fin_staff_id) : '',
          fin_user_id: d.fin_user_id != null ? String(d.fin_user_id) : '',
          fin_dr_acc_id: d.fin_dr_acc_id != null ? String(d.fin_dr_acc_id) : '',
          fin_emi_amt: d.fin_emi_amt != null ? String(d.fin_emi_amt) : '0.00',
          fin_final_amt: d.fin_final_amt != null ? String(d.fin_final_amt) : '0.00',
          fin_cash_acc_id: d.fin_cash_acc_id != null ? String(d.fin_cash_acc_id) : '',
          fin_cash_amt: d.fin_cash_amt != null ? String(d.fin_cash_amt) : '',
          fin_cash_info: d.fin_cash_info || '',
          fin_bank_acc_id: d.fin_bank_acc_id != null ? String(d.fin_bank_acc_id) : '',
          fin_bank_amt: d.fin_bank_amt != null ? String(d.fin_bank_amt) : '',
          fin_bank_info: d.fin_bank_info || '',
          fin_online_acc_id: d.fin_online_acc_id != null ? String(d.fin_online_acc_id) : '',
          fin_online_amt: d.fin_online_amt != null ? String(d.fin_online_amt) : '',
          fin_online_info: d.fin_online_info || '',
          fin_card_acc_id: d.fin_card_acc_id != null ? String(d.fin_card_acc_id) : '',
          fin_card_amt: d.fin_card_amt != null ? String(d.fin_card_amt) : '',
          fin_card_info: d.fin_card_info || '',
          fin_pay_info: d.fin_pay_info || '',
          fin_other_info: d.fin_other_info || '',
        });
      } catch (err) {
        toast.error(err.message || 'Failed to load finance');
        navigate('/user/home/active-finance');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, location.state?.finance?.fin_id, navigate]);

  useEffect(() => {
    getFirmsDropdown()
      .then((res) => setFirms(res.data || res || []))
      .catch(() => toast.error('Failed to load firms'));
  }, []);

  useEffect(() => {
    const firmId = formData.fin_firm_id;
    if (!firmId) return;
    getAccountsDropdown(firmId)
      .then((res) => {
        const accData = res.data || res || [];
        setAccounts(Array.isArray(accData) ? accData : []);
      })
      .catch(() => toast.error('Failed to load accounts'));
  }, [formData.fin_firm_id]);

  useEffect(() => {
    const el = startDateRef.current;
    if (!el || fetching) return;
    $(el).daterangepicker({
      singleDatePicker: true,
      showDropdowns: true,
      autoUpdateInput: true,
      locale: { format: 'DD-MM-YYYY' },
      startDate: formData.fin_start_date
        ? moment(formData.fin_start_date, 'YYYY-MM-DD')
        : moment(),
    });
    $(el).on('apply.daterangepicker', (ev, picker) => {
      if (lockFinancial) return;
      setFormData((prev) => ({
        ...prev,
        fin_start_date: picker.startDate.format('YYYY-MM-DD'),
      }));
    });
    return () => {
      try {
        $(el)?.data('daterangepicker')?.remove();
      } catch (_) {
        /* ignore */
      }
    };
  }, [fetching, formData.fin_start_date, lockFinancial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      'fin_prin_amt', 'fin_no_of_emi', 'fin_collec_amt', 'fin_proccess_amt',
      'fin_roi', 'fin_fine_amt', 'fin_cash_amt', 'fin_bank_amt',
      'fin_online_amt', 'fin_card_amt', 'fin_fine_emi_no', 'fin_freq',
    ];
    if (numericFields.includes(name)) {
      const integerFields = ['fin_no_of_emi', 'fin_fine_emi_no', 'fin_freq'];
      let sanitizedValue = integerFields.includes(name)
        ? value.replace(/[^0-9]/g, '')
        : value.replace(/[^0-9.]/g, '');
      if (!integerFields.includes(name)) {
        const parts = sanitizedValue.split('.');
        sanitizedValue =
          parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitizedValue;
      }
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const lockHint = useMemo(() => {
    if (isClosed) return 'Finance is CLOSED — only Other Information can be updated.';
    if (hasPayments) {
      return 'Payments exist — principal/EMI/ROI/channels are locked. Fine, Collect and notes can still be updated.';
    }
    return 'No payments yet — full financial update allowed (EMI schedule + journal will rebuild).';
  }, [isClosed, hasPayments]);

  const blockFinancialSave = !lockFinancial && isEmiInvalid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finId) return;

    if (lockAllExceptNotes) {
      setLoading(true);
      try {
        await updateFinance(finId, { fin_other_info: formData.fin_other_info });
        toast.success('Finance updated successfully');
        navigate('/user/home/finance', {
          state: { finance: { fin_id: finId } },
        });
      } catch (err) {
        toast.error(err.message || 'Update failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    const fineAmt = parseFloat(formData.fin_fine_amt || 0) || 0;
    const fineEmiNo = parseInt(formData.fin_fine_emi_no || 0, 10) || 0;
    const noOfEmi = parseInt(formData.fin_no_of_emi || 0, 10) || 0;
    if (fineAmt > 0 || fineEmiNo > 0) {
      if (!(fineAmt > 0 && fineEmiNo > 0)) {
        toast.error('Both Fine Amount and Fine EMI No are required when fine is set');
        return;
      }
      if (fineEmiNo > noOfEmi) {
        toast.error(`Fine EMI No (${fineEmiNo}) cannot exceed total EMIs (${noOfEmi})`);
        return;
      }
    }
    const collectAmt = parseFloat(formData.fin_collec_amt || 0) || 0;
    if (collectAmt + 0.01 < collectPaid) {
      toast.error(`Collect Amount cannot be less than already collected (${collectPaid.toFixed(2)})`);
      return;
    }

    if (!lockFinancial) {
      if (!formData.fin_firm_id) {
        toast.error('Please select Firm');
        return;
      }
      if (!formData.fin_user_id || formData.fin_user_id === '0') {
        if (!selectedUser?.user_id) {
          toast.error('Please select User / Customer');
          return;
        }
      }
      const noOfEmi = parseInt(formData.fin_no_of_emi || 0, 10) || 0;
      if (!(noOfEmi > 0)) {
        toast.error('No Of EMI must be greater than 0');
        return;
      }
      if (isEmiInvalid) {
        toast.error(emiError || 'Per EMI amount must be a whole number.');
        return;
      }
      const freq = parseInt(String(formData.fin_freq || '').trim() || '1', 10);
      if (!(freq > 0)) {
        toast.error('Frequency must be greater than 0');
        return;
      }
      const disbursed = parseFloat(formData.fin_final_amt || 0);
      const cash = parseFloat(formData.fin_cash_amt || 0);
      const bank = parseFloat(formData.fin_bank_amt || 0);
      const online = parseFloat(formData.fin_online_amt || 0);
      const card = parseFloat(formData.fin_card_amt || 0);
      if (Math.abs(disbursed - (cash + bank + online + card)) > 0.01) {
        toast.error(
          `Payment channels must equal Disbursement Amount (${disbursed.toFixed(2)})`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const payload = lockFinancial
        ? {
            fin_fine_amt: formData.fin_fine_amt,
            fin_fine_emi_no: formData.fin_fine_emi_no,
            fin_collec_amt: formData.fin_collec_amt,
            fin_other_info: formData.fin_other_info,
            fin_pay_info: formData.fin_pay_info,
            fin_cash_info: formData.fin_cash_info,
            fin_bank_info: formData.fin_bank_info,
            fin_online_info: formData.fin_online_info,
            fin_card_info: formData.fin_card_info,
          }
        : {
            ...formData,
            fin_user_id: formData.fin_user_id || selectedUser?.user_id,
            fin_emi_amt,
            fin_final_amt,
          };

      await updateFinance(finId, payload);
      toast.success('Finance updated successfully');
      navigate('/user/home/finance', {
        state: { finance: { fin_id: finId } },
      });
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Loading finance...</p>
      </div>
    );
  }

  return (
    <div className="card border-0">
      <h4 className="card-title text-center fw-bold">Update Finance</h4>
      <div className="alert alert-info py-2 small mx-2">{lockHint}</div>

      <form ref={formRef} noValidate onSubmit={handleSubmit}>
        <h5 className="text-muted px-2">Finance Information</h5>
        <div className="row g-3 px-2">
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Principal Amount <span className="text-danger">*</span></label>
            <input
              type="text"
              name="fin_prin_amt"
              className="form-control border-dark"
              value={formData.fin_prin_amt}
              onChange={handleChange}
              disabled={lockFinancial}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">No Of EMI <span className="text-danger">*</span></label>
            <input
              type="text"
              name="fin_no_of_emi"
              className="form-control border-dark"
              value={formData.fin_no_of_emi}
              onChange={handleChange}
              disabled={lockFinancial}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Start Date <span className="text-danger">*</span></label>
            <input
              type="text"
              name="fin_start_date"
              ref={startDateRef}
              className="form-control border-dark"
              defaultValue={
                formData.fin_start_date
                  ? moment(formData.fin_start_date).format('DD-MM-YYYY')
                  : ''
              }
              disabled={lockFinancial}
              readOnly={lockFinancial}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Firm Name <span className="text-danger">*</span></label>
            <select
              name="fin_firm_id"
              className="form-select border-dark"
              value={formData.fin_firm_id}
              onChange={handleChange}
              disabled={lockFinancial}
            >
              <option value="">Select Firm</option>
              {firms.map((firm) => (
                <option key={firm.firm_id} value={firm.firm_id}>
                  {firm.firm_name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Frequency Type</label>
            <select
              name="fin_freq_type"
              className="form-select border-dark"
              value={formData.fin_freq_type}
              onChange={handleChange}
              disabled={lockFinancial}
            >
              <option value="DAILY">Daily</option>
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Frequency <span className="text-danger">*</span></label>
            <input
              type="text"
              name="fin_freq"
              placeholder="1"
              className="form-control border-dark"
              value={formData.fin_freq}
              onChange={handleChange}
              disabled={lockFinancial}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Collect Amount</label>
            <input
              type="text"
              name="fin_collec_amt"
              className="form-control border-dark"
              value={formData.fin_collec_amt}
              onChange={handleChange}
              disabled={lockAllExceptNotes}
            />
            {collectPaid > 0 && (
              <div className="form-text">Already collected: ₹{collectPaid.toFixed(2)}</div>
            )}
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Processing Fees</label>
            <input
              type="text"
              name="fin_proccess_amt"
              className="form-control border-dark"
              value={formData.fin_proccess_amt}
              onChange={handleChange}
              disabled={lockFinancial}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">ROI</label>
            <input
              type="text"
              name="fin_roi"
              className="form-control border-dark"
              value={formData.fin_roi}
              onChange={handleChange}
              disabled={lockFinancial}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Fine Amount</label>
            <input
              type="text"
              name="fin_fine_amt"
              className="form-control border-dark"
              value={formData.fin_fine_amt}
              onChange={handleChange}
              disabled={lockAllExceptNotes}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Fine EMI No</label>
            <input
              type="text"
              name="fin_fine_emi_no"
              className="form-control border-dark"
              value={formData.fin_fine_emi_no}
              onChange={handleChange}
              disabled={lockAllExceptNotes}
            />
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Per EMI Amount</label>
            <input
              type="text"
              className={`form-control border-dark ${blockFinancialSave ? 'is-invalid' : ''}`}
              value={lockFinancial ? formData.fin_emi_amt : fin_emi_amt}
              readOnly
            />
            {blockFinancialSave && (
              <div className="invalid-feedback d-block fw-bold" style={{ fontSize: '0.8rem' }}>
                {emiError}
              </div>
            )}
            {!lockFinancial && !isEmiInvalid && hasEmiInputs && (
              <div className="form-text">
                Principal (₹{formData.fin_prin_amt || 0}) ÷ {formData.fin_no_of_emi} EMIs
                {parseFloat(fin_interest_amt) > 0 && (
                  <> — interest ₹{fin_interest_amt} collected separately</>
                )}
              </div>
            )}
          </div>
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Interest (from ROI)</label>
            <input type="text" className="form-control border-dark" value={fin_interest_amt} readOnly />
          </div>
          {!lockFinancial && (
            <div className="col-12 col-md-4 col-lg-3">
              <label className="form-label fw-medium">Total Receivable</label>
              <input type="text" className="form-control border-dark" value={fin_receivable_amt} readOnly />
            </div>
          )}
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label fw-medium">Disbursement Amount</label>
            <input
              type="text"
              className="form-control border-dark"
              value={lockFinancial ? formData.fin_final_amt : fin_final_amt}
              readOnly
            />
          </div>
        </div>

        <hr />
        <h5 className="text-muted px-2">Payment / Notes</h5>
        <fieldset disabled={lockFinancial} className="px-2">
          <div className="row g-3">
            <div className="col-md-4">
              <select
                name="fin_cash_acc_id"
                className="form-select border-dark"
                value={formData.fin_cash_acc_id}
                onChange={handleChange}
              >
                <option value="">Cash Account</option>
                {accounts.map((a) => (
                  <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="fin_cash_info"
                className="form-control border-dark"
                placeholder="Cash Information"
                value={formData.fin_cash_info}
                onChange={handleChange}
                disabled={false}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="fin_cash_amt"
                className="form-control border-dark"
                placeholder="Cash Amount"
                value={formData.fin_cash_amt}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <select
                name="fin_bank_acc_id"
                className="form-select border-dark"
                value={formData.fin_bank_acc_id}
                onChange={handleChange}
              >
                <option value="">Bank Account</option>
                {accounts.map((a) => (
                  <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="fin_bank_info"
                className="form-control border-dark"
                placeholder="Bank Information"
                value={formData.fin_bank_info}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="fin_bank_amt"
                className="form-control border-dark"
                placeholder="Bank Amount"
                value={formData.fin_bank_amt}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <select
                name="fin_online_acc_id"
                className="form-select border-dark"
                value={formData.fin_online_acc_id}
                onChange={handleChange}
              >
                <option value="">Online Account</option>
                {accounts.map((a) => (
                  <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="fin_online_info"
                className="form-control border-dark"
                placeholder="Online Information"
                value={formData.fin_online_info}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="fin_online_amt"
                className="form-control border-dark"
                placeholder="Online Amount"
                value={formData.fin_online_amt}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <select
                name="fin_card_acc_id"
                className="form-select border-dark"
                value={formData.fin_card_acc_id}
                onChange={handleChange}
              >
                <option value="">Card Account</option>
                {accounts.map((a) => (
                  <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="fin_card_info"
                className="form-control border-dark"
                placeholder="Card Information"
                value={formData.fin_card_info}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="fin_card_amt"
                className="form-control border-dark"
                placeholder="Card Amount"
                value={formData.fin_card_amt}
                onChange={handleChange}
              />
            </div>
          </div>
        </fieldset>

        {/* Info notes remain editable when payments exist (not closed) */}
        {hasPayments && !isClosed && (
          <div className="row g-3 px-2 mt-2">
            <div className="col-md-6">
              <label className="form-label fw-medium">Cash Information</label>
              <input
                type="text"
                name="fin_cash_info"
                className="form-control border-dark"
                value={formData.fin_cash_info}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Bank Information</label>
              <input
                type="text"
                name="fin_bank_info"
                className="form-control border-dark"
                value={formData.fin_bank_info}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div className="row g-3 px-2 mt-2">
          <div className="col-md-6">
            <label className="form-label fw-medium">Payment Other Information</label>
            <textarea
              name="fin_pay_info"
              rows={2}
              className="form-control border-dark"
              value={formData.fin_pay_info}
              onChange={handleChange}
              disabled={lockAllExceptNotes}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Other Information</label>
            <textarea
              name="fin_other_info"
              rows={2}
              className="form-control border-dark"
              value={formData.fin_other_info}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="text-center mt-4 mb-3">
          <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg px-5" disabled={loading || blockFinancialSave}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              'Update Finance'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateFinance;
