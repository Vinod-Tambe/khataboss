import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaticDataList from '../../components/common/StaticDataList';

const financeColumns = [
  { key: 'fin_no', title: 'Fin No', orderable: true, searchable: true },
  { key: 'customer_name', title: 'Customer', orderable: true, searchable: true },
  { key: 'mobile', title: 'Mobile', orderable: true, searchable: true },
  { key: 'principal', title: 'Principal', orderable: true, searchable: true },
  { key: 'emi_amt', title: 'EMI Amount', orderable: true, searchable: true },
  { key: 'pending_emi', title: 'Pending EMI', orderable: true, searchable: true },
  { key: 'start_date', title: 'Start Date', orderable: true, searchable: true },
  { key: 'status', title: 'Status', orderable: true, searchable: true },
];

const ACTIVE_FINANCE = [
  { fin_no: 'F-1001', customer_name: 'Ramesh Patil', mobile: '9876543210', principal: '50000.00', emi_amt: '2500.00', pending_emi: '8', start_date: '15-01-2026', status: 'Active' },
  { fin_no: 'F-1002', customer_name: 'Sita Sharma', mobile: '9123456780', principal: '30000.00', emi_amt: '1800.00', pending_emi: '5', start_date: '22-02-2026', status: 'Active' },
  { fin_no: 'F-1003', customer_name: 'Amit Deshmukh', mobile: '9988776655', principal: '75000.00', emi_amt: '4200.00', pending_emi: '12', start_date: '05-03-2026', status: 'Active' },
];

const CLOSE_FINANCE = [
  { fin_no: 'F-0901', customer_name: 'Priya Kulkarni', mobile: '9765432109', principal: '20000.00', emi_amt: '2000.00', pending_emi: '0', start_date: '10-06-2025', status: 'Closed' },
  { fin_no: 'F-0902', customer_name: 'Vikram Jadhav', mobile: '9654321098', principal: '45000.00', emi_amt: '3000.00', pending_emi: '0', start_date: '18-08-2025', status: 'Closed' },
];

const TODAY_PENDING_EMI = [
  { fin_no: 'F-1001', customer_name: 'Ramesh Patil', mobile: '9876543210', principal: '50000.00', emi_amt: '2500.00', pending_emi: '1', start_date: '05-08-2026', status: 'Due Today' },
  { fin_no: 'F-1004', customer_name: 'Neha More', mobile: '9898989898', principal: '15000.00', emi_amt: '1500.00', pending_emi: '1', start_date: '05-08-2026', status: 'Due Today' },
  { fin_no: 'F-1005', customer_name: 'Suresh Kale', mobile: '9012345678', principal: '60000.00', emi_amt: '3500.00', pending_emi: '1', start_date: '05-08-2026', status: 'Due Today' },
];

const ActiveFinanceList = () => (
  <StaticDataList
    title="Active Finance List"
    columns={financeColumns}
    data={ACTIVE_FINANCE}
    searchPlaceholder="Search active finance..."
  />
);

const CloseFinanceList = () => (
  <StaticDataList
    title="Close Finance List"
    columns={financeColumns}
    data={CLOSE_FINANCE}
    searchPlaceholder="Search closed finance..."
  />
);

const TodayPendingEmiList = () => (
  <StaticDataList
    title="Today Pending EMI"
    columns={financeColumns}
    data={TODAY_PENDING_EMI}
    searchPlaceholder="Search pending EMI..."
  />
);

const FinanceRoutes = () => (
  <Routes>
    <Route path="/active-list" element={<ActiveFinanceList />} />
    <Route path="/close-list" element={<CloseFinanceList />} />
    <Route path="/today-pending-emi" element={<TodayPendingEmiList />} />
  </Routes>
);

export default FinanceRoutes;
