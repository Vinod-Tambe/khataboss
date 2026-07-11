import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import $ from "jquery";
import "daterangepicker";
import "daterangepicker/daterangepicker.css";
import { FiTrendingUp, FiRefreshCw, FiSave } from "react-icons/fi";
import { toast } from "react-hot-toast";
import useFormNavigation from "../../hooks/useFormNavigation";
import List from "../common/List";
import { createRate, deleteRate, getRates } from "../../api/rateApi";
import "../../css/Rate.css";

const METAL_OPTIONS = ["Gold", "Silver"];

const PURITY_BY_METAL = {
  Gold: ["24K (999)", "22K (916)", "18K (750)", "14K (585)"],
  Silver: ["999", "925", "900"],
};

const UNIT_OPTIONS = ["Per Gram", "Per 10 Gram", "Per Kg"];

const getInitialForm = () => ({
  metal: "Gold",
  purity: "24K (999)",
  rate: "",
  date: moment().format("YYYY-MM-DD"),
  time: moment().format("HH:mm"),
  unit: "Per Gram",
  description: "",
});

const RatePage = () => {
  const [formData, setFormData] = useState(getInitialForm);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const formRef = useRef(null);
  const dateRef = useRef(null);
  useFormNavigation(formRef);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await getRates();
      setRates(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch rates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

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
      const nextPurity = PURITY_BY_METAL[value]?.[0] || "";
      setFormData((prev) => ({ ...prev, metal: value, purity: nextPurity }));
      return;
    }

    if (name === "rate") {
      const cleaned = value.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      const finalValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleaned;
      setFormData((prev) => ({ ...prev, rate: finalValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    const initial = getInitialForm();
    setFormData(initial);
    if (dateRef.current) {
      $(dateRef.current).val(moment(initial.date).format("DD-MM-YYYY"));
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
      const response = await createRate({
        metal: formData.metal,
        purity: formData.purity,
        rate: Number(formData.rate),
        date: formData.date,
        time: formData.time,
        unit: formData.unit,
        description: formData.description.trim(),
      });
      toast.success(response.message || "Rate saved successfully");
      handleReset();
      fetchRates();
    } catch (error) {
      toast.error(error.message || "Failed to save rate");
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
    { key: "metal", title: "Metal", orderable: true, searchable: true },
    { key: "purity", title: "Purity / Type", orderable: true, searchable: true },
    {
      key: "rate",
      title: "Rate",
      orderable: true,
      searchable: true,
      render: (value) => `₹ ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    { key: "unit", title: "Unit", orderable: true, searchable: true },
    {
      key: "date",
      title: "Date",
      orderable: true,
      searchable: true,
      dateFilter: true,
      render: (value) => (value ? moment(value).format("DD-MM-YYYY") : "-"),
    },
    {
      key: "time",
      title: "Time",
      orderable: true,
      searchable: true,
      render: (value) => (value ? moment(value, ["HH:mm", "HH:mm:ss"]).format("hh:mm A") : "-"),
    },
    {
      key: "description",
      title: "Description",
      orderable: false,
      searchable: true,
      render: (value) => value || "-",
    },
  ];

  const purityOptions = PURITY_BY_METAL[formData.metal] || [];

  return (
    <div className="rate-page">
      <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary rate-form-card mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span className="rate-form-icon d-inline-flex align-items-center justify-content-center">
            <FiTrendingUp size={20} />
          </span>
          <h4 className="card-title fw-bold mb-0">Add Gold &amp; Silver Rate</h4>
        </div>

        <form ref={formRef} noValidate onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-4">
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

            <div className="col-12 col-md-6 col-lg-4">
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
                {purityOptions.map((purity) => (
                  <option key={purity} value={purity}>
                    {purity}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label fw-medium">
                Rate (per gram) <span className="text-danger">*</span>
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

            <div className="col-12 col-md-6 col-lg-4">
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

            <div className="col-12 col-md-6 col-lg-4">
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

            <div className="col-12 col-md-6 col-lg-4">
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

            <div className="col-12">
              <label className="form-label fw-medium">Description (Optional)</label>
              <textarea
                name="description"
                className="form-control border-dark"
                rows={3}
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary px-3" onClick={handleReset}>
              <FiRefreshCw className="me-2" />
              Reset
            </button>
            <button type="submit" className="btn btn-rate-save px-3" disabled={saving}>
              <FiSave className="me-2" />
              {saving ? "Saving..." : "Save Rate"}
            </button>
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
          showFooter={false}
          deleteConfirmMessage={(row) =>
            `Are you sure you want to delete ${row?.metal} ${row?.purity} rate?`
          }
        />
      )}
    </div>
  );
};

export default RatePage;
