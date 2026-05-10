import React from 'react'

const AccountDetailsReport = () => {
    // Dummy variables for demonstration
    const openingBalance = 10000;
    const totalDebit = 2000;
    const totalCredit = 8000;
    const currentTotal = totalDebit - totalCredit;
    const closingBalance = openingBalance + currentTotal;

    const renderBalance = (amount, label, colorClass = "") => {
        const absAmount = Math.abs(amount).toFixed(2);
        const type = amount <= 0 ? "CR" : "DR";
        const color = colorClass || (amount < 0 ? "text-danger" : "text-success");

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

    return (
        <div class="table-responsive table-responsive-custom">
            <table class="table table-hover table-bordered border-secondary mb-2 dataTable dtr-inline text-capitalize dynamic-data-table">

                <thead className='table-secondary border-bottom border-dark-subtle'>
                    <tr class="bg-danger text-white">
                        <th class="sticky-col">SR.NO</th>
                        <th>DATE</th>
                        <th>FIRM</th>
                        <th>TRANSACTION DETAILS</th>
                        <th>OPENINING BAL</th>
                        <th>DEBIT</th>
                        <th>CREDIT</th>
                        <th>CLOSING BAL</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td class="sticky-col text-center">1</td>
                        <td class="text-center">01-04-2025</td>
                        <td>Aman Traders</td>
                        <td>Opening Balance</td>
                        <td class="text-end">10,000.00 DR</td>
                        <td class="text-end">0.00</td>
                        <td class="text-end">0.00</td>
                        <td class="text-end">10,000.00 DR</td>
                    </tr>

                    <tr>
                        <td class="sticky-col text-center">2</td>
                        <td class="text-center">05-04-2025</td>
                        <td>Aman Traders</td>
                        <td>Cash Received</td>
                        <td class="text-end">10,000.00 DR</td>
                        <td class="text-end">0.00</td>
                        <td class="text-end">5,000.00</td>
                        <td class="text-end">5,000.00 DR</td>
                    </tr>

                    <tr>
                        <td class="sticky-col text-center">3</td>
                        <td class="text-center">10-04-2025</td>
                        <td>Aman Traders</td>
                        <td>Service Payment</td>
                        <td class="text-end">5,000.00 DR</td>
                        <td class="text-end">2,000.00</td>
                        <td class="text-end">0.00</td>
                        <td class="text-end">7,000.00 DR</td>
                    </tr>

                    <tr>
                        <td class="sticky-col text-center">4</td>
                        <td class="text-center">15-04-2025</td>
                        <td>Aman Traders</td>
                        <td>Bank Transfer</td>
                        <td class="text-end">7,000.00 DR</td>
                        <td class="text-end">0.00</td>
                        <td class="text-end">3,000.00</td>
                        <td class="text-end">4,000.00 DR</td>
                    </tr>
                </tbody>

                <tfoot>
                    <tr class="bg-blue fw-bold">
                        <th colspan="4" class="text-center text-white">TOTAL</th>
                        <th class="text-end text-white">2,000.00</th>
                        <th class="text-end text-white">2,000.00</th>
                        <th class="text-end text-white">8,000.00</th>
                        <th class="text-end text-white">4,000.00 DR</th>
                    </tr>
                </tfoot>

            </table>
            <div className="row p-3 m-1">
                {renderBalance(openingBalance, "Opening Balance")}

                <div className="col-8"></div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 text-success bg-light text-uppercase">Total Debit :</div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 text-success bg-light">{Math.abs(totalDebit).toFixed(2)} DR</div>

                <div className="col-8"></div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 text-danger bg-light text-uppercase">Total Credit :</div>
                <div className="col-2 border border-secondary text-end fw-bold p-1 text-danger bg-light">{Math.abs(totalCredit).toFixed(2)} CR</div>

                {renderBalance(currentTotal, "Current Total", (totalDebit - totalCredit) < 0 ? "text-danger" : "text-success")}
                {renderBalance(closingBalance, "Closing Balance")}
            </div>
        </div>
    )
}

export default AccountDetailsReport
