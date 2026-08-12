import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import List from "../common/List";
import { getFirms, deleteFirm } from "../../api/firmApi";
import { loadFirmsDropdown } from "../../store/slices/firmSlice";
import { toast } from "react-hot-toast";

const FirmList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFirms = async () => {
    try {
      setLoading(true);
      const response = await getFirms();
      // Backend returns { message, data: firms }
      setFirms(response.data || []);
    } catch (error) {
      console.error("Error fetching firms:", error);
      toast.error(error.message || "Failed to fetch firms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  const columns = [
    { 
      key: "firm_unique_code", 
      title: "Unique Code", 
      orderable: true, 
      searchable: true,
      render: (data, type, row) => row?.firm_unique_code || row?.firm_id
    },
    { key: "firm_name", title: "Firm Name", orderable: true, searchable: true },
    { key: "firm_owner", title: "Owner Name", orderable: true, searchable: true },
    { key: "firm_gstin_no", title: "GST Number", orderable: true, searchable: true },
    { key: "firm_pan_no", title: "PAN Number", orderable: true, searchable: true },
    { key: "firm_phone_no", title: "Phone", orderable: false, searchable: true },
    { key: "firm_email_id", title: "Email", orderable: false, searchable: true },
    { key: "firm_city", title: "City", orderable: true, searchable: true },
    { key: "firm_pincode", title: "Pincode", orderable: true, searchable: true },
    {
      key: "firm_add_date",
      title: "Created Date",
      orderable: true,
      searchable: true,
      dateFilter: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : "-"
    },
  ];

  const handleEdit = (rowData) => {
    navigate(`/firm/edit/${rowData.firm_uuid}`);
  };

  const handleDelete = async (rowData) => {
    try {
      const response = await deleteFirm(rowData.firm_uuid);
      toast.success(response.message || "Firm deleted successfully.");
      fetchFirms();
      dispatch(loadFirmsDropdown());
    } catch (error) {
      console.error("Error deleting firm:", error);
      toast.error(error.message || "Failed to delete firm.");
    }
  };

  const handlePrint = (rowData) => {
    alert(`Print Firm Details: ${rowData.firm_name}`);
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
          data={firms}
          columns={columns}
          title="All Firm List"
          primaryKey="firm_name"
          subtitleKey="firm_add_date"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPrint={handlePrint}
          hasEdit={true}
          hasDelete={true}
          hasPrint={true}
          showFooter={false}
          deleteConfirmMessage={(row) => `Are you sure you want to delete firm: ${row?.firm_name}?`}
        />
      )}
    </div>
  );
};

export default FirmList;
