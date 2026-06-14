import React from 'react'
import moment from 'moment'

const AccountDetailsReport = ({ ledgerData = [], loading = false, openingBalanceProp = 0, isPrint = false }) => {
    // Process data to calculate running balances and map fields
    const processedData = [];
    let currentBalance = parseFloat(openingBalanceProp || 0);

    ledgerData.forEach((item) => {
        const debit = parseFloat(item.jrtr_dr_amt || 0);
        const credit = parseFloat(item.jrtr_cr_amt || 0);
        const openingBal = currentBalance;
        
        // Use user's formula: Closing Balance = Opening Balance + Credit - Debit
        currentBalance = openingBal + credit - debit;

        processedData.push({
            ...item,
            date: item.jrtr_date,
            details: item.jrtr_other_info,
            debit,
            credit,
            opening_bal: openingBal,
            closing_bal: currentBalance,
            firm: item.firm?.firm_name || item.jrtr_firm_id
        });
    });

    // Calculate totals
    const totalDebit = processedData.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = processedData.reduce((sum, item) => sum + item.credit, 0);
    const openingBalance = parseFloat(openingBalanceProp || 0);
    const closingBalance = currentBalance;
    const currentTotal = totalCredit - totalDebit; // Credit - Debit matches the orientation

    const renderBalance = (amount, label, colorClass = "") => {
        const absAmount = Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const type = amount >= 0 ? "CR" : "DR"; // Positive is CR in this orientation
        const color = colorClass || (amount >= 0 ? "text-danger" : "text-success"); // Red for Credit/Liability usually, but let's be careful. Actually let's just use positive/negative.

        return (
            <>
                <div className="col-8"></div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 bg-light text-uppercase">{label} :</div>
                <div className={`col-2 border border-secondary text-end fw-bold p-1 bg-light ${color}`}>
                    {absAmount} {type}
                </div>
            </>
        );
    };

    const formatAmount = (amount) => {
        return Math.abs(parseFloat(amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatBalanceType = (amount) => {
        const absAmount = formatAmount(amount);
        const type = amount >= 0 ? "CR" : "DR";
        return `${absAmount} ${type}`;
    };

    return (
        <div className="table-responsive table-responsive-custom">
            <table className="table table-hover table-bordered border-secondary mb-2 dataTable dtr-inline text-capitalize dynamic-data-table">
                <thead className='table-secondary border-bottom border-dark-subtle'>
                    <tr className="bg-danger text-white">
                        <th className="sticky-col">SR.NO</th>
                        <th>DATE</th>
                        <th>FIRM</th>
                        <th>TRANSACTION DETAILS</th>
                        <th>OPENING BAL</th>
                        <th>DEBIT</th>
                        <th>CREDIT</th>
                        <th>CLOSING BAL</th>
                    </tr>
                </thead>

                <tbody>
                    {!isPrint && loading ? (
                        <tr>
                            <td colSpan="8" className="text-center py-4">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                Loading ledger data...
                            </td>
                        </tr>
                    ) : processedData.length > 0 ? (
                        processedData.map((item, index) => (
                            <tr key={index}>
                                <td className="sticky-col text-center">{index + 1}</td>
                                <td className="text-center">{moment(item.date).format("DD-MM-YYYY")}</td>
                                <td>{item.firm}</td>
                                <td>{item.details}</td>
                                <td className="text-end">{formatBalanceType(item.opening_bal)}</td>
                                <td className="text-end text-success">{item.debit > 0 ? formatAmount(item.debit) : "0.00"}</td>
                                <td className="text-end text-danger">{item.credit > 0 ? formatAmount(item.credit) : "0.00"}</td>
                                <td className="text-end fw-bold">{formatBalanceType(item.closing_bal)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center py-4 text-muted">
                                No transactions found for the selected period.
                            </td>
                        </tr>
                    )}
                </tbody>

                {!loading && processedData.length > 0 && (
                    <tfoot>
                        <tr className="bg-blue fw-bold">
                            <th colSpan="4" className="text-center text-white">TOTAL</th>
                            <th className="text-end text-white">{formatBalanceType(openingBalance)}</th>
                            <th className="text-end text-white">{formatAmount(totalDebit)}</th>
                            <th className="text-end text-white">{formatAmount(totalCredit)}</th>
                            <th className="text-end text-white">{formatBalanceType(closingBalance)}</th>
                        </tr>
                    </tfoot>
                )}
            </table>

            <div className="row p-3 m-1">
                {renderBalance(openingBalance, "Opening Balance")}

                <div className="col-8"></div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 text-success bg-light text-uppercase">Total Debit :</div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 text-success bg-light">{formatAmount(totalDebit)} DR</div>

                <div className="col-8"></div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 text-danger bg-light text-uppercase">Total Credit :</div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 text-danger bg-light">{formatAmount(totalCredit)} CR</div>

                {renderBalance(currentTotal, "Current Total", currentTotal >= 0 ? "text-danger" : "text-success")}
                {renderBalance(closingBalance, "Closing Balance")}
            </div>
        </div>
    );
};


export default AccountDetailsReport
