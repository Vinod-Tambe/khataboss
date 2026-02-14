import React from "react";
import List from "../common/List";

const FirmList = () => {
  const firmData = [
    {
      id: 1,
      firmName: "Tambe Jewellers",
      ownerName: "Vinod Tambe",
      gstNumber: "27ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      phone: "9876543210",
      email: "info@tambejewellers.com",
      address: "Hadapsar Main Road",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411028",
      createdAt: "2026-01-01",
      status: "Active",
    },
    {
      id: 2,
      firmName: "Royal Gold House",
      ownerName: "Amit Sharma",
      gstNumber: "27PQRSX5678L1Z2",
      panNumber: "PQRSX5678L",
      phone: "9123456780",
      email: "contact@royalgold.com",
      address: "MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      createdAt: "2026-01-15",
      status: "Active",
    },
    {
      id: 3,
      firmName: "Shree Ganesh Traders",
      ownerName: "Rahul Patil",
      gstNumber: "27LMNOP9876Z1Z3",
      panNumber: "LMNOP9876Z",
      phone: "9988776655",
      email: "support@sgtraders.in",
      address: "FC Road",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411004",
      createdAt: "2026-02-01",
      status: "Inactive",
    },
    {
      id: 4,
      firmName: "Sai Enterprises",
      ownerName: "Sneha Kulkarni",
      gstNumber: "29ASDFG4455P1Z7",
      panNumber: "ASDFG4455P",
      phone: "9012345678",
      email: "info@saienterprises.in",
      address: "Brigade Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      createdAt: "2026-02-10",
      status: "Pending",
    },
    {
      id: 5,
      firmName: "Omkar Finance Solutions",
      ownerName: "Rohan Deshmukh",
      gstNumber: "24ZXCVB1122K1Z8",
      panNumber: "ZXCVB1122K",
      phone: "9090909090",
      email: "contact@omkarfinance.com",
      address: "Satellite Road",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
      createdAt: "2026-03-01",
      status: "Active",
    },
  ];

  const columns = [
    { key: "id", title: "ID", orderable: true, searchable: true },
    { key: "firmName", title: "Firm Name", orderable: true, searchable: true },
    { key: "ownerName", title: "Owner Name", orderable: true, searchable: true },
    { key: "gstNumber", title: "GST Number", orderable: true, searchable: true },
    { key: "panNumber", title: "PAN Number", orderable: true, searchable: true },
    { key: "phone", title: "Phone", orderable: false, searchable: true },
    { key: "email", title: "Email", orderable: false, searchable: true },
    { key: "city", title: "City", orderable: true, searchable: true },
    { key: "state", title: "State", orderable: true, searchable: true },
    { key: "pincode", title: "Pincode", orderable: true, searchable: true },
    { key: "createdAt", title: "Created Date", orderable: true, searchable: true, dateFilter: true },
    { key: "status", title: "Status", orderable: true, searchable: true },
  ];

  const handleEdit = (rowData) => {
    alert(`Edit Firm: ${rowData.firmName}`);
  };

  const handleDelete = (rowData) => {
    if (window.confirm(`Are you sure you want to delete ${rowData.firmName}?`)) {
      alert("Firm deleted (mock)");
    }
  };

  const handlePrint = (rowData) => {
    alert(`Print Firm Details: ${rowData.firmName}`);
  };

  return (
    <div>
      <List
        data={firmData}
        columns={columns}
        title="All Firm List"
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

export default FirmList;
