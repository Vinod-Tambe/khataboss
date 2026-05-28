import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import List from "../common/List";
import { getAccounts, deleteAccount, getAccountTotals } from "../../api/accountApi";
import { toast } from "react-hot-toast";
import moment from "moment";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [totals, setTotals] = useState({ debitTotal: 0, creditTotal: 0, difference: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { selectedFirmId } = useSelector((state) => state.firm);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const firmFilter = selectedFirmId === 'all' ? null : selectedFirmId;
      const [accountsResponse, totalsResponse] = await Promise.all([
        getAccounts(firmFilter),
        getAccountTotals(firmFilter)
      ]);
      setAccounts(accountsResponse.data || []);
      setTotals(totalsResponse.data || { debitTotal: 0, creditTotal: 0, difference: 0 });
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [selectedFirmId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const handleAccountClick = (e) => {
      const target = e.target.closest(".account-link");
      if (target) {
        const uuid = target.getAttribute("data-uuid");
        if (uuid) {
          navigate(`/account/details/${uuid}`);
        }
      }
    };

    document.addEventListener("click", handleAccountClick);
    return () => {
      document.removeEventListener("click", handleAccountClick);
    };
  }, [navigate]);

  const columns = React.useMemo(() => [
    { key: "acc_id", title: "ID", orderable: true, searchable: true },
    { key: "firm", title: "Firm Name", orderable: true, searchable: true, render: (val) => val?.firm_name || "N/A" },
    {
      key: "acc_name",
      title: "Account Name",
      orderable: true,
      searchable: true,
      render: (val, type, row) => {
        return `<span class="text-brown cursor-pointer fw-bold account-link" data-uuid="${row.acc_uuid}">${val}</span>`;
      }
    },
    { key: "acc_pre_acc", title: "Primary Account", orderable: true, searchable: true },
    {
      key: "acc_opening_date",
      title: "Opening Balance Date",
      orderable: true,
      searchable: true,
      dateFilter: true,
      render: (val) => val ? moment(val).format("DD/MM/YYYY") : "N/A"
    },
    { key: "acc_cash_balance", title: "Account Balance", orderable: true, searchable: true, sum: true },
    { key: "acc_balance_type", title: "Balance Type", orderable: true, searchable: true },
    { key: "acc_bank_no", title: "Bank Account Number", orderable: false, searchable: true },
    { key: "acc_ifsc_code", title: "IFSC Code", orderable: true, searchable: true },
    { key: "acc_branch_name", title: "Branch Name", orderable: true, searchable: true },
    // { key: "acc_pan_no", title: "PAN Number", orderable: true, searchable: true },
    // { key: "acc_bsr_no", title: "BSR Code", orderable: true, searchable: true },
    // { key: "acc_address", title: "Bank Address", orderable: false, searchable: true },
    // { key: "acc_pincode", title: "Pincode", orderable: true, searchable: true },
  ], []);

  const handleEdit = (rowData) => {
    navigate(`/account/edit/${rowData.acc_uuid}`);
  };

  const handleDelete = async (rowData) => {
    try {
      await deleteAccount(rowData.acc_uuid);
      toast.success("Account deleted successfully");
      fetchAccounts();
    } catch (error) {
      toast.error(error.message || "Error deleting account");
    }
  };

  const handlePrint = (rowData) => {
    alert(`Print Account Details: ${rowData.acc_name}`);
  };

  return (
    <div>
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <List
          data={accounts}
          columns={columns}
          title="All Account List"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPrint={handlePrint}
          hasEdit={true}
          hasDelete={true}
          hasPrint={false}
          deleteConfirmMessage={(row) => `Are you sure you want to delete account: ${row?.acc_name}?`}
        />
      )}
      <div className="row p-3 m-1">
        <div className="col-6"></div>
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light text-uppercase">Debit Amount :</div>
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light">
          {Number(totals.debitTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DR
        </div>
        <div className="col-6"></div>
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light text-uppercase">Credit Amount :</div>
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light">
          {Number(totals.creditTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CR
        </div>
        <div className="col-6"></div>
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light text-uppercase">Difference Amount :</div>
        <div className={`col-3 bg-white border border-secondary text-end fw-bold p-1 bg-light ${totals.difference > 0 ? "text-danger" : "text-dark"}`}>
          {Number(totals.difference || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default AccountList;
