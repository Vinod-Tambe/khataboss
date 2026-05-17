import React, { useState } from 'react';
import List from '../common/List';
import moment from 'moment';
import HistoryReceiptModal from './HistoryReceiptModal';

const FinanceHistory = ({ data = [], isLoading, financeData, initialFinance }) => {
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
    const [selectedHistoryData, setSelectedHistoryData] = useState(null);

    const handlePrintPreview = (row) => {
        setSelectedHistoryData(row);
        setIsPrintPreviewOpen(true);
    };

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
        {
            key: "action",
            title: "Actions",
            orderable: false,
            searchable: false,
            className: "text-center",
            render: (val, type, row) => {
                return `<button class="btn btn-sm btn-link text-warning p-0 print-btn" data-id="${row.id || ''}" title="Print Receipt"><i class="bi bi-printer-fill fs-6"></i></button>`;
            }
        }
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
                onPrint={handlePrintPreview}
            />
            <HistoryReceiptModal
                show={isPrintPreviewOpen}
                onHide={() => {
                    setIsPrintPreviewOpen(false);
                    setSelectedHistoryData(null);
                }}
                historyData={selectedHistoryData}
                initialFinance={initialFinance}
            />
        </div>
    );
};

export default FinanceHistory;
