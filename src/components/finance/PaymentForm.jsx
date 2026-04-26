import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { getAccountsDropdown } from '../../api/accountApi'
import { createFinancePayment } from '../../api/financeApi'
import { toast } from 'react-toastify'

const PaymentForm = ({ initialType = 'PAID', finance, onSuccess }) => {
    const { selectedFirm } = useSelector((state) => state.firm);
    const [transType, setTransType] = useState(initialType);
    const [accounts, setAccounts] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fm_trans_amt: 0,
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

    useEffect(() => {
        setTransType(initialType);
    }, [initialType]);

    useEffect(() => {
        const fetchAccounts = async () => {
            const firmId = finance?.fin_firm_id || selectedFirm?.firm_id;
            if (!firmId || firmId === 'all') return;

            try {
                const response = await getAccountsDropdown(firmId);
                const accData = response.data || response || [];
                setAccounts(Array.isArray(accData) ? accData : []);
            } catch (error) {
                console.error("Error fetching accounts:", error);
                toast.error("Failed to load accounts");
            }
        };

        fetchAccounts();
    }, [finance?.fin_firm_id, selectedFirm?.firm_id]);

    useEffect(() => {
        if (accounts.length > 0) {
            setFormData(prev => {
                const updates = {};
                if (!prev.fm_cash_acc_id) {
                    const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
                    if (cashAcc) updates.fm_cash_acc_id = cashAcc.acc_id;
                }
                if (!prev.fm_bank_acc_id) {
                    const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
                    if (bankAcc) updates.fm_bank_acc_id = bankAcc.acc_id;
                }
                if (!prev.fm_online_acc_id) {
                    const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
                    if (onlineAcc) updates.fm_online_acc_id = onlineAcc.acc_id;
                }
                if (!prev.fm_card_acc_id) {
                    const cardAcc = accounts.find(a =>
                        a.acc_name.toLowerCase().includes("card") ||
                        a.acc_name.toLowerCase().includes("pos")
                    );
                    if (cardAcc) updates.fm_card_acc_id = cardAcc.acc_id;
                }
                return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
            });
        }
    }, [accounts]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleAmountChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, ''); // Basic sanitization
        setFormData(prev => ({
            ...prev,
            fm_trans_amt: val, // Keep as string for text input
            fm_cash_amt: val,
            fm_bank_amt: '0',
            fm_online_amt: '0',
            fm_card_amt: '0'
        }));
    };

    const totals = useMemo(() => {
        if (!finance?.finance_trans) return { pending: 0, paid: 0 };
        return finance.finance_trans.reduce((acc, emi) => {
            acc.pending += (parseFloat(emi.ft_pending_amt) || 0);
            acc.paid += (parseFloat(emi.ft_paid_amt) || 0);
            return acc;
        }, { pending: 0, paid: 0 });
    }, [finance?.finance_trans]);

    const totalDistributed = useMemo(() => {
        return (parseFloat(formData.fm_cash_amt) || 0) +
            (parseFloat(formData.fm_bank_amt) || 0) +
            (parseFloat(formData.fm_online_amt) || 0) +
            (parseFloat(formData.fm_card_amt) || 0);
    }, [formData.fm_cash_amt, formData.fm_bank_amt, formData.fm_online_amt, formData.fm_card_amt]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const transAmt = parseFloat(formData.fm_trans_amt) || 0;
        if (transAmt <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        // Limit Validation
        if (transType === 'PAID' && transAmt > totals.pending + 0.01) {
            toast.error(`Maximum payable amount is ₹${totals.pending.toLocaleString()}`);
            return;
        }

        if (transType === 'ROLLBACK' && transAmt > totals.paid + 0.01) {
            toast.error(`Maximum rollback amount is ₹${totals.paid.toLocaleString()}`);
            return;
        }

        if (Math.abs(transAmt - totalDistributed) > 0.01) {
            const diff = Math.abs(transAmt - totalDistributed).toFixed(2);
            toast.error(`Payment distribution mismatch! The sum of individual payments (₹${totalDistributed.toLocaleString()}) must equal the Total Amount (₹${transAmt.toLocaleString()}). Difference: ₹${diff}`);
            return;
        }

        // Selected Account Validations
        if (parseFloat(formData.fm_cash_amt) > 0 && !formData.fm_cash_acc_id) {
            toast.warning("Please select a Cash Account for the cash payment.");
            return;
        }
        if (parseFloat(formData.fm_bank_amt) > 0 && !formData.fm_bank_acc_id) {
            toast.warning("Please select a Bank Account for the bank payment.");
            return;
        }
        if (parseFloat(formData.fm_online_amt) > 0 && !formData.fm_online_acc_id) {
            toast.warning("Please select an Online Account for the online payment.");
            return;
        }
        if (parseFloat(formData.fm_card_amt) > 0 && !formData.fm_card_acc_id) {
            toast.warning("Please select a Card Account for the card payment.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                fm_fin_id: finance.fin_id,
                fm_trans_type: transType
            };
            await createFinancePayment(payload);
            toast.success("Payment processed successfully");

            // Wait a bit so user can see toast before modal closes
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (error) {
            console.error("Error processing payment:", error);
            toast.error(error.message || "Failed to process payment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded">
            <div className="row g-3">
                <div className="col-md-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <label htmlFor="fm_trans_amt" className="form-label small fw-bold">Total Amount</label>
                        <span className="badge bg-light text-dark border extra-small mb-1">
                            {transType === 'PAID' ? `Max: ₹${totals.pending.toLocaleString()}` : `Max: ₹${totals.paid.toLocaleString()}`}
                        </span>
                    </div>
                    <input
                        type="text"
                        className="form-control"
                        id="fm_trans_amt"
                        placeholder="Enter Total Amount (e.g. 5000)"
                        value={formData.fm_trans_amt}
                        onChange={handleAmountChange}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <label htmlFor="fm_trans_type_main" className="form-label small fw-bold">Transaction Type</label>
                    <select
                        className="form-select"
                        id="fm_trans_type_main"
                        value={transType}
                        onChange={(e) => setTransType(e.target.value)}
                    >
                        <option value="PAID" disabled={totals.pending <= 0}>
                            PAID {totals.pending <= 0 ? '(No Pending Balance)' : ''}
                        </option>
                        <option value="ROLLBACK" disabled={totals.paid <= 0}>
                            ROLLBACK {totals.paid <= 0 ? '(No Paid Balance)' : ''}
                        </option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label htmlFor="fm_trans_date" className="form-label small fw-bold">Transaction Date</label>
                    <input
                        type="date"
                        className="form-control"
                        id="fm_trans_date"
                        value={formData.fm_trans_date}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="col-12">
                    <hr className="my-3" />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="text-muted fw-bold mb-0">Payment Distribution</h6>
                    </div>
                </div>

                {/* Cash Account */}
                <div className="col-md-4">
                    <select
                        className="form-select form-select-sm"
                        id="fm_cash_acc_id"
                        value={formData.fm_cash_acc_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Cash Account</option>
                        {accounts.map(acc => (
                            <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder='Other Information'
                        className="form-control form-control-sm"
                        id="fm_cash_info"
                        value={formData.fm_cash_info}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder='Enter Cash Payment Amount'
                        className="form-control form-control-sm"
                        id="fm_cash_amt"
                        value={formData.fm_cash_amt}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Bank Account */}
                <div className="col-md-4">
                    <select
                        className="form-select form-select-sm"
                        id="fm_bank_acc_id"
                        value={formData.fm_bank_acc_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Bank Account</option>
                        {accounts.map(acc => (
                            <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder='Other Information'
                        className="form-control form-control-sm"
                        id="fm_bank_info"
                        value={formData.fm_bank_info}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder='Enter Bank Payment Amount'
                        className="form-control form-control-sm"
                        id="fm_bank_amt"
                        value={formData.fm_bank_amt}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Online Account */}
                <div className="col-md-4">
                    <select
                        className="form-select form-select-sm"
                        id="fm_online_acc_id"
                        value={formData.fm_online_acc_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Online Account</option>
                        {accounts.map(acc => (
                            <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder='Other Information'
                        className="form-control form-control-sm"
                        id="fm_online_info"
                        value={formData.fm_online_info}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder='Enter Online Payment Amount'
                        className="form-control form-control-sm"
                        id="fm_online_amt"
                        value={formData.fm_online_amt}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Card Account */}
                <div className="col-md-4">
                    <select
                        className="form-select form-select-sm"
                        id="fm_card_acc_id"
                        value={formData.fm_card_acc_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Card Account</option>
                        {accounts.map(acc => (
                            <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder='Other Information'
                        className="form-control form-control-sm"
                        id="fm_card_info"
                        value={formData.fm_card_info}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder='Enter Card Payment Amount'
                        className="form-control form-control-sm"
                        id="fm_card_amt"
                        value={formData.fm_card_amt}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="col-md-12 text-center mt-4">
                    <button
                        type="submit"
                        className="btn btn-primary px-5 py-2 fw-bold"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                            </>
                        ) : (
                            transType === 'PAID' ? 'Submit Payment' : 'Confirm Rollback'
                        )}
                    </button>
                    <p className="small text-muted mt-2">All transactions are logged for audit purposes.</p>
                </div>
            </div>
        </form>
    )
}

export default PaymentForm