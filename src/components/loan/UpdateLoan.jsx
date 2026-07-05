import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import useFormNavigation from '../../hooks/useFormNavigation';
import { useParams } from 'react-router-dom';
import { getFirmsDropdown } from '../../api/firmApi';
import { getAccountsDropdown } from '../../api/accountApi';
import { getGirviById, updateGirvi } from '../../api/girviApi';
import { toast } from 'react-hot-toast';

const UpdateLoan = () => {
  const { id } = useParams();
  const [hasTransactions, setHasTransactions] = useState(false);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [firms, setFirms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const { selectedFirmId, firms: reduxFirms } = useSelector((state) => state.firm);
  const { selectedUser } = useSelector((state) => state.user);

  const getEmptyItem = () => ({
    st_metal_type: 'GOLD',
    st_item_name: '',
    st_quantity: '',
    st_gs_weight: '',
    st_gs_type: 'GM',
    st_nt_weight: '',
    st_nt_type: 'GM',
    st_purity: '100%',
    st_fine_weight: '',
    st_valuation: '',
    itemImage: null,
    imageName: '',
  });

  const [formData, setFormData] = useState({
    girv_type: 'secured',
    girv_prin_amt: '',
    girv_start_date: moment().format('YYYY-MM-DD'),
    girv_interest_method: 'simple',
    girv_compound_freq: 'monthly',
    girv_roi_type: 'monthly',
    girv_packet_no: '',
    girv_locker_no: '',
    girv_process_per: '',
    girv_process_amt: '',
    girv_charge_per: '',
    girv_charge_amt: '',
    girv_roi: '',

    girv_other_info: '',
    girv_first_int: false,
    girv_first_int_cr_acc_id: '',
    girv_first_int_dr_acc_id: '',
    items: [getEmptyItem()],

    girv_cash_acc_id: '',
    girv_cash_amt: '',
    girv_cash_info: '',

    girv_bank_acc_id: '',
    girv_bank_amt: '',
    girv_bank_info: '',

    girv_online_acc_id: '',
    girv_online_amt: '',
    girv_online_info: '',

    girv_card_acc_id: '',
    girv_card_amt: '',
    girv_card_info: '',

    girv_pay_info: '',
  });

  const girv_start_dateRef = useRef(null);

  // Form Navigation
  const formRef = useRef(null);
  useFormNavigation(formRef);



  useEffect(() => {
    if (girv_start_dateRef.current) {
      $(girv_start_dateRef.current).daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: {
          format: 'DD-MM-YYYY'
        }
      }, (start) => {
        setFormData(prev => ({ ...prev, girv_start_date: start.format('YYYY-MM-DD') }));
      });
    }

    const fetchFirms = async () => {
      try {
        const firmRes = await getFirmsDropdown();
        const firmData = firmRes.data || firmRes || [];
        setFirms(Array.isArray(firmData) ? firmData : []);
      } catch (error) {
        console.error("Error fetching firms:", error);
      }
    };

    fetchFirms();

    const fetchLoanData = async () => {
      if (!id) return;
      try {
        const res = await getGirviById(id);
        if (res && res.data) {
          const d = res.data;
          const isClosed = d.girv_status === 'CLOSED' || d.girv_status === 'RELEASED';
          const hasTrans = (d.additionalPrincipals && d.additionalPrincipals.length > 0) ||
                           (d.deposits && d.deposits.length > 0) ||
                           (d.releases && d.releases.length > 0);
          
          setHasTransactions(isClosed || hasTrans);

          setFormData(prev => ({
            ...prev,
            girv_uuid: d.girv_uuid || '',
            girv_type: d.girv_type || 'secured',
            girv_prin_amt: d.girv_prin_amt || '',
            girv_start_date: d.girv_start_date ? moment(d.girv_start_date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
            girv_interest_method: d.girv_interest_method || 'simple',
            girv_compound_freq: d.girv_compound_freq || 'monthly',
            girv_roi_type: d.girv_roi_type || 'monthly',
            girv_packet_no: d.girv_packet_no || '',
            girv_locker_no: d.girv_locker_no || '',
            girv_process_per: d.girv_process_per || '',
            girv_process_amt: d.girv_process_amt || '',
            girv_charge_per: d.girv_charge_per || '',
            girv_charge_amt: d.girv_charge_amt || '',
            girv_roi: d.girv_roi || '',
            girv_other_info: d.girv_other_info || '',
            girv_first_int: d.girv_first_int === 'Y',
            girv_first_int_cr_acc_id: d.girv_first_int_cr_acc_id || '',
            girv_first_int_dr_acc_id: d.girv_first_int_dr_acc_id || '',
            items: d.items && d.items.length > 0 ? d.items.map(item => ({
              st_metal_type: item.st_metal_type ? item.st_metal_type.toUpperCase() : 'GOLD',
              st_item_name: item.st_item_name || '',
              st_quantity: item.st_quantity || '',
              st_gs_weight: item.st_gs_weight || '',
              st_gs_type: item.st_gs_type || 'GM',
              st_nt_weight: item.st_nt_weight || '',
              st_nt_type: item.st_nt_type || 'GM',
              st_purity: item.st_purity || '100%',
              st_fine_weight: item.st_fine_weight || '',
              st_valuation: item.st_valuation || item.st_final_valuation || '',
              itemImage: null,
              imageName: '',
            })) : [getEmptyItem()],
            girv_cash_acc_id: d.girv_cash_acc_id || '',
            girv_cash_amt: d.girv_cash_amt || '',
            girv_cash_info: d.girv_cash_info || '',
            girv_bank_acc_id: d.girv_bank_acc_id || '',
            girv_bank_amt: d.girv_bank_amt || '',
            girv_bank_info: d.girv_bank_info || '',
            girv_online_acc_id: d.girv_online_acc_id || '',
            girv_online_amt: d.girv_online_amt || '',
            girv_online_info: d.girv_online_info || '',
            girv_card_acc_id: d.girv_card_acc_id || '',
            girv_card_amt: d.girv_card_amt || '',
            girv_card_info: d.girv_card_info || '',
            girv_pay_info: d.girv_pay_info || '',
            girv_firm_id: d.girv_firm_id || '',
          }));

          // also update the date picker
          if (girv_start_dateRef.current) {
            $(girv_start_dateRef.current).data('daterangepicker').setStartDate(moment(d.girv_start_date).format('DD-MM-YYYY'));
            $(girv_start_dateRef.current).data('daterangepicker').setEndDate(moment(d.girv_start_date).format('DD-MM-YYYY'));
          }
        }
      } catch (error) {
        toast.error('Failed to fetch loan details.');
      }
    };

    fetchLoanData();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [id]);

  // Sync firm ID with Header selection
  useEffect(() => {
    if (selectedFirmId === 'all') {
      if (reduxFirms.length > 0 && !formData.girv_firm_id) {
        setFormData(prev => ({ ...prev, girv_firm_id: reduxFirms[0].firm_id }));
      }
    } else if (selectedFirmId && selectedFirmId !== formData.girv_firm_id) {
      setFormData(prev => ({ ...prev, girv_firm_id: selectedFirmId }));
    }
  }, [selectedFirmId, reduxFirms, formData.girv_firm_id]);

  // Fetch accounts when firm changes
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!formData.girv_firm_id) return;
      try {
        const accRes = await getAccountsDropdown(formData.girv_firm_id);
        const accData = accRes.data || accRes || [];
        setAccounts(Array.isArray(accData) ? accData : []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, [formData.girv_firm_id]);

  // Auto-select default accounts when accounts list is loaded
  useEffect(() => {
    if (accounts.length > 0) {
      setFormData(prev => {
        const updates = {};
        if (!prev.girv_cash_acc_id) {
          const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
          if (cashAcc) updates.girv_cash_acc_id = cashAcc.acc_id;
        }
        if (!prev.girv_bank_acc_id) {
          const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
          if (bankAcc) updates.girv_bank_acc_id = bankAcc.acc_id;
        }
        if (!prev.girv_online_acc_id) {
          const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
          if (onlineAcc) updates.girv_online_acc_id = onlineAcc.acc_id;
        }
        if (!prev.girv_card_acc_id) {
          const cardAcc = accounts.find(a => a.acc_name === "Card Account");
          if (cardAcc) updates.girv_card_acc_id = cardAcc.acc_id;
        }
        if (!prev.girv_first_int_dr_acc_id) {
          const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
          if (cashAcc) updates.girv_first_int_dr_acc_id = cashAcc.acc_id;
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [accounts]);

  const totalSteps = formData.girv_type === 'secured' ? 3 : 2;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updates = { [name]: type === 'checkbox' ? checked : value };

      const newForm = { ...prev, ...updates };
      const prinAmt = parseFloat(newForm.girv_prin_amt) || 0;

      if (name === 'girv_prin_amt') {
        if (newForm.girv_process_per) updates.girv_process_amt = (prinAmt * parseFloat(newForm.girv_process_per) / 100).toFixed(2);
        if (newForm.girv_charge_per) updates.girv_charge_amt = (prinAmt * parseFloat(newForm.girv_charge_per) / 100).toFixed(2);
        updates.girv_cash_amt = (prinAmt - (parseFloat(updates.girv_process_amt || newForm.girv_process_amt) || 0) - (parseFloat(updates.girv_charge_amt || newForm.girv_charge_amt) || 0)).toString();
      } else if (name === 'girv_process_per') {
        updates.girv_process_amt = (prinAmt * parseFloat(value || 0) / 100).toFixed(2);
        updates.girv_cash_amt = (prinAmt - parseFloat(updates.girv_process_amt) - (parseFloat(newForm.girv_charge_amt) || 0)).toString();
      } else if (name === 'girv_process_amt') {
        if (prinAmt > 0) updates.girv_process_per = ((parseFloat(value || 0) / prinAmt) * 100).toFixed(2);
        updates.girv_cash_amt = (prinAmt - parseFloat(value || 0) - (parseFloat(newForm.girv_charge_amt) || 0)).toString();
      } else if (name === 'girv_charge_per') {
        updates.girv_charge_amt = (prinAmt * parseFloat(value || 0) / 100).toFixed(2);
        updates.girv_cash_amt = (prinAmt - (parseFloat(newForm.girv_process_amt) || 0) - parseFloat(updates.girv_charge_amt)).toString();
      } else if (name === 'girv_charge_amt') {
        if (prinAmt > 0) updates.girv_charge_per = ((parseFloat(value || 0) / prinAmt) * 100).toFixed(2);
        updates.girv_cash_amt = (prinAmt - (parseFloat(newForm.girv_process_amt) || 0) - parseFloat(value || 0)).toString();
      }

      return { ...prev, ...updates };
    });
  };

  const addNewRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, getEmptyItem()],
    }));
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const updateItemImage = (index, file) => {
    if (!file) return;
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      itemImage: file,
      imageName: file.name,
    };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const deleteItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.girv_prin_amt || !formData.girv_start_date || !formData.girv_roi_type || !formData.girv_roi) {
        toast.error('Please fill all required fields in Loan Information');
        return;
      }
    }
    if (formData.girv_type === 'secured' && currentStep === 2) {
      const invalidItem = formData.items.find(item =>
        !item.st_item_name.trim() ||
        !item.st_quantity.trim() ||
        !item.st_gs_weight.trim() ||
        !item.st_nt_weight.trim() ||
        !item.st_valuation.trim()
      );
      if (invalidItem) {
        toast.error('Please fill required fields for all items (Item Name, Qty, Gross Wt, Net Wt, Valuation)');
        return;
      }
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser?.user_id) {
      toast.error('Please select a user before adding a loan.');
      return;
    }

    // Validation for Secured Loans
    if (formData.girv_type === 'secured') {
      const invalidItem = formData.items.find(item =>
        !item.st_item_name.trim() ||
        !item.st_quantity.trim() ||
        !item.st_gs_weight.trim() ||
        !item.st_nt_weight.trim() ||
        !item.st_valuation.trim()
      );
      if (invalidItem) {
        toast.error('Please fill required fields for all items (Item Name, Qty, Gross Wt, Net Wt, Valuation)');
        return;
      }
    }

    // Validation for Principal Amount matching Payment Accounts
    const prinAmt = parseFloat(formData.girv_prin_amt) || 0;
    const processAmt = parseFloat(formData.girv_process_amt) || 0;
    const chargeAmt = parseFloat(formData.girv_charge_amt) || 0;
    const cashAmt = parseFloat(formData.girv_cash_amt) || 0;
    const bankAmt = parseFloat(formData.girv_bank_amt) || 0;
    const onlineAmt = parseFloat(formData.girv_online_amt) || 0;
    const cardAmt = parseFloat(formData.girv_card_amt) || 0;
    const totalPayment = cashAmt + bankAmt + onlineAmt + cardAmt;

    if (Math.abs(prinAmt - (totalPayment + processAmt + chargeAmt)) > 0.01) {
      toast.error(`Payment sum (${totalPayment}) + Processing (${processAmt}) + Charge (${chargeAmt}) must equal Principal Amount (${prinAmt}). Please adjust the payment panel.`);
      return;
    }

    try {
      const payload = {
        ...formData,
        girv_user_id: selectedUser.user_id,
        girv_first_int: formData.girv_first_int ? 'Y' : 'N'
      };

      const res = await updateGirvi(formData.girv_uuid, payload);
      toast.success('Loan updated successfully!');
      console.log('API Response:', res);

      navigate('/user/home/loan-info', { state: { loanData: res.data } });
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error(error?.error || 'Failed to update loan.');
    }
  };

  const loanInformation = (
    <>
      <h5 className="text-muted">Loan Information</h5>
      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Principal Amount <span className="text-danger">*</span></label>
          <input
            type="text"
            name="girv_prin_amt"
            placeholder="Enter principal amount"
            className="form-control border-dark"
            value={formData.girv_prin_amt}
            disabled={hasTransactions}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, '');
              e.target.value = val;
              handleChange(e);
            }}
            required
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Loan Start Date <span className="text-danger">*</span></label>
          <input
            type="text"
            name="girv_start_date"
            ref={girv_start_dateRef}
            className="form-control border-dark"
            disabled={hasTransactions}
            defaultValue={formData.girv_start_date ? moment(formData.girv_start_date).format('DD-MM-YYYY') : ''}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Interest Method <span className="text-danger">*</span></label>
          <select name="girv_interest_method" className="form-select border-dark" value={formData.girv_interest_method} disabled={hasTransactions} onChange={handleChange} required>
            <option value="simple">Simple</option>
            <option value="compound">Compound</option>
          </select>
        </div>
        {formData.girv_interest_method === 'compound' && (
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Compound Freq <span className="text-danger">*</span></label>
            <select name="girv_compound_freq" className="form-select border-dark" value={formData.girv_compound_freq} disabled={hasTransactions} onChange={handleChange} required>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half_yearly">Half Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Interest Option <span className="text-danger">*</span></label>
          <select name="girv_roi_type" className="form-select border-dark" value={formData.girv_roi_type} disabled={hasTransactions} onChange={handleChange} required>
            <option value="" disabled>Select option</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Rate of Interest <span className="text-danger">*</span></label>
          <input
            type="text"
            name="girv_roi"
            placeholder="Enter rate of interest"
            className="form-control border-dark"
            value={formData.girv_roi}
            disabled={hasTransactions}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, '');
              e.target.value = val;
              handleChange(e);
            }}
            required
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Loan / Packet No</label>
          <input type="text" name="girv_packet_no" placeholder="Enter loan or packet no" className="form-control border-dark" value={formData.girv_packet_no} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Loan Locker No</label>
          <input type="text" name="girv_locker_no" placeholder="Enter locker no" className="form-control border-dark" value={formData.girv_locker_no} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-6 d-flex gap-3 align-items-end">
          <div className="flex-grow-1">
            <label className="form-label fw-medium">Processing Amount</label>
            <div className="input-group border-dark">
              <input
                type="text"
                name="girv_process_per"
                placeholder='Percentage'
                className="form-control border-dark"
                value={formData.girv_process_per}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  e.target.value = val;
                  handleChange(e);
                }}
              />
              <span className="input-group-text border-dark">%</span>
              <input
                type="text"
                name="girv_process_amt"
                placeholder='Amount'
                className="form-control border-dark"
                value={formData.girv_process_amt}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  e.target.value = val;
                  handleChange(e);
                }}
              />
            </div>
          </div>
          <div className="flex-grow-1">
            <label className="form-label fw-medium">Charge Amount</label>
            <div className="input-group border-dark">
              <input
                type="text"
                name="girv_charge_per"
                placeholder='Percentage'
                className="form-control border-dark"
                value={formData.girv_charge_per}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  e.target.value = val;
                  handleChange(e);
                }}
              />
              <span className="input-group-text border-dark">%</span>
              <input
                type="text"
                name="girv_charge_amt"
                placeholder='Amount'
                className="form-control border-dark"
                value={formData.girv_charge_amt}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  e.target.value = val;
                  handleChange(e);
                }}
              />
            </div>
          </div>
        </div>


        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label fw-medium">Firm Name <span className="text-danger">*</span></label>
          <select name="girv_firm_id" className="form-select border-dark" value={formData.girv_firm_id || ''} onChange={handleChange} required>
            <option value="" disabled>Select firm</option>
            {firms.map(firm => (
              <option key={firm.firm_id} value={firm.firm_id}>
                {firm.firm_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-3">

        </div>

        <div className="col-12 col-md-6 col-lg-3">
          {formData.girv_first_int && (
            <>
              <label className="form-label fw-medium">Interest Payment Account (DR)</label>
              <select name="girv_first_int_dr_acc_id" className="form-select border-dark" value={formData.girv_first_int_dr_acc_id || ''} onChange={handleChange} required>
                <option value="" disabled>Select account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="col-12 col-md-6 col-lg-3 d-flex align-items-center">
          <div className="form-check mt-4">
            <input type="checkbox" name="girv_first_int" className="form-check-input" id="firstMonthInt" checked={formData.girv_first_int} onChange={handleChange} />
            <label className="form-check-label fw-medium" htmlFor="firstMonthInt">First Month Interest</label>
          </div>
        </div>
      </div>
    </>
  );

  const itemInformation = (
    <>
      <h5 className="text-muted mt-3">Item Information</h5>
      {hasTransactions && <div className="alert alert-warning py-1 px-2 mb-2" style={{ fontSize: '0.85rem' }}>Item details cannot be modified because this loan has existing transactions.</div>}
      <fieldset disabled={hasTransactions}>
      <div className="table-responsive mb-3">
        <table className="table table-bordered table-hover mb-0">
          <thead>
            <tr className="table-light align-middle" style={{ fontSize: '0.85rem' }}>
              <th className="text-center fw-bold px-1" style={{ width: '7%', minWidth: '50px' }}>METAL</th>
              <th className="text-center fw-bold px-1" style={{ width: '20%', minWidth: '120px' }}>ITEM NAME</th>
              <th className="text-center fw-bold px-1" style={{ width: '5%', minWidth: '65px' }}>QTY</th>
              <th className="text-center fw-bold px-1" style={{ width: '13%', minWidth: '100px' }}>GROSS WT</th>
              <th className="text-center fw-bold px-1" style={{ width: '13%', minWidth: '100px' }}>NET WT</th>
              <th className="text-center fw-bold px-1" style={{ width: '7%', minWidth: '60px' }}>PURITY</th>
              <th className="text-center fw-bold px-1" style={{ width: '8%', minWidth: '50px' }}>FINE WT</th>
              <th className="text-center fw-bold px-1" style={{ width: '15%', minWidth: '100px' }}>VALUATION</th>
              <th className="text-center fw-bold px-1" style={{ width: '6%', minWidth: '45px' }}>IMAGE</th>
              <th className="text-center fw-bold px-1" style={{ width: '6%', minWidth: '45px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td className="px-1 py-1">
                  <select
                    className="form-select form-select-sm px-1 border-secondary"
                    value={item.st_metal_type}
                    onChange={(e) => updateItem(index, 'st_metal_type', e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="GOLD">GOLD</option>
                    <option value="SILVER">SILVER</option>
                  </select>
                </td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="form-control form-control-sm px-1 border-secondary"
                    value={item.st_item_name}
                    onChange={(e) => updateItem(index, 'st_item_name', e.target.value)}
                    placeholder="Item Name"
                    style={{ fontSize: '0.85rem' }}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="form-control form-control-sm px-1 text-center border-secondary"
                    value={item.st_quantity}
                    onChange={(e) => updateItem(index, 'st_quantity', e.target.value)}
                    placeholder="Qty"
                    style={{ fontSize: '0.85rem' }}
                  />
                </td>
                <td className="px-1 py-1">
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control px-1 text-end border-secondary"
                      value={item.st_gs_weight}
                      onChange={(e) => updateItem(index, 'st_gs_weight', e.target.value)}
                      placeholder="Gross Wt"
                      style={{ fontSize: '0.85rem' }}
                    />
                    <select
                      className="form-control px-0 text-center border-secondary no-arrow"
                      style={{ maxWidth: '45px', fontSize: '0.85rem', appearance: 'none', WebkitAppearance: 'none', paddingRight: 0 }}
                      value={item.st_gs_type}
                      onChange={(e) => updateItem(index, 'st_gs_type', e.target.value)}
                    >
                      <option value="GM">GM</option>
                      <option value="KG">KG</option>
                    </select>
                  </div>
                </td>
                <td className="px-1 py-1">
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control px-1 text-end border-secondary"
                      value={item.st_nt_weight}
                      onChange={(e) => updateItem(index, 'st_nt_weight', e.target.value)}
                      placeholder="Net Wt"
                      style={{ fontSize: '0.85rem' }}
                    />
                    <select
                      className="form-control px-0 text-center border-secondary no-arrow"
                      style={{ maxWidth: '45px', fontSize: '0.85rem', appearance: 'none', WebkitAppearance: 'none', paddingRight: 0 }}
                      value={item.st_nt_type}
                      onChange={(e) => updateItem(index, 'st_nt_type', e.target.value)}
                    >
                      <option value="GM">GM</option>
                      <option value="KG">KG</option>
                    </select>
                  </div>
                </td>
                <td className="px-1 py-1">
                  <select
                    className="form-control form-control-sm px-1 text-center border-secondary no-arrow"
                    value={item.st_purity}
                    onChange={(e) => updateItem(index, 'st_purity', e.target.value)}
                    style={{ fontSize: '0.85rem', appearance: 'none', WebkitAppearance: 'none', paddingRight: 0 }}
                  >
                    <option value="100%">100%</option>
                    <option value="92%">92%</option>
                    <option value="80%">80%</option>
                  </select>
                </td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="form-control form-control-sm px-1 text-end border-secondary"
                    value={item.st_fine_weight}
                    onChange={(e) => updateItem(index, 'st_fine_weight', e.target.value)}
                    placeholder="FN WT"
                    style={{ fontSize: '0.85rem' }}
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="form-control form-control-sm px-1 text-end border-secondary"
                    value={item.st_valuation}
                    onChange={(e) => updateItem(index, 'st_valuation', e.target.value)}
                    placeholder="Valuation"
                    style={{ fontSize: '0.85rem' }}
                  />
                </td>
                <td className="text-center px-1 py-1 position-relative">
                  <input
                    type="file"
                    accept="image/*"
                    id={`itemImageInput-${index}`}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        updateItemImage(index, e.target.files[0]);
                      }
                    }}
                  />
                  {item.itemImage || item.imageName ? (
                    <>
                      <label htmlFor={`itemImageInput-${index}`} style={{ cursor: 'pointer' }}>
                        <img
                          src={item.itemImage ? URL.createObjectURL(item.itemImage) : '#'}
                          alt="Item preview"
                          style={{
                            maxWidth: '26px',
                            maxHeight: '26px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </label>
                    </>
                  ) : (
                    <label
                      htmlFor={`itemImageInput-${index}`}
                      className="btn btn-sm btn-outline-info p-1 mb-0"
                      style={{ cursor: 'pointer', minWidth: '40px' }}
                    >
                      <i className="bi bi-upload"></i>
                    </label>
                  )}
                </td>
                <td className="text-center px-1 py-1">
                  <div className="d-flex justify-content-center gap-1">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger p-1"
                        onClick={() => deleteItem(index)}
                        style={{ minWidth: '30px' }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                    {index === formData.items.length - 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary p-1"
                        onClick={addNewRow}
                        style={{ minWidth: '30px' }}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </fieldset>
    </>
  );

  const paymentDetails = (
    <>
      <h5 className="text-muted mt-3">Payment Information</h5>

      {/* Cash Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4 mb-3">
          <select
            name="girv_cash_acc_id"
            className="form-select border-dark"
            value={formData.girv_cash_acc_id}
            onChange={handleChange}
          >
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            name="girv_cash_info"
            placeholder="Cash Information"
            className="form-control border-dark"
            value={formData.girv_cash_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            inputMode="decimal"
            name="girv_cash_amt"
            placeholder="Cash Amount"
            className="form-control border-dark"
            value={formData.girv_cash_amt}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Bank Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <select
            name="girv_bank_acc_id"
            className="form-select border-dark"
            value={formData.girv_bank_acc_id}
            onChange={handleChange}
          >
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            name="girv_bank_info"
            placeholder="Bank Information"
            className="form-control border-dark"
            value={formData.girv_bank_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            inputMode="decimal"
            name="girv_bank_amt"
            placeholder="Bank Amount"
            className="form-control border-dark"
            value={formData.girv_bank_amt}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Online Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <select
            name="girv_online_acc_id"
            className="form-select border-dark"
            value={formData.girv_online_acc_id}
            onChange={handleChange}
          >
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            name="girv_online_info"
            placeholder="Online Information"
            className="form-control border-dark"
            value={formData.girv_online_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4 mb-3">
          <input
            type="text"
            inputMode="decimal"
            name="girv_online_amt"
            placeholder="Online Amount"
            className="form-control border-dark"
            value={formData.girv_online_amt}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Card Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <select
            name="girv_card_acc_id"
            className="form-select border-dark"
            value={formData.girv_card_acc_id}
            onChange={handleChange}
          >
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            name="girv_card_info"
            placeholder="Card Information"
            className="form-control border-dark"
            value={formData.girv_card_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            inputMode="decimal"
            name="girv_card_amt"
            placeholder="Card Amount"
            className="form-control border-dark"
            value={formData.girv_card_amt}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-6 mt-3">
          <label className="form-label fw-medium">Payment Other Info / Remarks</label>
          <textarea name="girv_pay_info" rows={2} placeholder="Enter remarks, reference numbers, etc." className="form-control border-dark" value={formData.girv_pay_info} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6 col-lg-6 mt-3">
          <label className="form-label fw-medium">Other Information</label>
          <textarea name="girv_other_info" rows={2} placeholder="Enter any extra notes or conditions..." className="form-control border-dark" value={formData.girv_other_info} onChange={handleChange} />
        </div>
      </div>
    </>
  );

  const progressBar = (
    <div className="progress mt-3 mb-4" style={{ height: '8px' }}>
      <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(currentStep / totalSteps) * 100}%` }} aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax={totalSteps}></div>
    </div>
  );

  const navigationButtons = (
    <div className="d-flex justify-content-between mt-4">
      {currentStep > 1 && (
        <button type="button" className="btn btn-secondary" onClick={handleBack}>Back</button>
      )}
      {currentStep < totalSteps ? (
        <button type="button" className="btn btn-primary ms-auto" onClick={handleNext}>Next</button>
      ) : (
        <button type="submit" className="btn btn-primary btn-lg px-5 ms-auto">Update Loan</button>
      )}
    </div>
  );

  return (
    <div className="card p-0 border-0 border-md-1 border-secondary">
      <div className="position-relative mb-3 pb-md-0 mt-2">
        <div className="position-absolute top-0 end-0 d-flex align-items-center h-100 z-1">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${formData.girv_type === 'secured' ? 'btn-primary' : 'btn-outline-primary'} ${hasTransactions ? 'disabled' : ''}`}
              onClick={() => !hasTransactions && setFormData(prev => ({ ...prev, girv_type: 'secured' }))}
              disabled={hasTransactions}
            >
              Secured
            </button>
            <button
              type="button"
              className={`btn btn-sm ${formData.girv_type === 'unsecured' ? 'btn-primary' : 'btn-outline-primary'} ${hasTransactions ? 'disabled' : ''}`}
              onClick={() => !hasTransactions && setFormData(prev => ({ ...prev, girv_type: 'unsecured' }))}
              disabled={hasTransactions}
            >
              Unsecured
            </button>
          </div>
        </div>
        <h4 className="card-title text-center fw-bold m-0 py-1">Update Loan</h4>
      </div>

      <form ref={formRef} noValidate onSubmit={handleSubmit}>
        {isMobile ? (
          <>
            {progressBar}
            {currentStep === 1 && loanInformation}
            {currentStep === 2 && (formData.girv_type === 'secured' ? itemInformation : paymentDetails)}
            {currentStep === 3 && formData.girv_type === 'secured' && paymentDetails}
            {navigationButtons}
          </>
        ) : (
          <>
            {loanInformation}
            {formData.girv_type === 'secured' && itemInformation}
            {paymentDetails}
            <div className="d-grid d-md-block text-center mt-5">
              <button type="submit" className="btn btn-primary btn-lg px-5">Update Loan</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default UpdateLoan;