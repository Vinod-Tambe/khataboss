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
    const [finePortion, setFinePortion] = useState('');
    const [collectPortion, setCollectPortion] = useState('');
    const [rollbackType, setRollbackType] = useState('EMI');

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

    const fineSummary = finance?.fine_summary || {};
    const interestSummary = finance?.interest_summary || {};
    const rollbackSummary = finance?.rollback_summary || {};
    const pendingFine = parseFloat(fineSummary.pendingFine) || 0;
    const pendingCollect = parseFloat(fineSummary.pendingCollect) || 0;
    const pendingInterest = parseFloat(interestSummary.pending_interest) || 0;
    const showInterestPayment = Boolean(interestSummary.interest_separate);
    const paidInterestRollback = parseFloat(rollbackSummary.interest_paid) || 0;
    const paidFineRollback = parseFloat(rollbackSummary.fine_paid) || 0;
    const paidCollectRollback = parseFloat(rollbackSummary.collect_paid) || 0;
    const paidFineTotalRollback = parseFloat(rollbackSummary.fine_collect_paid) || 0;
    const paidEmiRollback = parseFloat(rollbackSummary.emi_paid) ?? totals.paid;

    const rollbackOptions = useMemo(() => {
        const opts = [];
        if (rollbackSummary.can_rollback_emi || totals.paid > 0) {
            opts.push({
                value: 'EMI',
                label: `EMI Rollback (paid ₹${paidEmiRollback.toFixed(2)})`,
            });
        }
        if (rollbackSummary.can_rollback_interest) {
            opts.push({
                value: 'INTEREST',
                label: `Interest Rollback (paid ₹${paidInterestRollback.toFixed(2)})`,
            });
        }
        if (rollbackSummary.can_rollback_fine) {
            opts.push({
                value: 'FINE',
                label: `Fine / Collect Rollback (paid ₹${paidFineTotalRollback.toFixed(2)})`,
            });
        }
        return opts;
    }, [rollbackSummary, totals.paid, paidEmiRollback, paidInterestRollback, paidFineTotalRollback]);

    useEffect(() => {
        if (transType !== 'ROLLBACK') return;
        const preferred =
            rollbackOptions.find((o) => o.value === 'EMI') ||
            rollbackOptions.find((o) => o.value === 'INTEREST') ||
            rollbackOptions.find((o) => o.value === 'FINE') ||
            rollbackOptions[0];
        if (preferred) {
            setRollbackType(preferred.value);
        }
    }, [transType, rollbackOptions]);

    useEffect(() => {
        if (transType !== 'ROLLBACK') return;
        if (rollbackType === 'INTEREST' && paidInterestRollback > 0) {
            setFormData(prev => ({
                ...prev,
                fm_cash_amt: paidInterestRollback,
                fm_bank_amt: 0,
                fm_online_amt: 0,
                fm_card_amt: 0,
            }));
        } else if (rollbackType === 'FINE') {
            setFinePortion(paidFineRollback > 0 ? String(paidFineRollback) : '0');
            setCollectPortion(paidCollectRollback > 0 ? String(paidCollectRollback) : '0');
            const total = parseFloat((paidFineRollback + paidCollectRollback).toFixed(2));
            setFormData(prev => ({
                ...prev,
                fm_cash_amt: total > 0 ? total : 0,
                fm_bank_amt: 0,
                fm_online_amt: 0,
                fm_card_amt: 0,
            }));
        } else if (rollbackType === 'EMI' && paidEmiRollback > 0) {
            setFormData(prev => ({
                ...prev,
                fm_cash_amt: paidEmiRollback,
                fm_bank_amt: 0,
                fm_online_amt: 0,
                fm_card_amt: 0,
            }));
        }
    }, [transType, rollbackType, paidInterestRollback, paidFineRollback, paidCollectRollback, paidEmiRollback]);

    const pendingFineTotal = parseFloat(
        (fineSummary.pendingTotal != null
            ? fineSummary.pendingTotal
            : pendingFine + pendingCollect).toFixed(2)
    );

    const rollbackMax = useMemo(() => {
        if (transType !== 'ROLLBACK') return 0;
        if (rollbackType === 'INTEREST') return paidInterestRollback;
        if (rollbackType === 'FINE') return paidFineTotalRollback;
        return paidEmiRollback;
    }, [transType, rollbackType, paidInterestRollback, paidFineTotalRollback, paidEmiRollback]);

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

    useEffect(() => {
        if (transType !== 'FINE') return;
        const fine = pendingFine;
        const collect = pendingCollect;
        setFinePortion(fine > 0 ? String(fine) : '0');
        setCollectPortion(collect > 0 ? String(collect) : '0');
        const total = parseFloat((fine + collect).toFixed(2));
        setFormData(prev => ({
            ...prev,
            fm_cash_amt: total > 0 ? total : 0,
            fm_bank_amt: 0,
            fm_online_amt: 0,
            fm_card_amt: 0
        }));
    }, [transType, pendingFine, pendingCollect]);

    useEffect(() => {
        if (transType !== 'INTEREST') return;
        const total = pendingInterest > 0 ? pendingInterest : 0;
        setFormData(prev => ({
            ...prev,
            fm_cash_amt: total > 0 ? total : 0,
            fm_bank_amt: 0,
            fm_online_amt: 0,
            fm_card_amt: 0
        }));
    }, [transType, pendingInterest]);

    const totalDistributed = useMemo(() => {
        return (parseFloat(formData.fm_cash_amt) || 0) +
            (parseFloat(formData.fm_bank_amt) || 0) +
            (parseFloat(formData.fm_online_amt) || 0) +
            (parseFloat(formData.fm_card_amt) || 0);
    }, [formData.fm_cash_amt, formData.fm_bank_amt, formData.fm_online_amt, formData.fm_card_amt]);

    const finePartsSum = useMemo(() => {
        if (transType !== 'FINE' && !(transType === 'ROLLBACK' && rollbackType === 'FINE')) return 0;
        return parseFloat(
            ((parseFloat(finePortion) || 0) + (parseFloat(collectPortion) || 0)).toFixed(2)
        );
    }, [transType, rollbackType, finePortion, collectPortion]);

    const isOverLimit = useMemo(() => {
        if (transType === 'FINE') {
            return totalDistributed > pendingFineTotal + 0.01;
        }
        if (transType === 'INTEREST') {
            return totalDistributed > pendingInterest + 0.01;
        }
        if (transType === 'ROLLBACK') {
            return totalDistributed > rollbackMax + 0.01;
        }
        const max = (transType === 'PAID' || transType === 'CLOSE') ? totals.pending : totals.paid;
        return totalDistributed > max + 0.01;
    }, [totalDistributed, transType, totals, pendingFineTotal, pendingInterest, rollbackMax]);

    const handleFinePortionChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        setFinePortion(val);
        const fine = parseFloat(val) || 0;
        const collect = parseFloat(collectPortion) || 0;
        const total = parseFloat((fine + collect).toFixed(2));
        setFormData(prev => ({
            ...prev,
            fm_cash_amt: total,
            fm_bank_amt: 0,
            fm_online_amt: 0,
            fm_card_amt: 0
        }));
    };

    const handleCollectPortionChange = (e) => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        setCollectPortion(val);
        const fine = parseFloat(finePortion) || 0;
        const collect = parseFloat(val) || 0;
        const total = parseFloat((fine + collect).toFixed(2));
        setFormData(prev => ({
            ...prev,
            fm_cash_amt: total,
            fm_bank_amt: 0,
            fm_online_amt: 0,
            fm_card_amt: 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const transAmt = totalDistributed;
        if (transAmt <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        if ((transType === 'PAID' || transType === 'CLOSE') && transAmt > totals.pending + 0.01) {
            toast.error(`Maximum payable amount is ${totals.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            return;
        }

        if (transType === 'CLOSE' && Math.abs(transAmt - totals.pending) > 0.01) {
            toast.error(
              `Close must collect full pending amount (${totals.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
            );
            return;
        }

        if (transType === 'ROLLBACK') {
            if (!rollbackOptions.length) {
                toast.error('No payments available to rollback');
                return;
            }
            if (rollbackType === 'EMI' && transAmt > paidEmiRollback + 0.01) {
                toast.error(`Maximum EMI rollback is ${paidEmiRollback.toFixed(2)}`);
                return;
            }
            if (rollbackType === 'INTEREST') {
                if (transAmt > paidInterestRollback + 0.01) {
                    toast.error(`Maximum interest rollback is ${paidInterestRollback.toFixed(2)}`);
                    return;
                }
            }
            if (rollbackType === 'FINE') {
                const fine = parseFloat(finePortion) || 0;
                const collect = parseFloat(collectPortion) || 0;
                if (fine > paidFineRollback + 0.01) {
                    toast.error(`Fine rollback cannot exceed ${paidFineRollback.toFixed(2)}`);
                    return;
                }
                if (collect > paidCollectRollback + 0.01) {
                    toast.error(`Collect rollback cannot exceed ${paidCollectRollback.toFixed(2)}`);
                    return;
                }
                if (Math.abs(fine + collect - transAmt) > 0.01) {
                    toast.error('Fine + Collect must equal total rollback amount');
                    return;
                }
            }
        }

        if (transType === 'FINE') {
            const fine = parseFloat(finePortion) || 0;
            const collect = parseFloat(collectPortion) || 0;
            if (fine > pendingFine + 0.01) {
                toast.error(`Fine cannot exceed pending fine (${pendingFine.toFixed(2)})`);
                return;
            }
            if (collect > pendingCollect + 0.01) {
                toast.error(`Collect cannot exceed pending collect (${pendingCollect.toFixed(2)})`);
                return;
            }
            if (Math.abs(fine + collect - transAmt) > 0.01) {
                toast.error("Fine + Collect must equal total payment amount");
                return;
            }
            if (transAmt > pendingFineTotal + 0.01) {
                toast.error(`Maximum fine/collect amount is ${pendingFineTotal.toFixed(2)}`);
                return;
            }
        }

        if (transType === 'INTEREST') {
            if (!showInterestPayment) {
                toast.error('Separate interest payment is not available for this finance');
                return;
            }
            if (transAmt > pendingInterest + 0.01) {
                toast.error(`Maximum interest payable is ${pendingInterest.toFixed(2)}`);
                return;
            }
        }

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
            if (transType === 'FINE') {
                payload.fm_fine_amt = parseFloat(finePortion) || 0;
                payload.fm_collect_amt = parseFloat(collectPortion) || 0;
            }
            if (transType === 'ROLLBACK') {
                payload.fm_rollback_type = rollbackType;
                if (rollbackType === 'FINE') {
                    payload.fm_fine_amt = parseFloat(finePortion) || 0;
                    payload.fm_collect_amt = parseFloat(collectPortion) || 0;
                }
            }
            await createFinancePayment(payload);
            const okMsg =
                transType === 'ROLLBACK'
                    ? rollbackType === 'INTEREST'
                        ? 'Interest Rollback'
                        : rollbackType === 'FINE'
                            ? 'Fine / Collect Rollback'
                            : 'EMI Rollback'
                    : transType === 'CLOSE'
                        ? 'Close Payment'
                        : transType === 'FINE'
                            ? 'Fine / Collect Payment'
                            : transType === 'INTEREST'
                                ? 'Interest Payment'
                                : 'Payment';
            toast.success(`${okMsg} processed successfully`);

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

    const formBg =
        transType === 'PAID' || transType === 'FINE' || transType === 'INTEREST'
            ? 'bg-green'
            : 'bg-red';

    const maxHint =
        transType === 'FINE'
            ? pendingFineTotal
            : transType === 'INTEREST'
                ? pendingInterest
                : transType === 'ROLLBACK'
                    ? rollbackMax
                    : (transType === 'PAID' || transType === 'CLOSE')
                        ? totals.pending
                        : totals.paid;

    const submitLabel =
        transType === 'PAID'
            ? 'Submit Payment'
            : transType === 'CLOSE'
                ? 'Submit Close Payment'
                : transType === 'FINE'
                    ? 'Submit Fine Payment'
                    : transType === 'INTEREST'
                        ? 'Submit Interest Payment'
                        : transType === 'ROLLBACK'
                            ? rollbackType === 'INTEREST'
                                ? 'Confirm Interest Rollback'
                                : rollbackType === 'FINE'
                                    ? 'Confirm Fine Rollback'
                                    : 'Confirm EMI Rollback'
                            : 'Confirm Rollback';

    return (
        <form onSubmit={handleSubmit} className={`p-4 ${formBg} rounded shadow-sm border`}>
            <div className="row g-3">
                {transType === 'ROLLBACK' && (
                    <>
                        <div className="col-md-4">
                            <label className="form-label text-muted fw-bold mb-0">Rollback Type</label>
                            <select
                                className="form-select form-select-sm border-dark-subtle fw-semibold"
                                value={rollbackType}
                                onChange={(e) => setRollbackType(e.target.value)}
                                disabled={!rollbackOptions.length}
                            >
                                {rollbackOptions.length === 0 ? (
                                    <option value="">Nothing to rollback</option>
                                ) : (
                                    rollbackOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-muted fw-bold mb-0">Total Amount <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control form-control-sm fw-bold border-dark-subtle"
                                placeholder="Enter Total Amount"
                                value={totalDistributed || ''}
                                onChange={handleTotalChange}
                                readOnly={rollbackType === 'FINE'}
                            />
                            {isOverLimit && (
                                <div className="text-danger extra-small fw-bold mt-1 animate__animated animate__shakeX">
                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                    Max {maxHint.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            )}
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-muted fw-bold mb-0">Transaction Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className="form-control form-control-sm border-dark-subtle"
                                id="fm_trans_date"
                                value={formData.fm_trans_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        {rollbackType === 'FINE' && (
                            <>
                                <div className="col-md-4">
                                    <label className="form-label text-muted fw-bold mb-0">Fine Rollback</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm fw-bold border-dark-subtle"
                                        value={finePortion}
                                        onChange={handleFinePortionChange}
                                        placeholder="0.00"
                                    />
                                    <div className="form-text">Paid fine max ₹{paidFineRollback.toFixed(2)}</div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted fw-bold mb-0">Collect Rollback</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm fw-bold border-dark-subtle"
                                        value={collectPortion}
                                        onChange={handleCollectPortionChange}
                                        placeholder="0.00"
                                    />
                                    <div className="form-text">Paid collect max ₹{paidCollectRollback.toFixed(2)}</div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted fw-bold mb-0">Parts Total</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm fw-bold border-dark-subtle"
                                        value={finePartsSum || ''}
                                        readOnly
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
                {transType === 'INTEREST' && showInterestPayment && (
                    <div className="col-12">
                        <div className="finance-fine-summary card border-0 shadow-sm mb-1">
                            <div className="card-body py-3 px-3">
                                <h6 className="finance-fine-summary__title mb-3">
                                    <i className="bi bi-percent me-2 text-warning"></i>
                                    Interest Summary
                                </h6>
                                <div className="row g-2 g-md-3">
                                    <div className="col-6 col-md-3">
                                        <div className="finance-fine-summary__item">
                                            <span className="finance-fine-summary__label">ROI</span>
                                            <span className="finance-fine-summary__value">{interestSummary.roi_display || '0%'}</span>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="finance-fine-summary__item">
                                            <span className="finance-fine-summary__label">Total interest</span>
                                            <span className="finance-fine-summary__value text-warning">
                                                ₹{Number(interestSummary.interest_amt || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="finance-fine-summary__item">
                                            <span className="finance-fine-summary__label">Paid interest</span>
                                            <span className="finance-fine-summary__value text-success">
                                                ₹{Number(interestSummary.interest_paid || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <div className="finance-fine-summary__item finance-fine-summary__item--payable">
                                            <span className="finance-fine-summary__label">Pending interest</span>
                                            <span className="finance-fine-summary__value text-danger fw-bold">
                                                ₹{pendingInterest.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {transType === 'FINE' && (
                    <>
                        <div className="col-12">
                            <div className="finance-fine-summary card border-0 shadow-sm mb-1">
                                <div className="card-body py-3 px-3">
                                    <h6 className="finance-fine-summary__title mb-3">
                                        <i className="bi bi-exclamation-octagon me-2 text-danger"></i>
                                        Fine / Collect Summary
                                    </h6>
                                    <div className="row g-2 g-md-3">
                                        <div className="col-12 col-md-4">
                                            <div className="finance-fine-summary__item">
                                                <span className="finance-fine-summary__label">Fine rule</span>
                                                <span className="finance-fine-summary__value">
                                                    {fineSummary.label || 'Fine / Collect'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4">
                                            <div className="finance-fine-summary__item">
                                                <span className="finance-fine-summary__label">Overdue EMIs</span>
                                                <span className="finance-fine-summary__value">
                                                    {fineSummary.overdueCount ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4">
                                            <div className="finance-fine-summary__item">
                                                <span className="finance-fine-summary__label">Total fine</span>
                                                <span className="finance-fine-summary__value text-danger">
                                                    ₹{Number(fineSummary.totalFine || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4">
                                            <div className="finance-fine-summary__item">
                                                <span className="finance-fine-summary__label">Pending fine</span>
                                                <span className="finance-fine-summary__value text-danger fw-bold">
                                                    ₹{pendingFine.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4">
                                            <div className="finance-fine-summary__item">
                                                <span className="finance-fine-summary__label">Pending collect</span>
                                                <span className="finance-fine-summary__value text-primary fw-bold">
                                                    ₹{pendingCollect.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <div className="finance-fine-summary__item finance-fine-summary__item--payable">
                                                <span className="finance-fine-summary__label">Payable now</span>
                                                <span className="finance-fine-summary__value text-success fw-bold">
                                                    ₹{pendingFineTotal.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-muted fw-bold mb-0">Fine Amount</label>
                            <input
                                type="text"
                                className="form-control form-control-sm fw-bold border-dark-subtle"
                                value={finePortion}
                                onChange={handleFinePortionChange}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-muted fw-bold mb-0">Collect Amount (Extra)</label>
                            <input
                                type="text"
                                className="form-control form-control-sm fw-bold border-dark-subtle"
                                value={collectPortion}
                                onChange={handleCollectPortionChange}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-muted fw-bold mb-0">Parts Total</label>
                            <input
                                type="text"
                                className="form-control form-control-sm fw-bold border-dark-subtle"
                                value={finePartsSum || ''}
                                readOnly
                            />
                        </div>
                    </>
                )}

                {transType !== 'ROLLBACK' && (
                    <>
                        <div className="col-md-4">
                            <label className="form-label text-muted fw-bold mb-0">Total Amount <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control form-control-sm fw-bold border-dark-subtle"
                                id="total_trans_amt_display"
                                placeholder="Enter Total Amount"
                                value={totalDistributed || ''}
                                onChange={handleTotalChange}
                                readOnly={transType === 'FINE'}
                            />
                        </div>
                        <div className="col-md-4 pt-4">
                            {isOverLimit && (
                                <div className="text-danger extra-small fw-bold  animate__animated animate__shakeX">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    You Paid maximum -   {maxHint.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            )}
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-muted fw-bold mb-0">Transaction Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className="form-control form-control-sm border-dark-subtle"
                                id="fm_trans_date"
                                value={formData.fm_trans_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </>
                )}

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

                {/* Other Information */}
                <div className="col-md-12">
                    <textarea
                        rows="1"
                        placeholder="Other Information"
                        className="form-control form-control-sm border-dark-subtle mt-2"
                        id="fm_other_info"
                        value={formData.fm_other_info}
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
                            submitLabel
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}

export default PaymentForm
