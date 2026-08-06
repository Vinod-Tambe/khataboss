import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { getAccountsDropdown } from '../../api/accountApi'
import { createFinancePayment } from '../../api/financeApi'
import { toast } from 'react-hot-toast'

const PaymentForm = ({ initialType = 'PAID', finance, onSuccess }) => {
    const { selectedFirm } = useSelector((state) => state.firm);
    const [transType, setTransType] = useState(initialType);
    const [accounts, setAccounts] = useState([]);
    const [submitting, setSubmitting] = useState(false);

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
        // Only sanitize if it's an amount field
        let finalValue = value;
        if (id.includes('_amt')) {
            finalValue = value.replace(/[^0-9.]/g, '');
        }
        setFormData(prev => ({
            ...prev,
            [id]: finalValue
        }));
    };

    const handleTotalChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        setFormData(prev => ({
            ...prev,
            fm_cash_amt: val,
            fm_bank_amt: 0,
            fm_online_amt: 0,
            fm_card_amt: 0
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

    useEffect(() => {
        if (transType === 'CLOSE' && totals.pending > 0) {
            setFormData(prev => ({
                ...prev,
                fm_cash_amt: totals.pending,
                fm_bank_amt: 0,
                fm_online_amt: 0,
                fm_card_amt: 0
            }));
        }
    }, [transType, totals.pending]);

    const totalDistributed = useMemo(() => {
        return (parseFloat(formData.fm_cash_amt) || 0) +
            (parseFloat(formData.fm_bank_amt) || 0) +
            (parseFloat(formData.fm_online_amt) || 0) +
            (parseFloat(formData.fm_card_amt) || 0);
    }, [formData.fm_cash_amt, formData.fm_bank_amt, formData.fm_online_amt, formData.fm_card_amt]);

    const isOverLimit = useMemo(() => {
        const max = (transType === 'PAID' || transType === 'CLOSE') ? totals.pending : totals.paid;
        return totalDistributed > max + 0.01;
    }, [totalDistributed, transType, totals]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const transAmt = totalDistributed;
        if (transAmt <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        // Limit Validation
        if ((transType === 'PAID' || transType === 'CLOSE') && transAmt > totals.pending + 0.01) {
            toast.error(`Maximum payable amount is ${totals.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            return;
        }

        if (transType === 'ROLLBACK' && transAmt > totals.paid + 0.01) {
            toast.error(`Maximum rollback amount is ${totals.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            return;
        }


        // Selected Account Validations
        if (parseFloat(formData.fm_cash_amt) > 0 && !formData.fm_cash_acc_id) {
            toast.error("Please select a Cash Account for the cash payment.");
            return;
        }
        if (parseFloat(formData.fm_bank_amt) > 0 && !formData.fm_bank_acc_id) {
            toast.error("Please select a Bank Account for the bank payment.");
            return;
        }
        if (parseFloat(formData.fm_online_amt) > 0 && !formData.fm_online_acc_id) {
            toast.error("Please select an Online Account for the online payment.");
            return;
        }
        if (parseFloat(formData.fm_card_amt) > 0 && !formData.fm_card_acc_id) {
            toast.error("Please select a Card Account for the card payment.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                fm_trans_amt: transAmt,
                fm_fin_id: finance.fin_id,
                fm_trans_type: transType
            };
            await createFinancePayment(payload);
            toast.success(`${transType === 'ROLLBACK' ? 'Rollback' : transType === 'CLOSE' ? 'Close Payment' : 'Payment'} processed successfully`);

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
        <form onSubmit={handleSubmit} className={`p-4 ${transType === 'PAID' ? 'bg-green' : 'bg-red'} rounded shadow-sm border`}>
            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label text-muted fw-bold mb-0">Total Amount</label>
                    <input
                        type="text"
                        className="form-control form-control-sm fw-bold border-dark-subtle"
                        id="total_trans_amt_display"
                        placeholder="Enter Total Amount"
                        value={totalDistributed || ''}
                        onChange={handleTotalChange}
                    />
                </div>
                <div className="col-md-4 pt-4">
                    {isOverLimit && (
                        <div className="text-danger extra-small fw-bold  animate__animated animate__shakeX">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            You Paid maximum -   {(transType === 'PAID' || transType === 'CLOSE') ? totals.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : totals.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    )}
                </div>
                <div className="col-md-4">
                    <label className="form-label text-muted fw-bold mb-0">Transaction Date</label>
                    <input
                        type="date"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_trans_date"
                        value={formData.fm_trans_date}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="col-12 mt-3">
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <i className="bi bi-wallet2 text-primary"></i>
                        <h6 className="mb-0 fw-bold text-dark text-uppercase letter-spacing-1 small">Payment Distribution</h6>
                        <hr className="flex-grow-1 my-0 opacity-25" />
                    </div>
                </div>

                {/* Cash Account */}
                <div className="col-md-4">
                    <select
                        className="form-select form-select-sm border-dark-subtle"
                        id="fm_cash_acc_id"
                        value={formData.fm_cash_acc_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Cash Account</option>
                        {accounts.map(acc => (
                            <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Cash Information"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_cash_info"
                        value={formData.fm_cash_info}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Cash Amount"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_cash_amt"
                        value={formData.fm_cash_amt}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Bank Account */}
                <div className="col-md-4">
                    <select
                        className="form-select form-select-sm border-dark-subtle"
                        id="fm_bank_acc_id"
                        value={formData.fm_bank_acc_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Bank Account</option>
                        {accounts.map(acc => (
                            <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Bank Information"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_bank_info"
                        value={formData.fm_bank_info}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Bank Amount"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_bank_amt"
                        value={formData.fm_bank_amt}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Online Account */}
                <div className="col-md-4">
                    <select
                        className="form-select form-select-sm border-dark-subtle"
                        id="fm_online_acc_id"
                        value={formData.fm_online_acc_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Online Account</option>
                        {accounts.map(acc => (
                            <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Online Information"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_online_info"
                        value={formData.fm_online_info}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Online Amount"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_online_amt"
                        value={formData.fm_online_amt}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Card Account */}
                <div className="col-md-4">
                    <select
                        className="form-select form-select-sm border-dark-subtle"
                        id="fm_card_acc_id"
                        value={formData.fm_card_acc_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Card Account</option>
                        {accounts.map(acc => (
                            <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Card Information"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_card_info"
                        value={formData.fm_card_info}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        placeholder="Card Amount"
                        className="form-control form-control-sm border-dark-subtle"
                        id="fm_card_amt"
                        value={formData.fm_card_amt}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="col-md-12 text-center mt-4">
                    <button
                        type="submit"
                        className={`btn ${(isOverLimit || totalDistributed <= 0) ? 'btn-secondary' : 'btn-primary'} px-5 py-2 fw-bold border-dark`}
                        disabled={submitting || isOverLimit || totalDistributed <= 0}
                    >
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                            </>
                        ) : (
                            transType === 'PAID' ? 'Submit Payment' : transType === 'CLOSE' ? 'Submit Close Payment' : 'Confirm Rollback'
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}

export default PaymentForm