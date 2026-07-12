import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import $ from "jquery";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import { FiTrendingUp, FiSave } from "react-icons/fi";
import { toast } from "react-hot-toast";
import useFormNavigation from "../../hooks/useFormNavigation";
import List from "../common/List";
import { createRate, deleteRate, getRates, updateRate } from "../../api/rateApi";
import { getPurities } from "../../api/purityApi";
import "../../css/Rate.css";

import { useSelector } from "react-redux";

const METAL_OPTIONS = ["Gold", "Silver"];



const UNIT_OPTIONS = ["1 GM", "10 GM", "1 KG"];

const getInitialForm = (firmId) => ({
  rate_firm_id: firmId || "",
  metal: "Gold",
  purity: "",
  rate: "",
  date: moment().format("YYYY-MM-DD"),
  time: moment().format("HH:mm"),
  unit: "1 GM",
  description: "",
  calculateAll: false,
});

const RatePage = () => {
  const { selectedFirmId, firms: reduxFirms } = useSelector((state) => state.firm);

  const [formData, setFormData] = useState(() => getInitialForm(selectedFirmId));
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dynamicPurities, setDynamicPurities] = useState([]);

  const formRef = useRef(null);
  const dateRef = useRef(null);
  useFormNavigation(formRef);

  // Sync firm ID with Header selection
  useEffect(() => {
    if (selectedFirmId === 'all') {
      if (reduxFirms.length > 0 && !formData.rate_firm_id) {
        setFormData(prev => ({ ...prev, rate_firm_id: reduxFirms[0].firm_id }));
      }
    } else if (selectedFirmId && selectedFirmId !== formData.rate_firm_id) {
      setFormData(prev => ({ ...prev, rate_firm_id: selectedFirmId }));
    }
  }, [selectedFirmId, reduxFirms, formData.rate_firm_id]);

  const fetchRates = async (firmId) => {
    try {
      setLoading(true);
      const response = await getRates(firmId);
      setRates(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load rates");
    } finally {
      setLoading(false);
    }
  };

  const loadDynamicPurities = async () => {
    try {
      const res = await getPurities();
      setDynamicPurities(res.data || []);
    } catch (error) {
      console.error("Failed to load purities", error);
    }
  };

  useEffect(() => {
    const activeFirmId = formData.rate_firm_id || (selectedFirmId !== 'all' ? selectedFirmId : (reduxFirms[0]?.firm_id || ''));
    if (activeFirmId) {
      fetchRates(activeFirmId);
    }
    loadDynamicPurities();
  }, [formData.rate_firm_id, selectedFirmId, reduxFirms]);

  const dynamicPuritiesForMetal = dynamicPurities
    .filter(p => p.purity_metal === formData.metal)
    .map(p => p.purity_name);

  const purityOptions = dynamicPuritiesForMetal;

  useEffect(() => {
    // If current purity is not in options, set it to the first option (or empty)
    if (purityOptions.length > 0 && !purityOptions.includes(formData.purity)) {
      setFormData(prev => ({ ...prev, purity: purityOptions[0] }));
    } else if (purityOptions.length === 0 && formData.purity !== "") {
      setFormData(prev => ({ ...prev, purity: "" }));
    }
  }, [purityOptions, formData.purity]);

  useEffect(() => {
    const dateInput = dateRef.current;
    if (!dateInput) return;

    $(dateInput).daterangepicker(
      {
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: { format: "DD-MM-YYYY" },
      },
      (start) => {
        setFormData((prev) => ({ ...prev, date: start.format("YYYY-MM-DD") }));
      }
    );

    return () => {
      const picker = $(dateInput).data("daterangepicker");
      if (picker) picker.remove();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "metal") {
      setFormData((prev) => ({ ...prev, metal: value }));
      return;
    }

    if (name === "rate") {
      const cleaned = value.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      const finalValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleaned;
      setFormData((prev) => ({ ...prev, rate: finalValue }));
      return;
    }

    if (e.target.type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(getInitialForm(selectedFirmId));
    setEditingId(null);
  };

  const handleEdit = (rowData) => {
    setEditingId(rowData.rate_uuid);
    setFormData({
      rate_firm_id: rowData.rate_firm_id,
      metal: rowData.rate_metal,
      purity: rowData.rate_purity,
      rate: rowData.rate_amount,
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm"),
      unit: rowData.rate_unit,
      description: rowData.rate_desc || "",
      calculateAll: false,
    });
    if (dateRef.current) {
      const $ = window.$ || window.jQuery;
      if ($) {
        $(dateRef.current).val(moment().format("DD-MM-YYYY"));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.metal || !formData.purity || !formData.rate || !formData.date || !formData.time || !formData.unit) {
      toast.error("Please fill all required fields");
      return;
    }

    if (Number(formData.rate) <= 0) {
      toast.error("Rate must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        rate_firm_id: formData.rate_firm_id,
        rate_metal: formData.metal,
        rate_purity: formData.purity,
        rate_amount: Number(formData.rate),
        rate_date: formData.date,
        rate_time: formData.time,
        rate_unit: formData.unit,
        rate_desc: formData.description.trim(),
        calculateAll: formData.calculateAll,
      };

      let response;
      if (editingId) {
        response = await updateRate(editingId, payload);
        toast.success(response.message || "Rate updated successfully");
      } else {
        response = await createRate(payload);
        toast.success(response.message || "Rate saved successfully");
      }

      handleReset();
      fetchRates();
    } catch (error) {
      const backendError = error.response?.data?.error || error.response?.data?.message;
      toast.error(backendError || error.message || `Failed to ${editingId ? "update" : "save"} rate`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rowData) => {
    try {
      const response = await deleteRate(rowData.rate_uuid);
      toast.success(response.message || "Rate deleted successfully");
      fetchRates();
    } catch (error) {
      toast.error(error.message || "Failed to delete rate");
    }
  };

  const columns = [
    { key: "rate_id", title: "ID", orderable: true, searchable: true },
    { key: "rate_metal", title: "Metal", orderable: true, searchable: true },
    { 
      key: "rate_purity", 
      title: "Purity / Type", 
      orderable: true, 
      searchable: true,
      render: (value) => {
        const purityObj = dynamicPurities.find(p => p.purity_name === value);
        return purityObj ? `${value} (${Number(purityObj.purity_value).toFixed(2)})` : value;
      }
    },
    {
      key: "rate_amount",
      title: "Rate",
      orderable: true,
      searchable: true,
      render: (value) => `₹ ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    { key: "rate_unit", title: "Unit", orderable: true, searchable: true },
    {
      key: "rate_date",
      title: "Date",
      orderable: true,
      searchable: true,
      dateFilter: true,
      render: (value) => (value ? moment(value).format("DD-MM-YYYY") : "-"),
    },
    {
      key: "rate_time",
      title: "Time",
      orderable: true,
      searchable: true,
      render: (value) => (value ? moment(value, ["HH:mm", "HH:mm:ss"]).format("hh:mm A") : "-"),
    },
    {
      key: "rate_desc",
      title: "Description",
      orderable: false,
      searchable: true,
      render: (value) => value || "-",
    },
    {
      key: "rate_created_at",
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
            {editingId ? "Update Gold & Silver Rate" : "Add Gold & Silver Rate"}
          </h4>
        </div>

        <form ref={formRef} noValidate onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">
                Firm <span className="text-danger">*</span>
              </label>
              <select
                name="rate_firm_id"
                className="form-select border-dark"
                value={formData.rate_firm_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Firm</option>
                {reduxFirms.map((firm) => (
                  <option key={firm.firm_id} value={firm.firm_id}>
                    {firm.firm_name}
                  </option>
                ))}
              </select>
            </div>

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
                Purity / Type <span className="text-danger">*</span>
              </label>
              <select
                name="purity"
                className="form-select border-dark"
                value={formData.purity}
                onChange={handleChange}
                required
              >
                {purityOptions.map((purity) => {
                  const pObj = dynamicPurities.find(p => p.purity_name === purity);
                  return (
                    <option key={purity} value={purity}>
                      {pObj ? `${purity} (${Number(pObj.purity_value).toFixed(2)})` : purity}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">
                Rate <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text border-dark rate-rupee-prefix">₹</span>
                <input
                  type="text"
                  name="rate"
                  className="form-control border-dark"
                  placeholder="Enter rate"
                  value={formData.rate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">
                Date <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="date"
                ref={dateRef}
                className="form-control border-dark"
                defaultValue={moment(formData.date).format("DD-MM-YYYY")}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">
                Time <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                name="time"
                className="form-control border-dark"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">
                Unit <span className="text-danger">*</span>
              </label>
              <select
                name="unit"
                className="form-select border-dark"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">
              <div className="form-check mb-2">
                <input
                  className="form-check-input border-dark"
                  type="checkbox"
                  name="calculateAll"
                  id="calculateAll"
                  checked={formData.calculateAll}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-medium" htmlFor="calculateAll">
                  Auto-calculate additional rates
                </label>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-8">
              <label className="form-label fw-medium">Description</label>
              <textarea
                name="description"
                className="form-control border-dark"
                rows={1}
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label d-none d-md-block">&nbsp;</label>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-rate-save w-100" disabled={saving}>
                  <FiSave className="me-2" /> {saving ? (editingId ? "Updating..." : "Saving...") : (editingId ? "Update Rate" : "Save Rate")}
                </button>
              </div>
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
        <List
          data={rates}
          columns={columns}
          title="Gold & Silver Rate List"
          onDelete={handleDelete}
          hasDelete={true}
          hasEdit={true}
          onEdit={handleEdit}
          showFooter={false}
          deleteConfirmMessage={(row) =>
            `Are you sure you want to delete ${row?.rate_metal} ${row?.rate_purity} rate?`
          }
        />
      )}
    </div>
  );
};

export default RatePage;
