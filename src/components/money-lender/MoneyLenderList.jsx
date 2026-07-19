import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import List from "../common/List";
import { getMoneyLenders, deleteMoneyLender } from "../../api/moneyLenderApi";
import { toast } from "react-hot-toast";

const MoneyLenderList = () => {
  const navigate = useNavigate();
  const [moneyLenders, setMoneyLenders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMoneyLenders = async () => {
    try {
      setLoading(true);
      const response = await getMoneyLenders();
      const mappedData = (response.data || []).map(ml => ({
        ...ml,
        ml_name: `${ml.ml_first_name} ${ml.ml_last_name || ''}`.trim()
      }));
      setMoneyLenders(mappedData);
    } catch (error) {
      console.error("Error fetching money lenders:", error);
      toast.error(error.message || "Failed to fetch money lenders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoneyLenders();
  }, []);

  const columns = [
    { key: "ml_name", title: "Name", orderable: true, searchable: true },
    { key: "ml_phone", title: "Phone", orderable: false, searchable: true },
    { key: "ml_gender", title: "Gender", orderable: true, searchable: true },
    { key: "ml_aadhaar", title: "Aadhaar", orderable: false, searchable: true },
    { key: "ml_pan", title: "PAN", orderable: false, searchable: true },
    { key: "ml_city", title: "City", orderable: true, searchable: true },
    {
      key: "created_at",
      title: "Created Date",
      orderable: true,
      searchable: true,
      dateFilter: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : "-"
    },
  ];

  const handleEdit = (rowData) => {
    navigate(`/money-lender/edit/${rowData.ml_uuid}`);
  };

  const handleDelete = async (rowData) => {
    try {
      const response = await deleteMoneyLender(rowData.ml_uuid);
      toast.success(response.message || "Money Lender deleted successfully.");
      fetchMoneyLenders(); 
    } catch (error) {
      console.error("Error deleting money lender:", error);
      toast.error(error.message || "Failed to delete money lender.");
    }
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
          data={moneyLenders}
          columns={columns}
          title="All Money Lender List"
          onEdit={handleEdit}
          onDelete={handleDelete}
          hasDelete={true}
          hasEdit={true}
          hasPrint={false}
          showFooter={false}
          deleteConfirmMessage={(row) => `Are you sure you want to delete money lender: ${row?.ml_first_name}?`}
        />
      )}
    </div>
  );
};

export default MoneyLenderList;
