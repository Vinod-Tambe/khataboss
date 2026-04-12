import React from 'react';
import List from '../common/List';

const FinanceHistory = () => {
    const columns = [
        { key: "fm_trans_date", title: "Date", orderable: true, searchable: true, dateFilter: true },
        { key: "fm_trans_amt", title: "Trans Amt", orderable: true, searchable: true, sum: true },
        { key: "fm_cash_amt", title: "Cash", orderable: true, searchable: true, sum: true },
        { key: "fm_bank_amt", title: "Bank", orderable: true, searchable: true, sum: true },
        { key: "fm_online_amt", title: "Online", orderable: true, searchable: true, sum: true },
        { key: "fm_card_amt", title: "Card", orderable: true, searchable: true, sum: true },
        { key: "fm_trans_type", title: "Trans Type", orderable: true, searchable: true },
        { key: "fm_other_info", title: "Other", orderable: true, searchable: true },
    ];

    const historyData = [
        {
            fm_id: 1,
            fm_trans_date: "12-04-2026",
            fm_trans_amt: 5000,
            fm_cash_amt: 5000,
            fm_bank_amt: 0,
            fm_online_amt: 0,
            fm_card_amt: 0,
            fm_trans_type: "PAID",
            fm_other_info: "Full EMI Paid"
        },
        {
            fm_id: 2,
            fm_trans_date: "13-04-2026",
            fm_trans_amt: 2500,
            fm_cash_amt: 1000,
            fm_bank_amt: 1500,
            fm_online_amt: 0,
            fm_card_amt: 0,
            fm_trans_type: "PAID",
            fm_other_info: "Partial Payment"
        }
    ];

    return (
        <div>
            <List
                data={historyData}
                columns={columns}
                title="Finance Payment History"
                hasEdit={false}
                hasDelete={false}
                hasPrint={false}
                hasView={false}
                isLoading={false}
            />  </div>
    );
};

export default FinanceHistory;
