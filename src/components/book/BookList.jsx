import React from 'react'
import List from '../common/List'

const BookList = () => {
const journalData = [
  {
    date: "2026-01-01",
    transactionDetails: "Opening Cash Balance",
    debit: 50000,
    credit: 0,
  },
  {
    date: "2026-01-03",
    transactionDetails: "Goods Purchased",
    debit: 15000,
    credit: 0,
  },
  {
    date: "2026-01-05",
    transactionDetails: "Cash Sales",
    debit: 0,
    credit: 20000,
  },
  {
    date: "2026-01-07",
    transactionDetails: "Office Rent Paid",
    debit: 8000,
    credit: 0,
  },
  {
    date: "2026-01-10",
    transactionDetails: "Bank Deposit",
    debit: 0,
    credit: 12000,
  },
  {
    date: "2026-01-12",
    transactionDetails: "Electricity Bill Payment",
    debit: 3000,
    credit: 0,
  },
  {
    date: "2026-01-15",
    transactionDetails: "Customer Payment Received",
    debit: 0,
    credit: 25000,
  },
  {
    date: "2026-01-18",
    transactionDetails: "Salary Paid",
    debit: 10000,
    credit: 0,
  },
  {
    date: "2026-01-22",
    transactionDetails: "Online Sales",
    debit: 0,
    credit: 18000,
  },
  {
    date: "2026-01-25",
    transactionDetails: "Furniture Purchase",
    debit: 12000,
    credit: 0,
  },
  {
    date: "2026-01-28",
    transactionDetails: "Loan Received",
    debit: 0,
    credit: 50000,
  },
  {
    date: "2026-01-30",
    transactionDetails: "Internet Bill Payment",
    debit: 2000,
    credit: 0,
  },
];
const columns = [
  { key: "date", title: "Date", orderable: true, searchable: true, dateFilter: true},
  { key: "transactionDetails", title: "Transaction Details", orderable: true, searchable: true },
  { key: "debit", title: "Debit", orderable: true, searchable: true },
  { key: "credit", title: "Credit", orderable: true, searchable: true },
];

  const handleEdit = (rowData) => {
    alert(rowData);
  };

  const handleDelete = (rowData) => {
    if (window.confirm(`Are you sure you want to delete user: ${rowData.name} (ID: ${rowData.id})?`)) {
      alert(rowData);
    }
  };

  const handlePrint = (rowData) => {
    // Replace with your custom invoice print logic
    alert(rowData);
  };

  return (
    <div>
      <List
        data={journalData}
        columns={columns}
        title="Journal Book"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
        hasEdit={false}
        hasDelete={false}
        hasPrint={false}
      />
    </div>
  )
}

export default BookList
