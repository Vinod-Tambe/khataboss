import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuctionLoans } from "../../api/auctionApi";
import { toast } from "react-toastify";
import moment from "moment";
import List from "../common/List";
import { setSelectedUser } from "../../store/slices/userSlice";

const AuctionLoanList = ({ global = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  const handleCustomerHome = (rowData) => {
    const user = rowData?.originalCustomer;
    const userId = user?.user_id || rowData?.girviDetails?.girv_user_id;
    if (!userId) {
      toast.error("Customer details not found");
      return;
    }
    dispatch(setSelectedUser({
      ...user,
      user_id: userId,
      user_uuid: user?.user_uuid,
      user_first_name: user?.user_first_name || "",
      user_last_name: user?.user_last_name || "",
      user_mobile_no: user?.user_mobile_no || rowData?.originalCustomerMobile || "",
    }));
    navigate("/user/home");
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
        customerHome: true,
        render: (data, type, row) => {
          const name = row.originalCustomerName || "-";
          if (type !== "display") return name;
          return `<span class="text-brown fw-bold cursor-pointer customer-home-btn" title="Open customer home">${name}</span>`;
        }
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

  return (
    <List
      title={global ? "Global Auction Loans" : "Auction Loan Details"}
      data={loans}
      columns={columns}
      primaryKey="al_girv_id"
      subtitleKey="al_date"
      amountKey="al_payable_amt"
      isLoading={loading}
      hasEdit={false}
      hasDelete={false}
      hasView={true}
      onView={handleView}
      onCustomerHome={global ? handleCustomerHome : undefined}
      showFooter={true}
    />
  );
};

export default AuctionLoanList;
