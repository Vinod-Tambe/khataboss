import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { changePassword } from "../../api/authApi";
import {
  getPasswordRuleChecks,
  PASSWORD_MAX_LENGTH,
} from "../../utils/passwordValidation";
import PasswordRequirementsPanel from "../common/PasswordRequirementsPanel";

const UpdatePassword = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });
  const [serverError, setServerError] = useState("");
  const [show, setShow] = useState({
    old: false,
    next: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showRequirements, setShowRequirements] = useState(false);

  const personalInfo = useMemo(
    () => ({
      firstName: user?.own_first_name,
      middleName: user?.own_middle_name,
      lastName: user?.own_last_name,
      // Staff: use staff_login_id only (not owner+staff) for personal-info checks
      loginId: user?.role === "STAFF" ? user?.staff_login_id : user?.own_login_id,
      email: user?.own_email,
      mobile: user?.own_mobile_no,
    }),
    [user]
  );

  const passwordRules = useMemo(
    () =>
      getPasswordRuleChecks(formData.new_password, {
        oldPassword: formData.old_password,
        personalInfo,
      }),
    [formData.new_password, formData.old_password, personalInfo]
  );

  const validation = useMemo(() => {
    const { old_password, new_password, confirm_password } = formData;

    const old = {
      ok: old_password.length > 0 && !serverError,
      message: !old_password
        ? "Old password is required"
        : serverError
          ? serverError
          : "Old password entered",
      failed: !old_password || Boolean(serverError),
    };

    const newFailed = !passwordRules.isValid;
    const newMsg = !new_password
      ? "New password is required"
      : passwordRules.message;

    let confirmMsg = "";
    let confirmFailed = false;
    if (!confirm_password) {
      confirmMsg = "Confirm password is required";
      confirmFailed = true;
    } else if (confirm_password !== new_password) {
      confirmMsg = "Confirm password does not match new password";
      confirmFailed = true;
    } else if (passwordRules.isValid) {
      confirmMsg = "Passwords match";
    } else {
      confirmMsg = "Fix new password rules first";
      confirmFailed = true;
    }

    return {
      old_password: old,
      new_password: { ok: !newFailed, message: newMsg, failed: newFailed },
      confirm_password: { ok: !confirmFailed, message: confirmMsg, failed: confirmFailed },
      isFormValid: old.ok && passwordRules.isValid && !confirmFailed,
    };
  }, [formData, serverError, passwordRules]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === "new_password" || name === "confirm_password") {
      nextValue = value.slice(0, PASSWORD_MAX_LENGTH);
    }
    if (name === "old_password" && serverError) {
      setServerError("");
    }
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const toggleShow = (key) => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setTouched({
      old_password: true,
      new_password: true,
      confirm_password: true,
    });

    if (!validation.isFormValid) {
      toast.error(validation.new_password.failed ? validation.new_password.message : "Please fix password validation errors");
      return;
    }

    setLoading(true);
    try {
      setServerError("");
      const res = await changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      toast.success(res.message || "Password updated successfully");
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTouched({
        old_password: false,
        new_password: false,
        confirm_password: false,
      });
    } catch (err) {
      const msg = err.message || "Failed to update password";
      if (/old password/i.test(msg) || /incorrect/i.test(msg) || /current/i.test(msg)) {
        setServerError(msg);
        setTouched((prev) => ({ ...prev, old_password: true }));
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (label, name, showKey, placeholder) => {
    const field = validation[name];
    const isTouched = touched[name];
    const showFeedback = isTouched;
    const borderClass =
      showFeedback && formData[name]
        ? field.failed
          ? "is-invalid"
          : "is-valid"
        : "";
    const isNewPassword = name === "new_password";

    return (
      <div className="mb-3">
        <label className="form-label fw-semibold">{label}</label>
        <div className="input-group has-validation">
          <span className="input-group-text border-dark bg-light">
            <i className="bi bi-key"></i>
          </span>
          <input
            type={show[showKey] ? "text" : "password"}
            name={name}
            className={`form-control border-dark ${borderClass}`}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            onFocus={() => {
              if (isNewPassword) setShowRequirements(true);
            }}
            onBlur={() => {
              handleBlur(name);
              if (isNewPassword && !formData.new_password) {
                setShowRequirements(false);
              }
            }}
            autoComplete="new-password"
            maxLength={name === "old_password" ? undefined : PASSWORD_MAX_LENGTH}
          />
          <button
            type="button"
            className="btn btn-outline-secondary border-dark"
            onClick={() => toggleShow(showKey)}
            tabIndex={-1}
          >
            <i className={`bi ${show[showKey] ? "bi-eye-slash" : "bi-eye"}`}></i>
          </button>
        </div>
        {showFeedback ? (
          <div className={`small mt-1 ${field.failed ? "text-danger" : "text-success"}`}>
            <i className={`bi ${field.failed ? "bi-x-circle" : "bi-check-circle"} me-1`}></i>
            {field.message}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
        <h5 className="mb-0 fw-bold">
          <i className="bi bi-shield-lock me-2"></i>
          {user?.role === "STAFF" ? "Update Staff Password" : "Update Password"}
        </h5>
        <Link to="/profile" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-person me-1"></i>
          Back to Profile
        </Link>
      </div>
      <div className="card-body">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
            <form onSubmit={handleSubmit} noValidate>
              {renderPasswordField("Old Password", "old_password", "old", "Enter old password")}
              {renderPasswordField("New Password", "new_password", "next", "Enter new password")}

              {(showRequirements || formData.new_password.length > 0) && (
                <PasswordRequirementsPanel
                  checks={passwordRules.checks}
                  password={formData.new_password}
                  className="mb-3"
                />
              )}

              {renderPasswordField(
                "Confirm Password",
                "confirm_password",
                "confirm",
                "Re-enter new password"
              )}

              <div className="text-center mt-4">
                <button
                  type="submit"
                  className="btn btn-primary px-5"
                  disabled={loading || !validation.isFormValid}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1"></i>
                      Set Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
