import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import useFormNavigation from '../../hooks/useFormNavigation';
import CommonModal from '../common/CommonModal';
import { getUsers } from '../../api/userApi';
import { getFinanceDetails, createFinancePayment } from '../../api/financeApi';
import { getAccountsDropdown } from '../../api/accountApi';

const FinanceCollectionModal = ({ show, onClose, firms = [], selectedFirmId }) => {
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [firmId, setFirmId] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [financeNo, setFinanceNo] = useState('');
    const [financeInfo, setFinanceInfo] = useState(null);
    const [financeError, setFinanceError] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [activeResultIndex, setActiveResultIndex] = useState(-1);
    const transDateRef = useRef(null);
    const financeNoRef = useRef(null);
    const totalAmountRef = useRef(null);
    const userSearchRef = useRef(null);
    const formRef = useRef(null);

    useFormNavigation(formRef, true);

    const [formData, setFormData] = useState({
        fm_trans_date: new Date().toISOString().split('T')[0],
        fm_cash_amt: 0,
        fm_bank_amt: 0,
        fm_online_amt: 0,
        fm_card_amt: 0,
        fm_cash_acc_id: '',
        fm_bank_acc_id: '',
        fm_online_acc_id: '',
        fm_card_acc_id: '',
        fm_cash_info: '',
        fm_bank_info: '',
        fm_online_info: '',
        fm_card_info: '',
        fm_pay_info: '',
        fm_other_info: ''
    });

    const resetForm = () => {
        setFinanceNo('');
        setFinanceInfo(null);
        setFinanceError('');
        setUserSearch('');
        setSelectedUser(null);
        setFormData({
            fm_trans_date: new Date().toISOString().split('T')[0],
            fm_cash_amt: 0,
            fm_bank_amt: 0,
            fm_online_amt: 0,
            fm_card_amt: 0,
            fm_cash_acc_id: '',
            fm_bank_acc_id: '',
            fm_online_acc_id: '',
            fm_card_acc_id: '',
            fm_cash_info: '',
            fm_bank_info: '',
            fm_online_info: '',
            fm_card_info: '',
            fm_pay_info: '',
            fm_other_info: ''
        });
        if (transDateRef.current) {
            const today = moment().format('DD-MM-YYYY');
            $(transDateRef.current).val(today);
        }
    };

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
                setFormData(prev => ({ ...prev, fm_trans_date: start.format('YYYY-MM-DD') }));
            });
        }

        if (show) {
            resetForm();
            if (selectedFirmId && selectedFirmId !== 'all') {
                setFirmId(selectedFirmId);
            } else if (firms.length === 1) {
                setFirmId(firms[0].firm_id);
            }
            // Reset state
            setSelectedUser(null);
            setUserSearch('');
            setSearchResults([]);
            setFinanceNo('');
            setFinanceInfo(null);

            // Focus first element (Firm Name) when modal opens
            setTimeout(() => {
                const firstEl = formRef.current?.querySelector('select, input');
                if (firstEl) firstEl.focus();
            }, 300);
        }
    }, [show, selectedFirmId, firms]);

    // Focus User Search after Firm is selected
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

    // Auto-select accounts based on name (matching PaymentForm logic)
    useEffect(() => {
        if (accounts.length > 0) {
            setFormData(prev => {
                const updates = {};
                const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
                if (cashAcc) updates.fm_cash_acc_id = cashAcc.acc_id;

                const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
                if (bankAcc) updates.fm_bank_acc_id = bankAcc.acc_id;

                const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
                if (onlineAcc) updates.fm_online_acc_id = onlineAcc.acc_id;

                const cardAcc = accounts.find(a =>
                    a.acc_name.toLowerCase().includes("card") ||
                    a.acc_name.toLowerCase().includes("pos")
                );
                if (cardAcc) updates.fm_card_acc_id = cardAcc.acc_id;

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

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setUserSearch(`${user.user_first_name} ${user.user_last_name} (${user.user_mobile_no})`);
        setSearchResults([]);
        // Focus Finance No after selecting user
        setTimeout(() => {
            if (financeNoRef.current) {
                financeNoRef.current.focus();
            }
        }, 100);
    };

    const handleFinanceNoKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (financeInfo) {
                // Already found, just move focus
                if (totalAmountRef.current) {
                    totalAmountRef.current.focus();
                    totalAmountRef.current.select();
                }
            } else {
                // Try to find it now
                handleFinanceNoChange(financeNo, true);
            }
        }
    };

    const handleFinanceNoChange = async (rawVal, shouldFocus = false) => {
        const val = rawVal.replace(/\D/g, ''); // Keep only digits
        setFinanceNo(val);
        const cleanFinId = val.trim();
        if (cleanFinId.length >= 1) {
            setChecking(true);
            try {
                const res = await getFinanceDetails(cleanFinId);
                const data = res.data || res;

                if (data && data.fin_user_id === selectedUser.user_id) {
                    const trans = data.finance_trans || [];
                    const paid = trans.reduce((acc, curr) => acc + (parseFloat(curr.ft_paid_amt) || 0), 0);
                    const pending = trans.reduce((acc, curr) => acc + (parseFloat(curr.ft_pending_amt) || 0), 0);
                    const pendingEmi = trans.filter(t => t.ft_emi_status === 'PENDING').length;
                    const partialEmi = trans.filter(t => t.ft_emi_status === 'PARTIAL').length;

                    setFinanceInfo({ paid, pending, pendingEmi, partialEmi, fin_id: data.fin_id });
                    setFinanceError('');

                    // Focus Total Amount only if requested (via Enter key)
                    if (shouldFocus) {
                        setTimeout(() => {
                            if (totalAmountRef.current) {
                                totalAmountRef.current.focus();
                                totalAmountRef.current.select();
                            }
                        }, 100);
                    }
                } else {
                    setFinanceInfo(null);
                    setFinanceError(data ? 'This Finance No belongs to another user.' : 'Finance No not found.');
                }
            } catch (err) {
                setFinanceInfo(null);
                setFinanceError('Finance No not found.');
            } finally {
                setChecking(false);
            }
        } else {
            setFinanceInfo(null);
            setFinanceError('');
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        let finalValue = value;
        if (id.includes('_amt')) {
            finalValue = value.replace(/[^0-9.]/g, '');
        }
        setFormData(prev => ({ ...prev, [id]: finalValue }));
    };

    const handleTotalChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        // Auto-distribute to cash by default
        setFormData(prev => ({
            ...prev,
            fm_cash_amt: val,
            fm_bank_amt: 0,
            fm_online_amt: 0,
            fm_card_amt: 0
        }));
    };

    const totalDistributed = useMemo(() => {
        return (parseFloat(formData.fm_cash_amt) || 0) +
            (parseFloat(formData.fm_bank_amt) || 0) +
            (parseFloat(formData.fm_online_amt) || 0) +
            (parseFloat(formData.fm_card_amt) || 0);
    }, [formData.fm_cash_amt, formData.fm_bank_amt, formData.fm_online_amt, formData.fm_card_amt]);

    const isOverLimit = useMemo(() => {
        if (!financeInfo) return false;
        return totalDistributed > financeInfo.pending + 0.01;
    }, [totalDistributed, financeInfo]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!financeInfo) return;

        if (totalDistributed <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        if (totalDistributed > financeInfo.pending + 0.01) {
            toast.error(`Maximum payable amount is ${financeInfo.pending}`);
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                fm_trans_amt: totalDistributed,
                fm_fin_id: financeInfo.fin_id,
                fm_trans_type: 'PAID'
            };
            await createFinancePayment(payload);
            toast.success("Payment processed successfully");
            resetForm();
            onClose();
        } catch (err) {
            toast.error(err.message || "Failed to process payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CommonModal
            show={show}
            onHide={onClose}
            title="Finance Collection"
            size="lg"
        >
            <form ref={formRef} onSubmit={handleSubmit} className="p-3">
                <div className="row g-3 bg-red pb-4">
                    {/* Firm Select */}
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Firm Name</label>
                        <select className="form-select border-dark" value={firmId} onChange={(e) => setFirmId(e.target.value)}>
                            <option value="">Select Firm</option>
                            {firms.map(f => <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>)}
                        </select>
                    </div>

                    {/* User Search */}
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
                                        className={`list-group-item list-group-item-action py-2 ${index === activeResultIndex ? 'active' : ''}`}
                                        onClick={() => handleSelectUser(user)}
                                        onMouseEnter={() => setActiveResultIndex(index)}
                                    >
                                        <div className={index === activeResultIndex ? 'text-white fw-bold' : 'fw-bold'}>{user.user_first_name} {user.user_last_name}</div>
                                        <div className={`small ${index === activeResultIndex ? 'text-white-50' : 'text-muted'}`}>{user.user_mobile_no} | ID: {user.user_id}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Finance No */}
                    <div className="col-md-4">
                        <label className="form-label fw-bold small text-muted mb-1">Finance No</label>
                        <div className="input-group">
                            <span className="input-group-text border-dark bg-light fw-bold text-muted">F</span>
                            <input
                                type="text"
                                ref={financeNoRef}
                                className="form-control border-dark"
                                placeholder="Finance No"
                                value={financeNo}
                                onChange={(e) => handleFinanceNoChange(e.target.value, false)}
                                onKeyDown={handleFinanceNoKeyDown}
                                disabled={!selectedUser}
                            />
                            {checking && <span className="input-group-text bg-white border-dark"><div className="spinner-border spinner-border-sm text-primary"></div></span>}
                        </div>
                        {financeError && <div className="text-danger extra-small fw-bold mt-1">{financeError}</div>}
                    </div>

                    {/* Total Amount */}
                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-muted mb-1 d-flex justify-content-between">
                            Total Amount
                            {isOverLimit && (
                                <span className="text-danger extra-small fw-bold animate__animated animate__shakeX">
                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                    Maximum payable amount is : {financeInfo?.pending.toLocaleString()}
                                </span>
                            )}
                        </label>
                        <input
                            type="text"
                            ref={totalAmountRef}
                            className={`form-control border-dark fw-bold ${isOverLimit ? 'text-danger' : 'text-primary'}`}
                            placeholder="Enter Total Amount"
                            value={totalDistributed || ''}
                            onChange={handleTotalChange}
                            disabled={!financeInfo}
                        />
                    </div>

                    {/* Transaction Date */}
                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-muted mb-1">Transaction Date</label>
                        <input
                            type="text"
                            ref={transDateRef}
                            className="form-control border-dark"
                            defaultValue={moment(formData.fm_trans_date).format('DD-MM-YYYY')}
                            disabled={!financeInfo}
                        />
                    </div>

                    {/* Finance Info Display */}
                    {financeInfo && (
                        <div className="col-12">
                            <div className="p-2 bg-light border rounded d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div><span className="text-muted small">Paid Amt:</span> <span className="fw-bold text-success">₹{financeInfo.paid.toLocaleString()}</span></div>
                                <div><span className="text-muted small">Pending Amt:</span> <span className="fw-bold text-danger">₹{financeInfo.pending.toLocaleString()}</span></div>
                                <div><span className="text-muted small">Pending EMI:</span> <span className="fw-bold text-dark">{financeInfo.pendingEmi}</span></div>
                                <div><span className="text-muted small">Partial EMI:</span> <span className="fw-bold text-warning">{financeInfo.partialEmi}</span></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="row g-3 bg-green pt-2 border-top ">
                    {/* Payment Distribution */}
                    <div className="col-12 mt-0">
                        <h6 className="fw-bold text-uppercase small text-brown mb-2">Payment Distribution</h6>
                        <div className="row g-2">
                            {/* Cash */}
                            <div className="col-md-4">
                                <select className="form-select form-select-sm border-dark" id="fm_cash_acc_id" value={formData.fm_cash_acc_id} onChange={handleInputChange} disabled={!financeInfo}>
                                    <option value="">Cash Account</option>
                                    {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="fm_cash_info" placeholder="Cash Information" value={formData.fm_cash_info} onChange={handleInputChange} disabled={!financeInfo} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="fm_cash_amt" placeholder="Cash Amount" value={formData.fm_cash_amt} onChange={handleInputChange} disabled={!financeInfo} />
                            </div>

                            {/* Bank */}
                            <div className="col-md-4">
                                <select className="form-select form-select-sm border-dark" id="fm_bank_acc_id" value={formData.fm_bank_acc_id} onChange={handleInputChange} disabled={!financeInfo}>
                                    <option value="">Bank Account</option>
                                    {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="fm_bank_info" placeholder="Bank Information" value={formData.fm_bank_info} onChange={handleInputChange} disabled={!financeInfo} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="fm_bank_amt" placeholder="Bank Amount" value={formData.fm_bank_amt} onChange={handleInputChange} disabled={!financeInfo} />
                            </div>

                            {/* Online */}
                            <div className="col-md-4">
                                <select className="form-select form-select-sm border-dark" id="fm_online_acc_id" value={formData.fm_online_acc_id} onChange={handleInputChange} disabled={!financeInfo}>
                                    <option value="">Online Account</option>
                                    {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="fm_online_info" placeholder="Online Information" value={formData.fm_online_info} onChange={handleInputChange} disabled={!financeInfo} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="fm_online_amt" placeholder="Online Amount" value={formData.fm_online_amt} onChange={handleInputChange} disabled={!financeInfo} />
                            </div>

                            {/* Card */}
                            <div className="col-md-4">
                                <select className="form-select form-select-sm border-dark" id="fm_card_acc_id" value={formData.fm_card_acc_id} onChange={handleInputChange} disabled={!financeInfo}>
                                    <option value="">Card Account</option>
                                    {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="fm_card_info" placeholder="Card Information" value={formData.fm_card_info} onChange={handleInputChange} disabled={!financeInfo} />
                            </div>
                            <div className="col-md-4">
                                <input type="text" className="form-control form-control-sm border-dark" id="fm_card_amt" placeholder="Card Amount" value={formData.fm_card_amt} onChange={handleInputChange} disabled={!financeInfo} />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 text-center mt-3 mb-3">
                        <button
                            type="submit"
                            className={`btn ${isOverLimit ? 'btn-danger' : 'btn-primary'} px-5 py-2 fw-bold`}
                            disabled={loading || !financeInfo || totalDistributed <= 0 || isOverLimit}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Checking...
                                </>
                            ) : `Submit Payment - ₹${totalDistributed.toLocaleString()}`}
                        </button>
                    </div>
                </div>
            </form>
        </CommonModal>
    );
};

export default FinanceCollectionModal;
