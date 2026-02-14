import React from "react";
import List from "../common/List";

const AccountList = () => {
  const accountData = [
    {
      id: 1,
      accountName: "HDFC Current Account",
      openingBalanceDate: "2026-01-01",
      accountBalance: "₹1,50,000",
      balanceType: "Debit",
      primaryAccount: "Yes",
      bankAccountNumber: "50200012345678",
      ifscCode: "HDFC0001234",
      branchName: "Hadapsar",
      panNumber: "ABCDE1234F",
      bsrCode: "1234567",
      bankAddress: "Hadapsar, Pune, Maharashtra",
      pincode: "411028",
    },
    {
      id: 2,
      accountName: "SBI Savings Account",
      openingBalanceDate: "2026-01-10",
      accountBalance: "₹75,000",
      balanceType: "Credit",
      primaryAccount: "No",
      bankAccountNumber: "325689741258",
      ifscCode: "SBIN0005678",
      branchName: "Kothrud",
      panNumber: "PQRSX5678L",
      bsrCode: "2345678",
      bankAddress: "Kothrud, Pune, Maharashtra",
      pincode: "411038",
    },
    {
      id: 3,
      accountName: "ICICI Business Account",
      openingBalanceDate: "2026-02-01",
      accountBalance: "₹2,20,000",
      balanceType: "Debit",
      primaryAccount: "Yes",
      bankAccountNumber: "784512369852",
      ifscCode: "ICIC0009876",
      branchName: "Viman Nagar",
      panNumber: "LMNOP9876Z",
      bsrCode: "3456789",
      bankAddress: "Viman Nagar, Pune, Maharashtra",
      pincode: "411014",
    },
    {
      id: 4,
      accountName: "Axis Salary Account",
      openingBalanceDate: "2026-02-15",
      accountBalance: "₹55,000",
      balanceType: "Credit",
      primaryAccount: "No",
      bankAccountNumber: "456987123654",
      ifscCode: "UTIB0001122",
      branchName: "Baner",
      panNumber: "ZXCVB1122K",
      bsrCode: "4567890",
      bankAddress: "Baner, Pune, Maharashtra",
      pincode: "411045",
    },
    {
      id: 5,
      accountName: "Kotak Business Account",
      openingBalanceDate: "2026-03-01",
      accountBalance: "₹3,10,000",
      balanceType: "Debit",
      primaryAccount: "Yes",
      bankAccountNumber: "998877665544",
      ifscCode: "KKBK0004455",
      branchName: "Wakad",
      panNumber: "ASDFG4455P",
      bsrCode: "5678901",
      bankAddress: "Wakad, Pune, Maharashtra",
      pincode: "411057",
    },
  ];

  const columns = [
    { key: "id", title: "ID", orderable: true, searchable: true },
    { key: "accountName", title: "Account Name", orderable: true, searchable: true },
    { key: "openingBalanceDate", title: "Opening Balance Date", orderable: true, searchable: true, dateFilter: true },
    { key: "accountBalance", title: "Account Balance", orderable: true, searchable: true },
    { key: "balanceType", title: "Balance Type", orderable: true, searchable: true },
    { key: "primaryAccount", title: "Primary Account", orderable: true, searchable: true },
    { key: "bankAccountNumber", title: "Bank Account Number", orderable: false, searchable: true },
    { key: "ifscCode", title: "IFSC Code", orderable: true, searchable: true },
    { key: "branchName", title: "Branch Name", orderable: true, searchable: true },
    { key: "panNumber", title: "PAN Number", orderable: true, searchable: true },
    { key: "bsrCode", title: "BSR Code", orderable: true, searchable: true },
    { key: "bankAddress", title: "Bank Address", orderable: false, searchable: true },
    { key: "pincode", title: "Pincode", orderable: true, searchable: true },
  ];

  const handleEdit = (rowData) => {
    alert(`Edit Account: ${rowData.accountName} (ID: ${rowData.id})`);
  };

  const handleDelete = (rowData) => {
    if (window.confirm(`Are you sure you want to delete ${rowData.accountName}?`)) {
      alert("Account deleted (mock)");
    }
  };

  const handlePrint = (rowData) => {
    alert(`Print Account Details: ${rowData.accountName}`);
  };

  return (
    <div>
      <List
        data={accountData}
        columns={columns}
        title="All Account List"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
        hasEdit={true}
        hasDelete={true}
        hasPrint={true}
      />
    </div>
  );
};

export default AccountList;
