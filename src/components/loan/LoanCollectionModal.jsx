import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import useFormNavigation from '../../hooks/useFormNavigation';
import CommonModal from '../common/CommonModal';
import { getUsers } from '../../api/userApi';
import { getGirvisDropdown, getGirviById } from '../../api/girviApi';
import { addDeposit } from '../../api/depositApi';
import { getAccountsDropdown } from '../../api/accountApi';
import { setSelectedUser } from '../../store/slices/userSlice';
import { getLoanInterestSummary } from '../../utils/loanInterest';

const getLoanPendingSummary = (data) => {
    const summary = data?.interest_summary || getLoanInterestSummary(data);
    const totalDeposits = (data.deposits || []).reduce(
        (sum, dep) => sum + (parseFloat(dep.dep_prin_amt) || 0) + (parseFloat(dep.dep_int_amt) || 0),
        0
    );

    return {
        principal: summary.pendingPrincipal,
        pendingPrincipal: summary.pendingPrincipal,
        pendingInterest: summary.pendingInterest,
        pending: summary.pending,
        totalDeposits,
        totalInterest: summary.totalInterest,
        firstMonthInterest: summary.firstMonthInterest,
    };
};

const LoanCollectionModal = ({ show, onClose, firms = [], selectedFirmId, initialUser = null }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeAction, setActiveAction] = useState(null);
    const [checking, setChecking] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [firmId, setFirmId] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUserLocal] = useState(null);
    const [userLoans, setUserLoans] = useState([]);
    const [loanNo, setLoanNo] = useState('');
    const [loanInfo, setLoanInfo] = useState(null);
    const [loanError, setLoanError] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [activeResultIndex, setActiveResultIndex] = useState(-1);
    const transDateRef = useRef(null);
    const loanNoRef = useRef(null);
    const totalAmountRef = useRef(null);
    const userSearchRef = useRef(null);
    const formRef = useRef(null);

    useFormNavigation(formRef, true);

    const getEmptyFormData = useCallback(() => ({
        dep_trans_date: new Date().toISOString().split('T')[0],
        dep_prin_amt: '',
        dep_int_amt: '',
        dep_disc_amt: '',
        dep_extra_amt: '',
        dep_payable_amt: '',
        dep_cash_amt: '',
        dep_bank_amt: '',
        dep_online_amt: '',
        dep_card_amt: '',
        dep_cash_acc_id: '',
        dep_bank_acc_id: '',
        dep_online_acc_id: '',
        dep_card_acc_id: '',
        dep_cash_info: '',
        dep_bank_info: '',
        dep_online_info: '',
        dep_card_info: '',
        dep_pay_info: '',
        dep_other_info: ''
    }), []);

    const [formData, setFormData] = useState(getEmptyFormData);

    const resetForm = useCallback(() => {
        setLoanNo('');
        setLoanInfo(null);
        setLoanError('');
        setUserSearch('');
        setSelectedUserLocal(null);
        setUserLoans([]);
        setFormData(getEmptyFormData());
        if (transDateRef.current) {
            const today = moment().format('DD-MM-YYYY');
            $(transDateRef.current).val(today);
        }
    }, [getEmptyFormData]);

    useEffect(() => {
        if (transDateRef.current) {
            $(transDateRef.current).daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                autoUpdateInput: true,
                locale: {
                    format: 'DD-MM-YYYY'
                }
            }, (start) => {
                setFormData(prev => ({ ...prev, dep_trans_date: start.format('YYYY-MM-DD') }));
            });
        }

        if (show) {
            resetForm();
            const firmFromUser = initialUser?.user_firm_id;
            if (firmFromUser) {
                setFirmId(firmFromUser);
            } else if (selectedFirmId && selectedFirmId !== 'all') {
                setFirmId(selectedFirmId);
            } else if (firms.length === 1) {
                setFirmId(firms[0].firm_id);
            }
            setSelectedUserLocal(null);
            setUserLoans([]);
            setUserSearch('');
            setSearchResults([]);
            setLoanNo('');
            setLoanInfo(null);

            if (initialUser?.user_id) {
                const firm = firmFromUser || (selectedFirmId !== 'all' ? selectedFirmId : null);
                setTimeout(() => {
                    setSelectedUserLocal(initialUser);
                    setUserSearch(`${initialUser.user_first_name || ''} ${initialUser.user_last_name || ''} (${initialUser.user_mobile_no || ''})`.trim());
                    setSearchResults([]);
                    fetchUserLoans(initialUser, firm);
                }, 80);
            } else {
                setTimeout(() => {
                    const firstEl = formRef.current?.querySelector('select, input');
                    if (firstEl) firstEl.focus();
                }, 300);
            }
        }
        // fetchUserLoans is stable for this modal open cycle
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, selectedFirmId, firms, resetForm, initialUser]);

    useEffect(() => {
        if (firmId && firmId !== 'all') {
            setTimeout(() => {
                if (userSearchRef.current) {
                    userSearchRef.current.focus();
                }
            }, 100);
        }
    }, [firmId]);

    useEffect(() => {
        const fetchAccounts = async () => {
            if (!firmId || firmId === 'all') return;
            try {
                const response = await getAccountsDropdown(firmId);
                setAccounts(response.data || response || []);
            } catch (error) {
                console.error("Error fetching accounts:", error);
            }
        };
        fetchAccounts();
    }, [firmId]);

    useEffect(() => {
        if (accounts.length > 0) {
            setFormData(prev => {
                const updates = {};
                const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
                if (cashAcc) updates.dep_cash_acc_id = cashAcc.acc_id;

                const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
                if (bankAcc) updates.dep_bank_acc_id = bankAcc.acc_id;

                const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
                if (onlineAcc) updates.dep_online_acc_id = onlineAcc.acc_id;

                const cardAcc = accounts.find(a =>
                    a.acc_name.toLowerCase().includes("card") ||
                    a.acc_name.toLowerCase().includes("pos")
                );
                if (cardAcc) updates.dep_card_acc_id = cardAcc.acc_id;

                return { ...prev, ...updates };
            });
        }
    }, [accounts]);

    const handleUserSearch = async (val) => {
        setUserSearch(val);
        if (val.length > 1) {
            try {
                const res = await getUsers(firmId, val);
                setSearchResults(res.data || []);
                setActiveResultIndex(-1);
            } catch (err) {
                console.error(err);
            }
        } else {
            setSearchResults([]);
            setActiveResultIndex(-1);
        }
    };

    const handleKeyDown = (e) => {
        if (searchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveResultIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveResultIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeResultIndex >= 0 && activeResultIndex < searchResults.length) {
                handleSelectUser(searchResults[activeResultIndex]);
            }
        }
    };

    const fetchUserLoans = async (user, firmOverride) => {
        setLoadingList(true);
        setUserLoans([]);
        setLoanNo('');
        setLoanInfo(null);
        setLoanError('');
        try {
            const response = await getGirvisDropdown(user.user_id, {
                firmId: firmOverride || firmId || user.user_firm_id || undefined
            });
            const data = Array.isArray(response) ? response : (response.data || []);
            setUserLoans(data);
            if (data.length === 0) {
                setLoanError('No active loan found for this user.');
            }
        } catch (err) {
            console.error(err);
            setLoanError('Failed to load user loans.');
        } finally {
            setLoadingList(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUserLocal(user);
        setUserSearch(`${user.user_first_name} ${user.user_last_name} (${user.user_mobile_no})`);
        setSearchResults([]);
        if (user.user_firm_id) setFirmId(user.user_firm_id);
        fetchUserLoans(user, user.user_firm_id);
        setTimeout(() => {
            if (loanNoRef.current) {
                loanNoRef.current.focus();
            }
        }, 100);
    };

    const handleLoanSelect = async (girvId, shouldFocus = true) => {
        setLoanNo(girvId);
        if (!girvId) {
            setLoanInfo(null);
            setLoanError('');
            return;
        }

        setChecking(true);
        try {
            const res = await getGirviById(girvId);
            const data = res.data || res;

            if (data && String(data.girv_user_id) === String(selectedUser?.user_id)) {
                const summary = getLoanPendingSummary(data);

                setLoanInfo({
                    ...summary,
                    status: data.girv_status || 'ACTIVE',
                    startDate: data.girv_start_date,
                    girv_id: data.girv_id,
                    girv_firm_id: data.girv_firm_id,
                    girv_user_id: data.girv_user_id,
                });
                setFormData(prev => ({
                    ...prev,
                    dep_prin_amt: '',
                    dep_int_amt: summary.pendingInterest > 0 ? summary.pendingInterest.toFixed(2) : '',
                    dep_disc_amt: '',
                    dep_extra_amt: '',
                    dep_payable_amt: summary.pendingInterest > 0 ? summary.pendingInterest.toFixed(2) : '0.00',
                    dep_cash_amt: summary.pendingInterest > 0 ? summary.pendingInterest.toFixed(2) : '',
                    dep_bank_amt: '',
                    dep_online_amt: '',
                    dep_card_amt: '',
                }));
                setLoanError('');

                if (shouldFocus) {
                    setTimeout(() => {
                        if (totalAmountRef.current) {
                            totalAmountRef.current.focus();
                            totalAmountRef.current.select();
                        }
                    }, 100);
                }
            } else {
                setLoanInfo(null);
                setLoanError(data ? 'This Loan No belongs to another user.' : 'Loan No not found.');
            }
        } catch (err) {
            setLoanInfo(null);
            setLoanError('Loan No not found.');
        } finally {
            setChecking(false);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        let finalValue = value;
        if (id.includes('_amt') || id === 'dep_prin_amt' || id === 'dep_int_amt' || id === 'dep_disc_amt' || id === 'dep_extra_amt' || id === 'dep_payable_amt') {
            finalValue = value.replace(/[^0-9.]/g, '');
        }

        setFormData(prev => {
            const updated = { ...prev, [id]: finalValue };

            const prinAmt = parseFloat(id === 'dep_prin_amt' ? finalValue : prev.dep_prin_amt) || 0;
            const intAmt = parseFloat(id === 'dep_int_amt' ? finalValue : prev.dep_int_amt) || 0;
            const discAmt = parseFloat(id === 'dep_disc_amt' ? finalValue : prev.dep_disc_amt) || 0;
            const extraAmt = parseFloat(id === 'dep_extra_amt' ? finalValue : prev.dep_extra_amt) || 0;
            const autoTotal = Math.max(0, prinAmt + intAmt + extraAmt - discAmt);

            if (['dep_prin_amt', 'dep_int_amt', 'dep_disc_amt', 'dep_extra_amt'].includes(id)) {
                updated.dep_payable_amt = autoTotal.toString();

                const bankAmt = parseFloat(prev.dep_bank_amt) || 0;
                const onlineAmt = parseFloat(prev.dep_online_amt) || 0;
                const cardAmt = parseFloat(prev.dep_card_amt) || 0;
                const otherPayments = bankAmt + onlineAmt + cardAmt;
                const remainder = Math.max(0, autoTotal - otherPayments);
                updated.dep_cash_amt = remainder > 0 ? remainder.toString() : '';
            }

            return updated;
        });
    };

    const totalDistributed = useMemo(() => {
        return (parseFloat(formData.dep_cash_amt) || 0) +
            (parseFloat(formData.dep_bank_amt) || 0) +
            (parseFloat(formData.dep_online_amt) || 0) +
            (parseFloat(formData.dep_card_amt) || 0);
    }, [formData.dep_cash_amt, formData.dep_bank_amt, formData.dep_online_amt, formData.dep_card_amt]);

    const payableAmt = parseFloat(formData.dep_payable_amt) || 0;

    const isOverLimit = useMemo(() => {
        if (!loanInfo) return false;
        return payableAmt > loanInfo.pending + 0.01;
    }, [payableAmt, loanInfo]);

    const paymentMismatch = payableAmt > 0 && Math.abs(payableAmt - totalDistributed) > 0.01;

    const handleSubmit = async (action = 'submit') => {
        if (!loanInfo || loading) return;

        if (payableAmt <= 0) {
            toast.error("Total Amount Rec. must be greater than 0");
            return;
        }

        if (payableAmt > loanInfo.pending + 0.01) {
            toast.error(`Maximum payable amount is ${loanInfo.pending}`);
            return;
        }

        if (Math.abs(payableAmt - totalDistributed) > 0.01) {
            toast.error(`Payment modes (${totalDistributed.toFixed(2)}) must equal Total Amount Rec. (${payableAmt.toFixed(2)})`);
            return;
        }

        setLoading(true);
        setActiveAction(action);
        try {
            const payload = {
                ...formData,
                dep_girv_id: loanInfo.girv_id,
                dep_firm_id: loanInfo.girv_firm_id || firmId,
                dep_user_id: loanInfo.girv_user_id || selectedUser.user_id,
            };
            await addDeposit(payload);
            toast.success("Loan deposit submitted successfully");

            if (action === 'submit') {
                // Submit only — stay on form, no redirect
                resetForm();
                return;
            }

            // Submit & Go to Info
            if (selectedUser) {
                dispatch(setSelectedUser(selectedUser));
            }
            const girvId = loanInfo.girv_id;
            resetForm();
            onClose();
            try {
                const res = await getGirviById(girvId);
                const fullData = res.data || res;
                navigate('/user/home/loan-info', { state: { loan: fullData } });
            } catch {
                navigate('/user/home/loan-info', { state: { loan: { girv_id: girvId } } });
            }
        } catch (err) {
            toast.error(err.message || err.error || "Failed to process loan deposit");
        } finally {
            setLoading(false);
            setActiveAction(null);
        }
    };

    return (
        <CommonModal
            show={show}
            onHide={onClose}
            title="Loan Collection"
            size="lg"
        >
            <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSubmit('submit'); }} className="p-3">
                <div className="row g-3 bg-red pb-4">
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Firm Name</label>
                        <select className="form-select border-dark" value={firmId} onChange={(e) => setFirmId(e.target.value)}>
                            <option value="">Select Firm</option>
                            {firms.map(f => <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>)}
                        </select>
                    </div>

                    <div className="col-md-4 position-relative">
                        <label className="form-label fw-bold small text-muted mb-1">User Name / Mobile / ID</label>
                        <input
                            type="text"
                            ref={userSearchRef}
                            className="form-control border-dark"
                            placeholder="Search user..."
                            value={userSearch}
                            onChange={(e) => handleUserSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!firmId}
                        />
                        {searchResults.length > 0 && (
                            <div className="list-group position-absolute w-100 shadow-lg z-3 mt-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {searchResults.map((user, index) => (
                                    <button
                                        key={user.user_id}
                                        type="button"
                                        className={`list-group-item list-group-item-action py-2 ${index === activeResultIndex ? 'active' : ''}`}
                                        onClick={() => handleSelectUser(user)}
                                        onMouseEnter={() => setActiveResultIndex(index)}
                                    >
                                        <div className={index === activeResultIndex ? 'text-white fw-bold' : 'fw-bold'}>{user.user_first_name} {user.user_last_name}</div>
                                        <div className={`small ${index === activeResultIndex ? 'text-white-50' : 'text-muted'}`}>{user.user_unique_code ? `${user.user_unique_code} | ` : ''}{user.user_mobile_no} | ID: {user.user_id}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Loan No</label>
                        <div className="input-group">
                            <span className="input-group-text border-dark bg-light fw-bold text-muted">L</span>
                            <select
                                ref={loanNoRef}
                                className="form-select border-dark"
                                value={loanNo}
                                onChange={(e) => handleLoanSelect(e.target.value)}
                                disabled={!selectedUser || loadingList}
                            >
                                <option value="">
                                    {loadingList
                                        ? 'Loading loans...'
                                        : selectedUser
                                            ? (userLoans.length ? 'Select Loan No' : 'No loan found')
                                            : 'Select user first'}
                                </option>
                                {userLoans.map((loan) => (
                                    <option key={loan.girv_id} value={loan.girv_id}>
                                        {loan.girv_unique_code || loan.girv_loan_no || `Loan #${loan.girv_id}`} — ₹{Number(loan.girv_prin_amt || 0).toLocaleString()} ({loan.girv_status || 'ACTIVE'})
                                    </option>
                                ))}
                            </select>
                            {(checking || loadingList) && (
                                <span className="input-group-text bg-white border-dark">
                                    <div className="spinner-border spinner-border-sm text-primary"></div>
                                </span>
                            )}
                        </div>
                        {loanError && <div className="text-danger extra-small fw-bold mt-1">{loanError}</div>}
                    </div>

                    {loanInfo && (
                        <div className="col-12">
                            <div className="p-2 bg-light border rounded d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div><span className="text-muted small">Principal:</span> <span className="fw-bold text-primary">₹{(loanInfo.pendingPrincipal ?? loanInfo.principal).toLocaleString()}</span></div>
                                <div><span className="text-muted small">Pending Interest:</span> <span className="fw-bold text-warning">₹{(loanInfo.pendingInterest || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                <div><span className="text-muted small">Pending Amt:</span> <span className="fw-bold text-danger">₹{(loanInfo.pending || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                <div><span className="text-muted small">Deposits:</span> <span className="fw-bold text-success">₹{(loanInfo.totalDeposits || 0).toLocaleString()}</span></div>
                                <div><span className="text-muted small">Status:</span> <span className="fw-bold text-dark">{loanInfo.status}</span></div>
                            </div>
                        </div>
                    )}

                    {/* Row 1 - 3 fields */}
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Transaction Date</label>
                        <input
                            type="text"
                            ref={transDateRef}
                            className="form-control border-dark"
                            defaultValue={moment(formData.dep_trans_date).format('DD-MM-YYYY')}
                            disabled={!loanInfo}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Principal Amount Rec.</label>
                        <input
                            type="text"
                            ref={totalAmountRef}
                            id="dep_prin_amt"
                            className="form-control border-dark text-center"
                            placeholder="0"
                            value={formData.dep_prin_amt}
                            onChange={handleInputChange}
                            disabled={!loanInfo}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Interest Amount Rec.</label>
                        <input
                            type="text"
                            id="dep_int_amt"
                            className="form-control border-dark text-center"
                            placeholder="0"
                            value={formData.dep_int_amt}
                            onChange={handleInputChange}
                            disabled={!loanInfo}
                        />
                    </div>

                    {/* Row 2 - 3 fields */}
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Discount Amount</label>
                        <input
                            type="text"
                            id="dep_disc_amt"
                            className="form-control border-dark text-center"
                            placeholder="0"
                            value={formData.dep_disc_amt}
                            onChange={handleInputChange}
                            disabled={!loanInfo}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Extra Amount</label>
                        <input
                            type="text"
                            id="dep_extra_amt"
                            className="form-control border-dark text-center"
                            placeholder="0"
                            value={formData.dep_extra_amt}
                            onChange={handleInputChange}
                            disabled={!loanInfo}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Total Amount Rec.</label>
                        <input
                            type="text"
                            id="dep_payable_amt"
                            className={`form-control border-dark text-center bg-light fw-bold ${isOverLimit ? 'text-danger' : 'text-primary'}`}
                            value={formData.dep_payable_amt}
                            readOnly
                            disabled={!loanInfo}
                        />
                        {isOverLimit && (
                            <div className="text-danger extra-small fw-bold mt-1">
                                Max: ₹{loanInfo?.pending.toLocaleString()}
                            </div>
                        )}
                        {paymentMismatch && (
                            <div className="text-danger extra-small fw-bold mt-1">
                                Payment must equal total
                            </div>
                        )}
                    </div>
                </div>
                <div className="row g-3 bg-green pt-2 border-top ">
                    <div className="col-12 mt-0">
                        <h6 className="fw-bold text-uppercase small text-brown mb-2">Payment Distribution</h6>
                        <div className="row g-2">
                            <div className="col-md-4">
                                <select className="form-select form-select-sm border-dark" id="dep_cash_acc_id" value={formData.dep_cash_acc_id} onChange={handleInputChange} disabled={!loanInfo}>
                                    <option value="">Cash Account</option>
                                    {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="dep_cash_info" placeholder="Cash Information" value={formData.dep_cash_info} onChange={handleInputChange} disabled={!loanInfo} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="dep_cash_amt" placeholder="Cash Amount" value={formData.dep_cash_amt} onChange={handleInputChange} disabled={!loanInfo} />
                            </div>

                            <div className="col-md-4">
                                <select className="form-select form-select-sm border-dark" id="dep_bank_acc_id" value={formData.dep_bank_acc_id} onChange={handleInputChange} disabled={!loanInfo}>
                                    <option value="">Bank Account</option>
                                    {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="dep_bank_info" placeholder="Bank Information" value={formData.dep_bank_info} onChange={handleInputChange} disabled={!loanInfo} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="dep_bank_amt" placeholder="Bank Amount" value={formData.dep_bank_amt} onChange={handleInputChange} disabled={!loanInfo} />
                            </div>

                            <div className="col-md-4">
                                <select className="form-select form-select-sm border-dark" id="dep_online_acc_id" value={formData.dep_online_acc_id} onChange={handleInputChange} disabled={!loanInfo}>
                                    <option value="">Online Account</option>
                                    {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="dep_online_info" placeholder="Online Information" value={formData.dep_online_info} onChange={handleInputChange} disabled={!loanInfo} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="dep_online_amt" placeholder="Online Amount" value={formData.dep_online_amt} onChange={handleInputChange} disabled={!loanInfo} />
                            </div>

                            <div className="col-md-4">
                                <select className="form-select form-select-sm border-dark" id="dep_card_acc_id" value={formData.dep_card_acc_id} onChange={handleInputChange} disabled={!loanInfo}>
                                    <option value="">Card Account</option>
                                    {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="dep_card_info" placeholder="Card Information" value={formData.dep_card_info} onChange={handleInputChange} disabled={!loanInfo} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="dep_card_amt" placeholder="Card Amount" value={formData.dep_card_amt} onChange={handleInputChange} disabled={!loanInfo} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-12">
                        <label className="form-label fw-bold small text-muted mb-1">Other Information</label>
                        <textarea
                            className="form-control form-control-sm border-dark"
                            id="dep_other_info"
                            rows="1"
                            value={formData.dep_other_info}
                            onChange={handleInputChange}
                            disabled={!loanInfo}
                            placeholder="Enter any other information..."
                        ></textarea>
                    </div>

                    <div className="col-12 mt-3 mb-3">
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            <button
                                type="button"
                                className={`btn ${isOverLimit ? 'btn-danger' : 'btn-primary'} px-4 py-2 fw-bold d-inline-flex align-items-center gap-1`}
                                disabled={loading || !loanInfo || payableAmt <= 0 || isOverLimit || paymentMismatch}
                                onClick={() => handleSubmit('submit')}
                            >
                                {loading && activeAction === 'submit' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle"></i>
                                        Submit
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className={`btn ${isOverLimit ? 'btn-outline-danger' : 'btn-success'} px-4 py-2 fw-bold d-inline-flex align-items-center gap-1`}
                                disabled={loading || !loanInfo || payableAmt <= 0 || isOverLimit || paymentMismatch}
                                onClick={() => handleSubmit('goInfo')}
                            >
                                {loading && activeAction === 'goInfo' ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-box-arrow-up-right"></i>
                                        Submit & Go to Info
                                    </>
                                )}
                            </button>
                        </div>
                        {payableAmt > 0 && (
                            <div className="text-center text-muted small mt-2">
                                Total Amount Rec.: ₹{payableAmt.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </CommonModal>
    );
};

export default LoanCollectionModal;
