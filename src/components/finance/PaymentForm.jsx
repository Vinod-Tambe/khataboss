import React from 'react'

const PaymentForm = () => {
    return (
        <div className="col-md-12 py-3 px-3 border rounded shadow-sm">
            <h5 className="text-muted">Finance Payment</h5>
            <div className="row g-3">
                <div className="col-md-4">
                    <label htmlFor="fm_trans_amt" className="form-label">Transaction Amount</label>
                    <input type="number" className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-4">
                    <label htmlFor="fm_trans_type" className="form-label">Transaction Type</label>
                    <select className="form-select" id="fm_trans_type">
                        <option value="PAID">PAID</option>
                        <option value="ROLLBACK">ROLLBACK</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label htmlFor="fm_trans_date" className="form-label">Transaction Date</label>
                    <input type="date" className="form-control" id="fm_trans_date" />
                </div>
                <div className="col-md-4">
                    <select className="form-select" id="fm_trans_type">
                        <option value="PAID">Cash Account </option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input type="text" placeholder='Other Information' className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-4">
                    <input type="number" placeholder='Amount' className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-4">
                    <select className="form-select" id="fm_trans_type">
                        <option value="PAID">Bank Account</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input type="text" placeholder='Other Information' className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-4">
                    <input type="number" placeholder='Amount' className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-4">
                    <select className="form-select" id="fm_trans_type">
                        <option value="PAID">Online Account</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input type="text" placeholder='Other Information' className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-4">
                    <input type="number" placeholder='Amount' className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-4">
                    <select className="form-select" id="fm_trans_type">
                        <option value="PAID">Card Account</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <input type="text" placeholder='Other Information' className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-4">
                    <input type="number" placeholder='Amount' className="form-control" id="fm_trans_amt" />
                </div>
                <div className="col-md-12 text-center">
                    <button type="submit" className="btn btn btn-primary mt-1">Submit</button>
                </div>
            </div>
        </div>
    )
}

export default PaymentForm