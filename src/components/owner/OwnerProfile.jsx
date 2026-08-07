import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import DocumentUploadCard from "../common/DocumentUploadCard";
import { getMyProfile, updateMyProfile } from "../../api/authApi";
import { setUser } from "../../store/slices/authSlice";
import { getValidatedUploadFile } from "../../utils/fileUpload";
import { validateMobile, validatePhone, validatePincode } from "../../utils/validation";

const IMAGE_BASE_URL = "http://localhost:9000/";

const OwnerProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const photoInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    own_first_name: "",
    own_middle_name: "",
    own_last_name: "",
    own_email: "",
    own_mobile_no: "",
    own_phone_no: "",
    own_login_id: "",
    own_address: "",
    own_village: "",
    own_city: "",
    own_state: "",
    own_pincode: "",
    own_profile_img: null,
  });

  const fillForm = (profile) => {
    if (!profile) return;
    setFormData({
      own_first_name: profile.own_first_name || "",
      own_middle_name: profile.own_middle_name || "",
      own_last_name: profile.own_last_name || "",
      own_email: profile.own_email || "",
      own_mobile_no: profile.own_mobile_no || "",
      own_phone_no: profile.own_phone_no || "",
      own_login_id:
        profile.role === "STAFF"
          ? profile.staff_login_id || profile.own_login_id || ""
          : profile.own_login_id || "",
      own_address: profile.own_address || "",
      own_village: profile.own_village || "",
      own_city: profile.own_city || "",
      own_state: profile.own_state || "",
      own_pincode: profile.own_pincode || "",
      own_profile_img: null,
    });
    if (profile.own_profile_img?.path) {
      setPhotoPreview(`${IMAGE_BASE_URL}${profile.own_profile_img.path}`);
    } else {
      setPhotoPreview(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setFetching(true);
        const res = await getMyProfile();
        fillForm(res.data);
        dispatch(setUser(res.data));
      } catch (err) {
        fillForm(user);
        toast.error(err.message || "Failed to load profile");
      } finally {
        setFetching(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e, fieldName, setPreview) => {
    const file = getValidatedUploadFile(e);
    if (!file) return;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    setPreview(URL.createObjectURL(file));
  };

  const removeFile = (fieldName, setPreview) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.own_first_name.trim() || !formData.own_last_name.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    if (!formData.own_email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (formData.own_mobile_no && !validateMobile(formData.own_mobile_no)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (formData.own_phone_no && !validatePhone(formData.own_phone_no)) {
      toast.error("Enter a valid phone number");
      return;
    }
    if (formData.own_pincode && !validatePincode(formData.own_pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("own_first_name", formData.own_first_name.trim());
      payload.append("own_middle_name", formData.own_middle_name.trim());
      payload.append("own_last_name", formData.own_last_name.trim());
      payload.append("own_email", formData.own_email.trim());
      payload.append("own_mobile_no", formData.own_mobile_no.trim());
      payload.append("own_phone_no", formData.own_phone_no.trim());
      payload.append("own_address", formData.own_address.trim());
      payload.append("own_village", formData.own_village.trim());
      payload.append("own_city", formData.own_city.trim());
      payload.append("own_state", formData.own_state.trim());
      payload.append("own_pincode", formData.own_pincode.trim());
      if (formData.own_profile_img instanceof File) {
        payload.append("own_profile_img", formData.own_profile_img);
      }

      const res = await updateMyProfile(payload);
      dispatch(setUser(res.data));
      fillForm(res.data);
      toast.success(res.message || "Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-5 text-muted">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-person-badge me-2"></i>
          {user?.role === "STAFF" ? "My Staff Profile" : "My Profile"}
        </h5>
        <Link to="/settings/update-password" className="btn btn-outline-primary btn-sm">
          <i className="bi bi-shield-lock me-1"></i>
          Update Password
        </Link>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-3">
              <DocumentUploadCard
                title="Profile Photo"
                fieldName="own_profile_img"
                preview={photoPreview}
                setPreview={setPhotoPreview}
                inputRef={photoInputRef}
                accept="image/*"
                handleFileSelect={handleFileSelect}
                removeFile={removeFile}
              />
            </div>
            <div className="col-md-9">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">First Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="own_first_name"
                    className="form-control border-dark"
                    value={formData.own_first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input
                    type="text"
                    name="own_middle_name"
                    className="form-control border-dark"
                    value={formData.own_middle_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="own_last_name"
                    className="form-control border-dark"
                    value={formData.own_last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    {user?.role === "STAFF" ? "Staff Login ID" : "Login ID"}
                  </label>
                  <input
                    type="text"
                    className="form-control border-dark"
                    value={
                      user?.role === "STAFF"
                        ? user?.staff_login_id || formData.own_login_id
                        : formData.own_login_id
                    }
                    disabled
                    readOnly
                  />
                  {user?.role === "STAFF" ? (
                    <div className="form-text small">
                      Login with: <strong>{user?.login_id || `${user?.owner_login_id}+${user?.staff_login_id}`}</strong>
                    </div>
                  ) : null}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    name="own_email"
                    className="form-control border-dark"
                    value={formData.own_email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Mobile</label>
                  <input
                    type="text"
                    name="own_mobile_no"
                    className="form-control border-dark"
                    value={formData.own_mobile_no}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="own_phone_no"
                    className="form-control border-dark"
                    value={formData.own_phone_no}
                    onChange={handleChange}
                    maxLength={12}
                  />
                </div>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label">Address</label>
              <textarea
                name="own_address"
                className="form-control border-dark"
                rows={2}
                value={formData.own_address}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Village</label>
              <input
                type="text"
                name="own_village"
                className="form-control border-dark"
                value={formData.own_village}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">City</label>
              <input
                type="text"
                name="own_city"
                className="form-control border-dark"
                value={formData.own_city}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">State</label>
              <input
                type="text"
                name="own_state"
                className="form-control border-dark"
                value={formData.own_state}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="own_pincode"
                className="form-control border-dark"
                value={formData.own_pincode}
                onChange={handleChange}
                maxLength={6}
              />
            </div>
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary px-5" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1"></i>
                  Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerProfile;
