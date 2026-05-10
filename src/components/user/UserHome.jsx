import React, { useEffect, useState } from "react";
import UserHomeList from "../common/UserHomeList";
import InfoCard from "../common/InfoCard";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFinanceDetails } from "../../api/financeApi";
import { getUserDashboard } from "../../api/dashboardApi";
import moment from "moment";
import "../../css/Home.css";

const UserHome = () => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);

  const [financeList, setFinanceList] = useState([]);
  const [transactionList, setTransactionList] = useState([]);
  const [totals, setTotals] = useState({
    totalFinanceAmount: 0,
    totalFinancePending: 0,
    totalLoanCount: 0,
    totalLoanAmount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUser?.user_id) return;

      try {
        const dashboardRes = await getUserDashboard({
          userId: selectedUser.user_id,
          firmId: selectedFirm?.firm_id
        });
        
        const { totals, latestFinances, latestTransactions } = dashboardRes.data;

        // Set Totals
        setTotals(totals);

        // Set Finance List
        const dynamicFinances = latestFinances.map(f => ({
          ...f,
          id: f.fin_id,
          finNo: `Fin-${f.fin_id}`,
          principal: `₹${f.fin_prin_amt.toLocaleString()}`,
          emi: `₹${f.fin_emi_amt.toLocaleString()}`,
          startDate: moment(f.fin_start_date).format("DD-MM-YYYY"),
          status: f.fin_status
        }));
        setFinanceList(dynamicFinances);

        // Set Transaction List
        const dynamicTransactions = latestTransactions.map(t => ({
          id: t.fm_id,
          transNo: `TR-${t.fm_id}`,
          amount: `₹${t.fm_trans_amt.toLocaleString()}`,
          type: t.fm_trans_type,
          category: t.fm_trans_panel || "Finance",
          date: moment(t.fm_trans_date).format("DD-MM-YYYY"),
          finId: `Fin-${t.fm_fin_id}`,
          originalFinId: t.fm_fin_id,
          status: t.fm_trans_type === "PAID" ? "Active" : "Inactive"
        }));
        setTransactionList(dynamicTransactions);

      } catch (error) {
        console.error("Error fetching user dashboard data:", error);
      }
    };

    fetchData();
  }, [selectedUser?.user_id, selectedFirm?.firm_id]);

  const handleViewFinance = async (finId) => {
    try {
      // Fetch full details before navigating to ensure all data is present
      const res = await getFinanceDetails(finId);
      const fullData = res.data || res;
      navigate("/user/home/finance", { state: { finance: fullData } });
    } catch (err) {
      console.error("Error viewing finance:", err);
    }
  };

  const financeColumns = [
    { header: "Fin No", key: "finNo" },
    { header: "Principal", key: "principal" },
    { header: "EMI Amount", key: "emi" },
    {
      header: "Start Date",
      key: "startDate",
      render: (row) => (
        <span
          className="text-primary cursor-pointer text-decoration-underline"
          onClick={() => handleViewFinance(row.id)}
        >
          {row.startDate}
        </span>
      )
    },
    { header: "Status", key: "status" }
  ];

  const transactionColumns = [
    { header: "Trans No", key: "transNo" },
    { header: "Amount", key: "amount" },
    { header: "Type", key: "type" },
    {
      header: "Category",
      key: "category",
      render: (row) => (
        <span
          className="text-primary cursor-pointer text-decoration-underline"
          onClick={() => handleViewFinance(row.originalFinId)}
        >
          {row.category} (Fin-{row.originalFinId})
        </span>
      )
    },
    {
      header: "Date",
      key: "date",
      render: (row) => (
        <span
          className="text-primary cursor-pointer text-decoration-underline"
          onClick={() => handleViewFinance(row.originalFinId)}
        >
          {row.date}
        </span>
      )
    }
  ];

  return (
    <div className="card p-0 p-md-3 pt-2 border-0">
      {/* ================= INFO CARDS ================= */}
      <div className="row g-4 mb-4">
        <InfoCard
          title="TOTAL FINANCE AMT"
          value={`₹${totals.totalFinanceAmount.toLocaleString()}`}
          icon="bi-currency-rupee"
          colorClass="text-success"
          iconBgClass="bg-success-subtle"
        />
        <InfoCard
          title="FINANCE PENDING"
          value={`₹${totals.totalFinancePending.toLocaleString()}`}
          icon="bi-clock-history"
          colorClass="text-danger"
          iconBgClass="bg-danger-subtle"
        />
        <InfoCard
          title="TOTAL LOAN"
          value={totals.totalLoanCount}
          icon="bi-bank"
          colorClass="text-primary"
          iconBgClass="bg-primary-subtle"
        />
        <InfoCard
          title="TOTAL LOAN AMT"
          value={`₹${totals.totalLoanAmount.toLocaleString()}`}
          icon="bi-wallet2"
          colorClass="text-warning"
          iconBgClass="bg-warning-subtle"
        />
      </div>

      {/* ================= TABLES ================= */}
      <UserHomeList
        title="Active Finance List"
        data={financeList}
        columns={financeColumns}
      />
      <UserHomeList
        title="Last Transaction"
        data={transactionList}
        columns={transactionColumns}
      />
    </div>
  );
};

export default UserHome;
