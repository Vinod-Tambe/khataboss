import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaticDataList from '../../components/common/StaticDataList';

const loanColumns = [
  { key: 'loan_no', title: 'Loan No', orderable: true, searchable: true },
  { key: 'customer_name', title: 'Customer', orderable: true, searchable: true },
  { key: 'mobile', title: 'Mobile', orderable: true, searchable: true },
  { key: 'principal', title: 'Principal', orderable: true, searchable: true },
  { key: 'interest', title: 'Interest', orderable: true, searchable: true },
  { key: 'start_date', title: 'Start Date', orderable: true, searchable: true },
  { key: 'type', title: 'Type', orderable: true, searchable: true },
  { key: 'status', title: 'Status', orderable: true, searchable: true },
];

const ACTIVE_LOANS = [
  { loan_no: 'L-2001', customer_name: 'Ramesh Patil', mobile: '9876543210', principal: '25000.00', interest: '1250.00', start_date: '12-01-2026', type: 'Secured', status: 'Active' },
  { loan_no: 'L-2002', customer_name: 'Sita Sharma', mobile: '9123456780', principal: '18000.00', interest: '900.00', start_date: '28-02-2026', type: 'Unsecured', status: 'Active' },
  { loan_no: 'L-2003', customer_name: 'Amit Deshmukh', mobile: '9988776655', principal: '40000.00', interest: '2000.00', start_date: '10-03-2026', type: 'Secured', status: 'Active' },
];

const RELEASE_LOANS = [
  { loan_no: 'L-1901', customer_name: 'Priya Kulkarni', mobile: '9765432109', principal: '15000.00', interest: '750.00', start_date: '05-05-2025', type: 'Secured', status: 'Released' },
  { loan_no: 'L-1902', customer_name: 'Vikram Jadhav', mobile: '9654321098', principal: '22000.00', interest: '1100.00', start_date: '20-07-2025', type: 'Secured', status: 'Released' },
];

const AUCTION_LOANS = [
  { loan_no: 'L-1801', customer_name: 'Neha More', mobile: '9898989898', principal: '30000.00', interest: '4500.00', start_date: '15-04-2025', type: 'Secured', status: 'Auction' },
  { loan_no: 'L-1802', customer_name: 'Suresh Kale', mobile: '9012345678', principal: '12000.00', interest: '1800.00', start_date: '02-06-2025', type: 'Secured', status: 'Auction' },
];

const TRANSFER_LOANS = [
  { loan_no: 'L-1701', customer_name: 'Anil Pawar', mobile: '9345678901', principal: '28000.00', interest: '1400.00', start_date: '11-03-2025', type: 'Secured', status: 'Transferred' },
  { loan_no: 'L-1702', customer_name: 'Meena Shinde', mobile: '9456789012', principal: '35000.00', interest: '1750.00', start_date: '25-09-2025', type: 'Unsecured', status: 'Transferred' },
];

const ActiveLoanList = () => (
  <StaticDataList
    title="Active Loan List"
    columns={loanColumns}
    data={ACTIVE_LOANS}
    searchPlaceholder="Search active loans..."
  />
);

const ReleaseLoanList = () => (
  <StaticDataList
    title="Release Loan List"
    columns={loanColumns}
    data={RELEASE_LOANS}
    searchPlaceholder="Search release loans..."
  />
);

const AuctionLoanList = () => (
  <StaticDataList
    title="Auction Loan List"
    columns={loanColumns}
    data={AUCTION_LOANS}
    searchPlaceholder="Search auction loans..."
  />
);

const TransferLoanList = () => (
  <StaticDataList
    title="Transfer Loan List"
    columns={loanColumns}
    data={TRANSFER_LOANS}
    searchPlaceholder="Search transfer loans..."
  />
);

const LoanRoutes = () => (
  <Routes>
    <Route path="/active-list" element={<ActiveLoanList />} />
    <Route path="/release-list" element={<ReleaseLoanList />} />
    <Route path="/auction-list" element={<AuctionLoanList />} />
    <Route path="/transfer-list" element={<TransferLoanList />} />
  </Routes>
);

export default LoanRoutes;
