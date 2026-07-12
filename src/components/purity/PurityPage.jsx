import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import { FiTrendingUp, FiSave } from "react-icons/fi";
import { toast } from "react-hot-toast";
import useFormNavigation from "../../hooks/useFormNavigation";
import List from "../common/List";
import { createPurity, deletePurity, getPurities, updatePurity } from "../../api/purityApi";
import "../../css/Rate.css";

const METAL_OPTIONS = ["Gold", "Silver"];

const getInitialForm = () => ({
  metal: "Gold",
  purity_name: "",
  purity_value: "",
  description: "",
});

const PurityPage = () => {
  const [formData, setFormData] = useState(getInitialForm());
  const [purities, setPurities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const formRef = useRef(null);
  useFormNavigation(formRef);

  const fetchPurities = async () => {
    try {
      setLoading(true);
      const data = await getPurities();
      setPurities(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load purities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(getInitialForm());
    setEditingId(null);
  };

  const handleEdit = (rowData) => {
    setEditingId(rowData.purity_uuid);
    setFormData({
      metal: rowData.purity_metal,
      purity_name: rowData.purity_name,
      purity_value: rowData.purity_value,
      description: rowData.purity_desc || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.metal || !formData.purity_name || !formData.purity_value) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        purity_metal: formData.metal,
        purity_name: formData.purity_name,
        purity_value: Number(formData.purity_value),
        purity_desc: formData.description.trim(),
      };

      let response;
      if (editingId) {
        response = await updatePurity(editingId, payload);
        toast.success(response.message || "Purity updated successfully");
      } else {
        response = await createPurity(payload);
        toast.success(response.message || "Purity saved successfully");
      }

      handleReset();
      fetchPurities();
    } catch (error) {
      const backendError = error.response?.data?.error || error.response?.data?.message;
      toast.error(backendError || error.message || `Failed to ${editingId ? "update" : "save"} purity`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    try {
      const res = await deletePurity(row.purity_uuid);
      toast.success(res.message || "Purity deleted successfully");
      fetchPurities();
    } catch (error) {
      const backendError = error.response?.data?.error || error.response?.data?.message;
      toast.error(backendError || error.message || "Failed to delete purity");
    }
  };

  const columns = [
    { title: "Metal", key: "purity_metal", orderable: true, searchable: true },
    { title: "Purity Name", key: "purity_name", orderable: true, searchable: true },
    { 
      title: "Purity", 
      key: "purity_value", 
      orderable: true, 
      searchable: true,
      render: (val) => Number(val).toFixed(2)
    },
    { title: "Description", key: "purity_desc", orderable: false, searchable: true },
    {
      key: "purity_created_at",
      title: "Add Date",
      orderable: true,
      searchable: true,
      dateFilter: true,
      render: (value) => (value ? moment(value).format("DD-MM-YYYY") : "-"),
    },
  ];

  return (
    <div className="rate-page">
      <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary rate-form-card mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="rate-form-icon d-inline-flex align-items-center justify-content-center">
            <FiTrendingUp size={20} />
          </span>
          <h4 className="card-title fw-bold mb-0">
            {editingId ? "Update Purity Options" : "Add Purity Options"}
          </h4>
        </div>

        <form ref={formRef} noValidate onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">
                Select Metal <span className="text-danger">*</span>
              </label>
              <select
                name="metal"
                className="form-select border-dark"
                value={formData.metal}
                onChange={handleChange}
                required
              >
                {METAL_OPTIONS.map((metal) => (
                  <option key={metal} value={metal}>
                    {metal}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">
                Purity Name (e.g. 92%) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="purity_name"
                className="form-control border-dark"
                placeholder="e.g. 22K"
                value={formData.purity_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">
                Purity <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="purity_value"
                className="form-control border-dark"
                placeholder="Number only e.g. 92"
                value={formData.purity_value}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    handleChange(e);
                  }
                }}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Description</label>
              <input
                type="text"
                name="description"
                className="form-control border-dark"
                placeholder="Optional"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4 offset-lg-8">
              <button type="submit" className="btn btn-rate-save w-100" disabled={saving}>
                <FiSave className="me-2" /> {saving ? (editingId ? "Updating..." : "Saving...") : (editingId ? "Update Purity" : "Save Purity")}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0 border-md-1 border-secondary">
          <List
            data={purities}
            columns={columns}
            title="Dynamic Purity List"
            onDelete={handleDelete}
            hasDelete={true}
            hasEdit={true}
            onEdit={handleEdit}
            showFooter={false}
            deleteConfirmMessage={(row) =>
              `Are you sure you want to delete ${row?.purity_metal} - ${row?.purity_name}?`
            }
          />
        </div>
      )}
    </div>
  );
};

export default PurityPage;
