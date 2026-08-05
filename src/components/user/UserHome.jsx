import React, { useEffect, useState } from "react";
import UserHomeList from "../common/UserHomeList";
import UserHomeMobileLists from "./UserHomeMobileLists";
import InfoCard from "../common/InfoCard";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFinanceDetails } from "../../api/financeApi";
import { getGirviById } from "../../api/girviApi";
import { getUserDashboard } from "../../api/dashboardApi";
import moment from "moment";
import "../../css/Home.css";

const LAST_N = 5;

const UserHome = () => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);

  const [financeList, setFinanceList] = useState([]);
  const [loanList, setLoanList] = useState([]);
  const [transactionList, setTransactionList] = useState([]);
  const [totals, setTotals] = useState({
    totalActiveFinance: 0,
    totalCloseFinance: 0,
    totalActiveFinanceAmt: 0,
    totalCloseFinanceAmt: 0,
    totalActiveLoan: 0,
    totalReleaseLoan: 0,
    totalActiveLoanAmt: 0,
    totalReleaseLoanAmt: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUser?.user_id) return;

      try {
        const dashboardRes = await getUserDashboard({
          userId: selectedUser.user_id,
          firmId: selectedFirm?.firm_id
        });

        const { totals, latestFinances, latestLoans, latestTransactions } = dashboardRes.data;

        // Set Totals
        setTotals(totals);

        // Set Finance List (last 5)
        const dynamicFinances = (latestFinances || []).slice(0, LAST_N).map(f => ({
          ...f,
          id: f.fin_id,
          finNo: `Fin-${f.fin_id}`,
          principal: `${(f.fin_prin_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          emi: `${(f.fin_emi_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          startDate: moment(f.fin_start_date).format("DD-MM-YYYY"),
          status: f.fin_status
        }));
        setFinanceList(dynamicFinances);

        // Set Loan List (last 5)
        const dynamicLoans = (latestLoans || []).slice(0, LAST_N).map(l => ({
          ...l,
          id: l.girv_id,
          loanNo: `Loan-${l.girv_id}`,
          principal: `${(l.girv_prin_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          roi: `${l.girv_roi}%`,
          startDate: moment(l.girv_start_date).format("DD-MM-YYYY"),
          status: l.girv_status
        }));
        setLoanList(dynamicLoans);

        // Set Transaction List (last 5)
        const dynamicTransactions = (latestTransactions || []).slice(0, LAST_N).map(t => {
          const fmTrans = t.financeMoneyTransactions?.[0];
          const finId = fmTrans?.fm_fin_id;
          return {
            id: t.jrnl_id,
            transNo: `TR-${t.jrnl_id}`,
            amount: `₹${(t.jrnl_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            type: t.jrnl_panel,
            category: t.jrnl_panel,
            date: moment(t.jrnl_date).format("DD-MM-YYYY"),
            finId: finId ? `Fin-${finId}` : null,
            originalFinId: finId || null,
            otherInfo: t.jrnl_other_info || "",
            status: "Active"
          };
        });
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

  const handleViewLoan = async (loanId) => {
    try {
      const res = await getGirviById(loanId);
      const fullData = res.data || res;
      navigate("/user/home/loan-info", { state: { loan: fullData } });
    } catch (err) {
      console.error("Error viewing loan:", err);
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
          className="text-brown cursor-pointer fw-bold"
          onClick={() => handleViewFinance(row.id)}
        >
          {row.startDate}
        </span>
      )
    },
    { header: "Status", key: "status" }
  ];

  const loanColumns = [
    { header: "Loan No", key: "loanNo" },
    { header: "Principal", key: "principal" },
    { header: "ROI", key: "roi" },
    {
      header: "Start Date",
      key: "startDate",
      render: (row) => (
        <span
          className="text-brown cursor-pointer fw-bold"
          onClick={() => handleViewLoan(row.id)}
        >
          {row.startDate}
        </span>
      )
    },
    { header: "Status", key: "status" }
  ];

  const getTransactionLink = (row) => {
    const isLoan = row.category === "Girvi" || row.category === "Loan";
    if (isLoan) {
      const match = (row.otherInfo || "").match(/Girvi No\s*-\s*(\d+)/i);
      const loanId = match ? parseInt(match[1], 10) : null;
      const loanSuffix = loanId ? " (Loan-" + loanId + ")" : "";
      return {
        label: row.category + loanSuffix,
        onClick: loanId ? () => handleViewLoan(loanId) : undefined,
      };
    }
    const finSuffix = row.originalFinId ? " (Fin-" + row.originalFinId + ")" : "";
    return {
      label: row.category + finSuffix,
      onClick: row.originalFinId
        ? () => handleViewFinance(row.originalFinId)
        : undefined,
    };
  };

  const transactionColumns = [
    { header: "Trans No", key: "transNo" },
    { header: "Amount", key: "amount" },
    { header: "Type", key: "type" },
    {
      header: "Category",
      key: "category",
      render: (row) => {
        const link = getTransactionLink(row);
        return (
          <span
            className="text-brown cursor-pointer fw-bold"
            onClick={link.onClick}
          >
            {link.label}
          </span>
        );
      }
    },
    {
      header: "Date",
      key: "date",
      render: (row) => {
        const link = getTransactionLink(row);
        return (
          <span
            className="text-brown cursor-pointer fw-bold"
            onClick={link.onClick}
          >
            {row.date}
          </span>
        );
      }
    },
    { header: "Status", key: "status" }
  ];

  return (
    <div className="card p-0 p-md-3 pt-2 border-0">
      {/* ================= INFO CARDS ================= */}
      {/* Row 1: Counts */}
      <div className="row g-4 mb-3">
        <InfoCard
          title="Total Active Finance"
          value={totals.totalActiveFinance}
          icon="bi-file-earmark-check"
          colorClass="text-success"
          iconBgClass="bg-success-subtle"
        />
        <InfoCard
          title="Total Close Finance"
          value={totals.totalCloseFinance}
          icon="bi-file-earmark-x"
          colorClass="text-danger"
          iconBgClass="bg-danger-subtle"
        />
        <InfoCard
          title="Total Active Loan"
          value={totals.totalActiveLoan}
          icon="bi-bank"
          colorClass="text-primary"
          iconBgClass="bg-primary-subtle"
        />
        <InfoCard
          title="Total Release Loan"
          value={totals.totalReleaseLoan}
          icon="bi-journal-check"
          colorClass="text-purple"
          iconBgClass="bg-purple-subtle"
        />
      </div>

      {/* Row 2: Amounts */}
      <div className="row g-4 mb-4">
        <InfoCard
          title="Active Finance Amt"
          value={`₹${(totals.totalActiveFinanceAmt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="bi-currency-rupee"
          colorClass="text-info"
          iconBgClass="bg-info-subtle"
        />
        <InfoCard
          title="Close Finance Amt"
          value={`₹${(totals.totalCloseFinanceAmt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="bi-currency-rupee"
          colorClass="text-orange"
          iconBgClass="bg-orange-subtle"
        />
        <InfoCard
          title="Active Loan Amt"
          value={`₹${(totals.totalActiveLoanAmt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="bi-wallet2"
          colorClass="text-brown"
          iconBgClass="bg-brown-subtle"
        />
        <InfoCard
          title="Release Loan Amt"
          value={`₹${(totals.totalReleaseLoanAmt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="bi-wallet2"
          colorClass="text-secondary"
          iconBgClass="bg-secondary-subtle"
        />
      </div>

      {/* ================= TABLES (desktop) ================= */}
      <div className="d-none d-md-block">
        {financeList.length > 0 && (
          <div className="row">
            <div className="col-12">
              <UserHomeList
                title="Active Finance List"
                icon="bi-cash-stack"
                data={financeList}
                columns={financeColumns}
              />
            </div>
          </div>
        )}
        {loanList.length > 0 && (
          <div className="row">
            <div className="col-12">
              <UserHomeList
                title="Active Loan List"
                icon="bi-bank"
                data={loanList}
                columns={loanColumns}
              />
            </div>
          </div>
        )}
        {transactionList.length > 0 && (
          <div className="row mt-2">
            <div className="col-12">
              <UserHomeList
                title="Last Transaction"
                icon="bi-arrow-left-right"
                data={transactionList}
                columns={transactionColumns}
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= LISTS (mobile collapse) ================= */}
      <UserHomeMobileLists
        financeList={financeList}
        loanList={loanList}
        transactionList={transactionList}
        onViewFinance={handleViewFinance}
        onViewLoan={handleViewLoan}
        getTransactionLink={getTransactionLink}
      />
    </div>
  );
};

export default UserHome;
