import React from "react";
import UserHomeList from "../common/UserHomeList";

const UserHome = () => {
  // ================= DYNAMIC DATA =================
  const loanList = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `loan${i + 1}@test.com`,
    phone: `98765432${10 + i}`,
    city: ["Pune", "Mumbai", "Nagpur"][i % 3],
    company: ["TCS", "Infosys", "Wipro"][i % 3],
    status: i % 2 === 0 ? "Active" : "Inactive",
  }));

  const financeList = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `finance${i + 1}@test.com`,
    phone: `91234567${10 + i}`,
    city: ["Delhi", "Bangalore", "Hyderabad"][i % 3],
    company: ["HDFC", "ICICI", "Axis"][i % 3],
    status: "Active",
  }));
  const LastTransactionList = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `finance${i + 1}@test.com`,
    phone: `91234567${10 + i}`,
    city: ["Delhi", "Bangalore", "Hyderabad"][i % 3],
    company: ["HDFC", "ICICI", "Axis"][i % 3],
    status: "Active",
  }));

  return (
  <div className="card p-0 p-md-3 pt-2 border-0">
      {/* ================= TABLES ================= */}
      <UserHomeList title="Active Loan List" data={loanList} />
      <UserHomeList title="Active Finance List" data={financeList} />
      <UserHomeList title="Last Transaction" data={LastTransactionList} />
    </div>
  );
};

export default UserHome;
