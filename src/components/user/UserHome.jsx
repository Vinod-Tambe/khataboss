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
import { formatTimePeriod } from "../../utils/formatTimePeriod";
import "../../css/Home.css";

const LAST_N = 5;

const formatAmt = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ClickableCell = ({ children, onClick }) => (
  <span className="text-brown cursor-pointer fw-bold" onClick={onClick}>
    {children}
  </span>
);

const UserHome = () => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);

  const [financeList, setFinanceList] = useState([]);
  const [loanList, setLoanList] = useState([]);
  const [transactionList, setTransactionList] = useState([]);
  const [loading, setLoading] = useState(false);
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

      setLoading(true);
      try {
        const dashboardRes = await getUserDashboard({
          userId: selectedUser.user_id,
          firmId: selectedFirm?.firm_id
        });

        const { totals, latestFinances, latestLoans, latestTransactions } = dashboardRes.data;

        // Set Totals
        setTotals(totals);

        // Set Finance List (last 5) with detailed info
        const dynamicFinances = (latestFinances || []).slice(0, LAST_N).map((f) => {
          const emis = Array.isArray(f.finance_trans) ? f.finance_trans : [];
          const totalEmis = Number(f.fin_no_of_emi) || emis.length || 0;
          const paidEmis = emis.filter((t) => String(t.ft_emi_status).toUpperCase() === "PAID").length;
          const pendingEmis = Math.max(0, totalEmis - paidEmis);
          const pendingAmt = emis.reduce((sum, t) => sum + (Number(t.ft_pending_amt) || 0), 0);

          return {
            ...f,
            id: f.fin_id,
            finNo: f.fin_unique_code || `Fin-${f.fin_id}`,
            principal: formatAmt(f.fin_prin_amt),
            emi: formatAmt(f.fin_emi_amt),
            finalAmt: formatAmt(f.fin_final_amt),
            collectedAmt: formatAmt(f.fin_collec_amt),
            pendingAmt: formatAmt(pendingAmt),
            noOfEmi: totalEmis || "-",
            paidEmi: paidEmis,
            pendingEmi: pendingEmis,
            emiProgress: totalEmis ? `${paidEmis}/${totalEmis}` : "-",
            roi: f.fin_roi != null && f.fin_roi !== "" ? `${f.fin_roi}%` : "-",
            freq: f.fin_freq_type || "-",
            startDate: f.fin_start_date ? moment(f.fin_start_date).format("DD-MM-YYYY") : "-",
            cash: formatAmt(f.fin_cash_amt),
            bank: formatAmt(f.fin_bank_amt),
            online: formatAmt(f.fin_online_amt),
            card: formatAmt(f.fin_card_amt),
            firmName: f.firm?.firm_name || "-",
            otherInfo: f.fin_other_info || "-",
            status: f.fin_status,
          };
        });
        setFinanceList(dynamicFinances);

        // Set Loan List (last 5) with detailed info
        const dynamicLoans = (latestLoans || []).slice(0, LAST_N).map((l) => {
          const startDate = l.girv_start_date ? moment(l.girv_start_date) : null;
          // Active loans have no stored end date — use today (same as Loan Info)
          const endDate = moment();
          const roiType = l.girv_roi_type ? String(l.girv_roi_type).toUpperCase() : "";
          return {
            ...l,
            id: l.girv_id,
            loanNo: l.girv_unique_code || l.girv_loan_no || `Loan-${l.girv_id}`,
            principal: formatAmt(l.girv_prin_amt),
            finalAmt: formatAmt(l.girv_final_amt),
            roi: l.girv_roi != null && l.girv_roi !== "" ? `${l.girv_roi}%${roiType ? ` ${roiType}` : ""}` : "-",
            type: l.girv_type ? String(l.girv_type).toUpperCase() : "-",
            startDate: startDate?.isValid() ? startDate.format("DD-MM-YYYY") : "-",
            endDate: endDate.format("DD-MM-YYYY"),
            timePeriod: startDate?.isValid() ? formatTimePeriod(startDate, endDate) : "-",
            packetNo: l.girv_packet_no || "-",
            lockerNo: l.girv_locker_no || "-",
            cash: formatAmt(l.girv_cash_amt),
            bank: formatAmt(l.girv_bank_amt),
            online: formatAmt(l.girv_online_amt),
            card: formatAmt(l.girv_card_amt),
            otherInfo: l.girv_other_info || "-",
            status: l.girv_status,
          };
        });
        setLoanList(dynamicLoans);

        // Set Transaction List (last 5)
        const dynamicTransactions = (latestTransactions || []).slice(0, LAST_N).map(t => {
          const fmTrans = t.financeMoneyTransactions?.[0];
          const finId = t.fin_id || fmTrans?.fm_fin_id;
          return {
            id: t.jrnl_id,
            transNo: t.transNo || `TR-${t.jrnl_id}`,
            amount: `₹${(t.jrnl_amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            type: t.jrnl_panel,
            category: t.jrnl_panel,
            date: moment(t.jrnl_date).format("DD-MM-YYYY"),
            finCode: t.fin_code,
            originalFinId: finId || null,
            girvCode: t.girv_code,
            originalGirvId: t.girv_id || null,
            otherInfo: t.jrnl_other_info || "",
            status: "Active"
          };
        });
        setTransactionList(dynamicTransactions);

      } catch (error) {
        console.error("Error fetching user dashboard data:", error);
      } finally {
        setLoading(false);
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
    {
      header: "Fin No",
      key: "finNo",
      render: (row) => (
        <ClickableCell onClick={() => handleViewFinance(row.id)}>{row.finNo}</ClickableCell>
      ),
    },
    { header: "Status", key: "status" },
    {
      header: "Start Date",
      key: "startDate",
      render: (row) => (
        <ClickableCell onClick={() => handleViewFinance(row.id)}>{row.startDate}</ClickableCell>
      ),
    },
    { header: "Principal", key: "principal" },
    { header: "EMI Amt", key: "emi" },
    { header: "EMIs", key: "emiProgress" },
    { header: "Collected", key: "collectedAmt" },
    { header: "Pending", key: "pendingAmt" },
    { header: "ROI", key: "roi" },
    { header: "Freq", key: "freq" },
    { header: "Final Amt", key: "finalAmt" },
    { header: "Cash", key: "cash" },
    { header: "Bank", key: "bank" },
    { header: "Online", key: "online" },
    { header: "Card", key: "card" },
  ];

  const loanColumns = [
    {
      header: "Loan No",
      key: "loanNo",
      render: (row) => (
        <ClickableCell onClick={() => handleViewLoan(row.id)}>{row.loanNo}</ClickableCell>
      ),
    },
    { header: "Status", key: "status" },
    {
      header: "Start Date",
      key: "startDate",
      render: (row) => (
        <ClickableCell onClick={() => handleViewLoan(row.id)}>{row.startDate}</ClickableCell>
      ),
    },
    { header: "End Date", key: "endDate" },
    { header: "T.Period", key: "timePeriod" },
    { header: "Type", key: "type" },
    { header: "Principal", key: "principal" },
    { header: "ROI", key: "roi" },
    { header: "Packet", key: "packetNo" },
    { header: "Locker", key: "lockerNo" },
    { header: "Final Amt", key: "finalAmt" },
    { header: "Cash", key: "cash" },
    { header: "Bank", key: "bank" },
    { header: "Online", key: "online" },
    { header: "Card", key: "card" },
  ];

  const getTransactionLink = (row) => {
    if (row.originalGirvId || row.girvCode) {
      const labelRef = row.girvCode || (row.originalGirvId ? `LN-${row.originalGirvId}` : '');
      return {
        label: labelRef ? `${row.category} (${labelRef})` : row.category,
        onClick: row.originalGirvId || row.girvCode ? () => handleViewLoan(row.girvCode || row.originalGirvId) : undefined,
      };
    }
    if (row.originalFinId || row.finCode) {
      const labelRef = row.finCode || (row.originalFinId ? `FIN-${row.originalFinId}` : '');
      return {
        label: labelRef ? `${row.category} (${labelRef})` : row.category,
        onClick: row.originalFinId || row.finCode ? () => handleViewFinance(row.finCode || row.originalFinId) : undefined,
      };
    }
    return {
      label: row.category,
      onClick: undefined,
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
      {loading && (
        <div className="text-center text-muted py-2 mb-2">
          <span className="spinner-border spinner-border-sm me-2" role="status" />
          Updating dashboard…
        </div>
      )}
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
