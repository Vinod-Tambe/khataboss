import React, { useState, useEffect } from 'react'

/**
 * PaymentForm Component
 * Handles both Payment and Rollback transactions.
 * 
 * @param {string} initialType - Initial transaction type ('PAID' or 'ROLLBACK')
 */
const PaymentForm = ({ initialType = 'PAID' }) => {
    const [transType, setTransType] = useState(initialType);

    useEffect(() => {
        setTransType(initialType);
    }, [initialType]);

    return (
        <div className="p-4 bg-white rounded">
            <div className="row g-3">
                <div className="col-md-4">
                    <label htmlFor="fm_trans_amt_total" className="form-label small fw-bold">Total Amount</label>
                    <input type="number" className="form-control" id="fm_trans_amt_total" placeholder="0.00" />
                </div>
                <div className="col-md-4">
                    <label htmlFor="fm_trans_type_main" className="form-label small fw-bold">Transaction Type</label>
                    <select 
                        className="form-select" 
                        id="fm_trans_type_main"
                        value={transType}
                        onChange={(e) => setTransType(e.target.value)}
                    >
                        <option value="PAID">PAID</option>
                        <option value="ROLLBACK">ROLLBACK</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label htmlFor="fm_trans_date_main" className="form-label small fw-bold">Transaction Date</label>
                    <input type="date" className="form-control" id="fm_trans_date_main" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="col-12">
                    <hr className="my-3" />
                    <h6 className="text-muted fw-bold mb-3">Payment Distribution</h6>
                </div>

                {/* Cash Account */}
                <div className="col-md-4">
                    <select className="form-select form-select-sm" id="cash_acc_select">
                        <option value="PAID">Cash Account</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input type="text" placeholder='Other Information' className="form-control form-control-sm" id="cash_acc_info" />
                </div>
                <div className="col-md-4">
                    <input type="number" placeholder='Amount' className="form-control form-control-sm" id="cash_acc_amt" />
                </div>

                {/* Bank Account */}
                <div className="col-md-4">
                    <select className="form-select form-select-sm" id="bank_acc_select">
                        <option value="PAID">Bank Account</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input type="text" placeholder='Other Information' className="form-control form-control-sm" id="bank_acc_info" />
                </div>
                <div className="col-md-4">
                    <input type="number" placeholder='Amount' className="form-control form-control-sm" id="bank_acc_amt" />
                </div>

                {/* Online Account */}
                <div className="col-md-4">
                    <select className="form-select form-select-sm" id="online_acc_select">
                        <option value="PAID">Online Account</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input type="text" placeholder='Other Information' className="form-control form-control-sm" id="online_acc_info" />
                </div>
                <div className="col-md-4">
                    <input type="number" placeholder='Amount' className="form-control form-control-sm" id="online_acc_amt" />
                </div>

                {/* Card Account */}
                <div className="col-md-4">
                    <select className="form-select form-select-sm" id="card_acc_select">
                        <option value="PAID">Card Account</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input type="text" placeholder='Other Information' className="form-control form-control-sm" id="card_acc_info" />
                </div>
                <div className="col-md-4">
                    <input type="number" placeholder='Amount' className="form-control form-control-sm" id="card_acc_amt" />
                </div>

                <div className="col-md-12 text-center mt-4">
                    <button type="submit" className="btn btn-primary px-5 py-2 fw-bold">
                        {transType === 'PAID' ? 'Submit Payment' : 'Confirm Rollback'}
                    </button>
                    <p className="small text-muted mt-2">All transactions are logged for audit purposes.</p>
                </div>
            </div>
        </div>
    )
}

export default PaymentForm