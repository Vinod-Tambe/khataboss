import React from 'react';
import List from '../common/List';
import moment from 'moment';

const FinanceHistory = ({ data = [], isLoading }) => {
    const columns = [
        { 
            key: "fm_trans_date", 
            title: "Date", 
            orderable: true, 
            searchable: true, 
            dateFilter: true,
            render: (val) => moment(val).format("DD-MM-YYYY")
        },
        { key: "fm_trans_amt", title: "Trans Amt", orderable: true, searchable: true, sum: true },
        { key: "fm_cash_amt", title: "Cash", orderable: true, searchable: true, sum: true },
        { key: "fm_bank_amt", title: "Bank", orderable: true, searchable: true, sum: true },
        { key: "fm_online_amt", title: "Online", orderable: true, searchable: true, sum: true },
        { key: "fm_card_amt", title: "Card", orderable: true, searchable: true, sum: true },
        { key: "fm_trans_type", title: "Trans Type", orderable: true, searchable: true },
        { key: "fm_other_info", title: "Other", orderable: true, searchable: true },
    ];

    return (
        <div>
            <List
                data={data}
                columns={columns}
                title="Finance Payment History"
                hasEdit={false}
                hasDelete={false}
                hasPrint={false}
                hasView={false}
                isLoading={isLoading}
                showFooter={true}
            />  </div>
    );
};

export default FinanceHistory;
