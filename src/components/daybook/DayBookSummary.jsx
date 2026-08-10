import React from 'react';
import '../../css/DataTable.css';
// import useConfigStore from '../../zustand/config.store';

const DayBookSummary = ({ DayBookData,opening_data }) => {
    // const setDaybookAmounts = useConfigStore((state) => state.setDaybookAmounts)
    // Calculate TODAY OPENING  AMOUNT
    let total_open_cash_amt =parseFloat(opening_data.total_cash_amt||0);
    let total_open_bank_amt  =parseFloat(opening_data.total_bank_amt||0);
    let total_open_online_amt = parseFloat(opening_data.total_online_amt||0);
    let total_open_card_amt = parseFloat(opening_data.total_card_amt||0);
    let total_open_disc_amt = 0;
    let total_open_amt = parseFloat(opening_data.total_cash_amt||0)+parseFloat(opening_data.total_online_amt||0)+parseFloat(opening_data.total_bank_amt||0)+parseFloat(opening_data.total_card_amt||0);
     // Calculate TODAY OPENING  AMOUNT

    // Initialize all totals to 0
    let total_today_cash_in_amt = 0;
    let total_today_bank_in_amt = 0;
    let total_today_card_in_amt = 0;
    let total_today_online_in_amt = 0;
    let total_today_disc_in_amt = 0;
    let total_today_in_amt = 0;

    let total_today_cash_out_amt = 0;
    let total_today_bank_out_amt = 0;
    let total_today_card_out_amt = 0;
    let total_today_online_out_amt = 0;
    let total_today_disc_out_amt = 0;
    let total_today_out_amt = 0;

    let total_today_cash_amt = 0;
    let total_today_bank_amt = 0;
    let total_today_card_amt = 0;
    let total_today_online_amt = 0;
    let total_today_disc_amt = 0;
    let total_today_amt = 0;

    let total_close_cash_amt = 0;
    let total_close_bank_amt = 0;
    let total_close_card_amt = 0;
    let total_close_online_amt = 0;
    let total_close_disc_amt = 0;
    let total_close_amt = 0;
    // CALCULATE IN AMOUNT (FINANCE EMI DEPOSIT + LOAN DEPOSIT + RELEASE LOAN + AUCTION LOAN + TRANSFER LOAN OUT)
    const Finance_emi_deposit_data = DayBookData?.['FINANCE EMI DEPOSIT'] || {};
    const Loan_deposit_data = DayBookData?.['LOAN DEPOSIT'] || {};
    const Release_loan_data = DayBookData?.['RELEASE LOAN'] || {};
    const Auction_loan_data = DayBookData?.['AUCTION LOAN'] || {};
    const Transfer_loan_out_data = DayBookData?.['TRANSFER LOAN OUT'] || {};

    total_today_cash_in_amt = parseFloat(Finance_emi_deposit_data.total_cash_amt || 0) + parseFloat(Loan_deposit_data.total_cash_amt || 0) + parseFloat(Release_loan_data.total_cash_amt || 0) + parseFloat(Auction_loan_data.total_cash_amt || 0) + parseFloat(Transfer_loan_out_data.total_cash_amt || 0);
    total_today_bank_in_amt = parseFloat(Finance_emi_deposit_data.total_bank_amt || 0) + parseFloat(Loan_deposit_data.total_bank_amt || 0) + parseFloat(Release_loan_data.total_bank_amt || 0) + parseFloat(Auction_loan_data.total_bank_amt || 0) + parseFloat(Transfer_loan_out_data.total_bank_amt || 0);
    total_today_online_in_amt = parseFloat(Finance_emi_deposit_data.total_online_amt || 0) + parseFloat(Loan_deposit_data.total_online_amt || 0) + parseFloat(Release_loan_data.total_online_amt || 0) + parseFloat(Auction_loan_data.total_online_amt || 0) + parseFloat(Transfer_loan_out_data.total_online_amt || 0);
    total_today_card_in_amt = parseFloat(Finance_emi_deposit_data.total_card_amt || 0) + parseFloat(Loan_deposit_data.total_card_amt || 0) + parseFloat(Release_loan_data.total_card_amt || 0) + parseFloat(Auction_loan_data.total_card_amt || 0) + parseFloat(Transfer_loan_out_data.total_card_amt || 0);
    total_today_disc_in_amt = parseFloat(Finance_emi_deposit_data.total_disc_amt || 0) + parseFloat(Loan_deposit_data.total_disc_amt || 0) + parseFloat(Release_loan_data.total_disc_amt || 0) + parseFloat(Auction_loan_data.total_disc_amt || 0) + parseFloat(Transfer_loan_out_data.total_disc_amt || 0);
    total_today_in_amt = parseFloat(Finance_emi_deposit_data.total_amt || 0) + parseFloat(Loan_deposit_data.total_amt || 0) + parseFloat(Release_loan_data.total_amt || 0) + parseFloat(Auction_loan_data.total_amt || 0) + parseFloat(Transfer_loan_out_data.total_amt || 0);

    // CALCULATE OUT AMOUNT (FINANCE ADDED + LOAN ADDED + ADDITIONAL LOAN PRINCIPAL + FINANCE EMI ROLLBACK + TRANSFER LOAN IN)
    const Finance_added_data = DayBookData?.['FINANCE ADDED'] || {};
    const Finance_emi_rollback_data = DayBookData?.['FINANCE EMI ROLLBACK'] || {};
    const Loan_added_data = DayBookData?.['LOAN ADDED'] || {};
    const Additional_principal_data = DayBookData?.['ADDITIONAL LOAN PRINCIPAL'] || {};
    const Transfer_loan_in_data = DayBookData?.['TRANSFER LOAN IN'] || {};

    total_today_cash_out_amt = parseFloat(Finance_added_data.total_cash_amt || 0) + parseFloat(Finance_emi_rollback_data.total_cash_amt || 0) + parseFloat(Loan_added_data.total_cash_amt || 0) + parseFloat(Additional_principal_data.total_cash_amt || 0) + parseFloat(Transfer_loan_in_data.total_cash_amt || 0);
    total_today_bank_out_amt = parseFloat(Finance_added_data.total_bank_amt || 0) + parseFloat(Finance_emi_rollback_data.total_bank_amt || 0) + parseFloat(Loan_added_data.total_bank_amt || 0) + parseFloat(Additional_principal_data.total_bank_amt || 0) + parseFloat(Transfer_loan_in_data.total_bank_amt || 0);
    total_today_online_out_amt = parseFloat(Finance_added_data.total_online_amt || 0) + parseFloat(Finance_emi_rollback_data.total_online_amt || 0) + parseFloat(Loan_added_data.total_online_amt || 0) + parseFloat(Additional_principal_data.total_online_amt || 0) + parseFloat(Transfer_loan_in_data.total_online_amt || 0);
    total_today_card_out_amt = parseFloat(Finance_added_data.total_card_amt || 0) + parseFloat(Finance_emi_rollback_data.total_card_amt || 0) + parseFloat(Loan_added_data.total_card_amt || 0) + parseFloat(Additional_principal_data.total_card_amt || 0) + parseFloat(Transfer_loan_in_data.total_card_amt || 0);
    total_today_disc_out_amt = parseFloat(Finance_added_data.total_disc_amt || 0) + parseFloat(Finance_emi_rollback_data.total_disc_amt || 0) + parseFloat(Loan_added_data.total_disc_amt || 0) + parseFloat(Additional_principal_data.total_disc_amt || 0) + parseFloat(Transfer_loan_in_data.total_disc_amt || 0);
    total_today_out_amt = parseFloat(Finance_added_data.total_amt || 0) + parseFloat(Finance_emi_rollback_data.total_amt || 0) + parseFloat(Loan_added_data.total_amt || 0) + parseFloat(Additional_principal_data.total_amt || 0) + parseFloat(Transfer_loan_in_data.total_amt || 0);

    // Calculate TODAY TOTAL (in - out)
    total_today_cash_amt = total_today_cash_in_amt - total_today_cash_out_amt;
    total_today_bank_amt = total_today_bank_in_amt - total_today_bank_out_amt;
    total_today_card_amt = total_today_card_in_amt - total_today_card_out_amt;
    total_today_online_amt = total_today_online_in_amt - total_today_online_out_amt;
    total_today_disc_amt = total_today_disc_in_amt - total_today_disc_out_amt;
    total_today_amt = total_today_in_amt - total_today_out_amt;
    // Calculate TODAY TOTAL (in - out)
    // Calculate TODAY CLOSING  AMOUNT
    total_close_cash_amt =total_open_cash_amt+ total_today_cash_amt;
    total_close_bank_amt =total_open_bank_amt+ total_today_bank_amt;
    total_close_online_amt =total_open_online_amt+ total_today_online_amt;
    total_close_card_amt =total_open_card_amt+ total_today_card_amt;
    total_close_disc_amt =total_open_disc_amt+ total_today_disc_amt;
    total_close_amt = total_today_amt+total_open_amt;
     // Calculate TODAY CLOSING  AMOUNT
     //Calculate Total Final CR And DR Amount With Final Amoutn (CR-DR)
     let total_final_dr_amt=total_today_cash_in_amt+total_today_bank_in_amt+total_today_online_in_amt+total_today_card_in_amt+total_today_disc_in_amt;
     let total_final_cr_amt=total_today_cash_out_amt+total_today_bank_out_amt+total_today_online_out_amt+total_today_card_out_amt+total_today_disc_out_amt;
     let total_open_final_amt=total_open_amt;
    let total_close_final_amt=total_open_final_amt+(total_final_dr_amt-total_final_cr_amt);
    //  setDaybookAmounts({ openingAmount: total_open_final_amt.toFixed(2) });
     //Calculate Total Final CR And DR Amount With Final Amoutn (CR-DR)
    return (
        <div className="table-responsive mt-4 table-wrapper bg-green border border-secondary">
            <table className="table table-hover table-bordered table-dashed p-0 m-0 dynamic-data-table">
                <thead className="table-light fw-bold border-bottom border-secondary">
                    <tr>
                        <th className="fw-bold border-bottom border-secondary bg-red"></th>
                        <th className="fw-bold border-bottom border-secondary text-end bg-red">CASH</th>
                        <th className="fw-bold border-bottom border-secondary text-end bg-red">BANK</th>
                        <th className="fw-bold border-bottom border-secondary text-end bg-red">ONLINE</th>
                        <th className="fw-bold border-bottom border-secondary text-end bg-red">CARD</th>
                        <th className="fw-bold border-bottom border-secondary text-end bg-red">DISCOUNT</th>
                        <th className="fw-bold border-bottom border-secondary text-end bg-red">TOTAL</th>
                    </tr>
                </thead>
                <tbody className="fw-bold text-brown border-bottom border-secondary">
                    <tr>
                        <td className="fw-bold text-success text-end">AMOUNT IN:</td>
                        <td className="text-success text-end">{total_today_cash_in_amt.toFixed(2)}</td>
                        <td className="text-success text-end">{total_today_bank_in_amt.toFixed(2)}</td>
                        <td className="text-success text-end">{total_today_online_in_amt.toFixed(2)}</td>
                        <td className="text-success text-end">{total_today_card_in_amt.toFixed(2)}</td>
                        <td className="text-success text-end">{total_today_disc_in_amt.toFixed(2)}</td>
                        <td className="text-success text-end">{total_today_in_amt.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="fw-bold text-danger text-end">AMOUNT OUT:</td>
                        <td className="text-danger text-end">{total_today_cash_out_amt.toFixed(2)}</td>
                        <td className="text-danger text-end">{total_today_bank_out_amt.toFixed(2)}</td>
                        <td className="text-danger text-end">{total_today_online_out_amt.toFixed(2)}</td>
                        <td className="text-danger text-end">{total_today_card_out_amt.toFixed(2)}</td>
                        <td className="text-danger text-end">{total_today_disc_out_amt.toFixed(2)}</td>
                        <td className="text-danger text-end">{total_today_out_amt.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="fw-bold text-end text-brown">TODAY TOTAL:</td>
                        <td className="text-brown text-end">{total_today_cash_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_bank_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_online_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_card_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_disc_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_amt.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="fw-bold text-end">OPENING BALANCE:</td>
                        <td className="text-end">{total_open_cash_amt.toFixed(2)}</td>
                        <td className="text-end">{total_open_bank_amt.toFixed(2)}</td>
                        <td className="text-end">{total_open_online_amt.toFixed(2)}</td>
                        <td className="text-end">{total_open_card_amt.toFixed(2)}</td>
                        <td className="text-end">{total_open_disc_amt.toFixed(2)}</td>
                        <td className="text-end">{total_open_amt.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="fw-bold text-end text-brown">TODAY TOTAL:</td>
                        <td className="text-brown text-end">{total_today_cash_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_bank_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_online_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_card_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_disc_amt.toFixed(2)}</td>
                        <td className="text-brown text-end">{total_today_amt.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="fw-bold text-end">CLOSING AMOUNT:</td>
                        <td className="text-end">{total_close_cash_amt.toFixed(2)}</td>
                        <td className="text-end">{total_close_bank_amt.toFixed(2)}</td>
                        <td className="text-end">{total_close_online_amt.toFixed(2)}</td>
                        <td className="text-end">{total_close_card_amt.toFixed(2)}</td>
                        <td className="text-end">{total_close_disc_amt.toFixed(2)}</td>
                        <td className="text-end">{total_close_amt.toFixed(2)}</td>
                    </tr>
                    <tr className="fw-bold bg-final">
                        <td className="text-end bg-blue fs-6" >
                            FINAL TOTAL :
                        </td>
                        <td className="text-danger text-center bg-blue fs-6" colSpan={2}>
                            CR : {total_final_cr_amt.toFixed(2)}
                        </td>
                        <td className="text-success text-center bg-blue fs-6" colSpan={2}>
                            DR : {total_final_dr_amt.toFixed(2)}
                        </td>
                        <td className="text-dark text-center bg-blue fw-bold fs-6" colSpan={2}>
                          {total_close_final_amt.toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default DayBookSummary;