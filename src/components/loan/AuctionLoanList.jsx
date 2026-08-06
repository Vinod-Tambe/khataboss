import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuctionLoans } from "../../api/auctionApi";
import { toast } from "react-toastify";
import moment from "moment";
import List from "../common/List";

const AuctionLoanList = ({ global = false }) => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        firmId: selectedFirm?.firm_id,
      };
      if (!global && selectedUser?.user_id) {
        filters.userId = selectedUser.user_id;
      }
      
      const response = await getAuctionLoans(filters);
      setLoans(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error("Error fetching auction loans:", error);
      toast.error("Failed to load auction loan records");
    } finally {
      setLoading(false);
    }
  }, [selectedFirm?.firm_id, selectedUser?.user_id, global]);

  useEffect(() => {
    if (global || selectedUser?.user_id) {
      fetchLoans();
    }
  }, [selectedUser?.user_id, global, fetchLoans]);

  const handleView = (rowData) => {
    if (rowData.girviDetails) {
      navigate("/user/home/loan-info", { state: { loan: rowData.girviDetails } });
    }
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: "al_girv_id",
        title: "Loan No",
        render: (data) => `${data}.`
      },
      {
        key: "al_date",
        title: "Auction Date",
        dateFilter: true,
        render: (data) => data ? `<span class="fw-bold text-brown">${moment(data).format("DD-MM-YYYY")}</span>` : "-"
      }
    ];

    if (global) {
      cols.push({
        key: "al_girv_id",
        title: "Original Customer",
        searchable: true,
        render: (data, type, row) => row.originalCustomerName || "-"
      });
      cols.push({
        key: "al_girv_id",
        title: "Cust Mobile",
        searchable: true,
        render: (data, type, row) => row.originalCustomerMobile || "-"
      });
    }

    cols.push(
      {
        key: "al_girv_id",
        title: "Auction Buyer",
        searchable: true,
        render: (data, type, row) => row.buyerDetails?.au_full_name || "-"
      },
      {
        key: "al_girv_id",
        title: "Buyer Mobile",
        searchable: true,
        render: (data, type, row) => row.buyerDetails?.au_mobile || "-"
      },
      {
        key: "al_prin_amt",
        title: "Principal",
        sum: true,
        render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      {
        key: "al_int_amt",
        title: "Interest",
        sum: true,
        render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      },
      {
        key: "al_payable_amt",
        title: "Payable Amt",
        sum: true,
        render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    );

    return cols;
  }, [global]);

  const actionButtons = [
    {
      label: "View Loan",
      icon: "bi-eye",
      className: "btn-outline-primary",
      onClick: handleView
    }
  ];

  return (
    <List
      title={global ? "Global Auction Loans" : "Auction Loan Details"}
      data={loans}
      columns={columns}
      loading={loading}
      searchPlaceholder="Search auction loans..."
      hasEdit={false}
      hasDelete={false}
      hasView={false}
      customActions={actionButtons}
    />
  );
};

export default AuctionLoanList;
