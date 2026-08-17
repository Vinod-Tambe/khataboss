import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { showToast } from "../common/ToastAlert";
import { getValidatedUploadFile } from "../../utils/fileUpload";
import ProfileDocumentsSection from "../common/ProfileDocumentsSection";
import {
    appendOtherImagesToFormData,
    collectExistingDocumentUpdates,
    documentsFromOtherImages,
    getNewDocumentUploads,
    resolveImageUrl,
} from "../../utils/imageHelpers";
import "../../css/ProfileDocumentsSection.css";
import {
    getStaff,
    updateStaff,
    updateStaffPassword,
    updateStaffPermissions,
} from "../../api/staffApi";
import {
    getPasswordRuleChecks,
    PASSWORD_MAX_LENGTH,
} from "../../utils/passwordValidation";
import PasswordRequirementsPanel from "../common/PasswordRequirementsPanel";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const emptyPermissions = {
    firm: { view: false, create: false, edit: false, delete: false },
    account: { view: false, create: false, edit: false, delete: false },
    staff: { view: false, create: false, edit: false, delete: false },
    user: { view: false, create: false, edit: false, delete: false },
    moneyLender: { view: false, create: false, edit: false, delete: false },
    loan: {
        view: false, create: false, edit: false, delete: false,
        form8: false, deposit: false, addPrincipal: false, transfer: false,
        release: false, auction: false, notice: false, customize: false,
        print: false, loanLogs: false,
    },
    finance: {
        view: false, create: false, edit: false, delete: false,
        payment: false, rollback: false, history: false, printReceipt: false,
    },
    reports: {
        daybook: false, balanceSheet: false, logs: false, profitLoss: false, trialBalance: false,
    },
    settings: { manage: false },
};

const resolveImg = (img, fallback = DEFAULT_AVATAR) => resolveImageUrl(img) || fallback;

const mapStaffToForm = (staff) => ({
    firstName: staff.staff_first_name || "",
    lastName: staff.staff_last_name || "",
    fatherName: staff.staff_father_name || "",
    motherName: staff.staff_mother_name || "",
    mobileNo: staff.staff_mobile_no || "",
    phoneNo: staff.staff_phone_no || "",
    emailId: staff.staff_email_id || "",
    gender: staff.staff_gender || "",
    cast: staff.staff_cast || "",
    maritalStatus: staff.staff_marital_status || "",
    occupation: staff.staff_occupation || "",
    dateOfBirth: staff.staff_birth_date
        ? String(staff.staff_birth_date).slice(0, 10)
        : "",
    gstin: staff.staff_gstin || "",
    taxNo: staff.staff_tax_no || "",
    panNo: staff.staff_pan_no || "",
    adhaarNo: staff.staff_adhaar_no || "",
    permanentAddress: staff.staff_per_address || "",
    currentAddress: staff.staff_curr_address || "",
    village: staff.staff_village || "",
    wardNumber: staff.staff_ward_no || "",
    tehsil: staff.staff_tehsil || "",
    city: staff.staff_city || "",
    state: staff.staff_state || "",
    country: staff.staff_country || "",
    pincode: staff.staff_pincode || "",
    bankName: staff.staff_bank_name || "",
    bankAccNo: staff.staff_bank_acc_no || "",
    ifscCode: staff.staff_ifsc_code || "",
    otherInformation: staff.staff_other_info || "",
    image: resolveImg(staff.staff_profile_img),
    status: staff.staff_status === "Active",
    photoFile: null,
});

const mergePermissions = (incoming = {}) => {
    const next = JSON.parse(JSON.stringify(emptyPermissions));
    for (const section of Object.keys(next)) {
        if (!incoming[section]) continue;
        for (const key of Object.keys(next[section])) {
            if (incoming[section][key] !== undefined) {
                next[section][key] = !!incoming[section][key];
            }
        }
    }
    return next;
};

const StaffDetails = () => {
    const { id } = useParams();
    const authUser = useSelector((state) => state.auth.user);
    const ownerLoginId =
        authUser?.role === "STAFF"
            ? authUser?.owner_login_id || ""
            : authUser?.own_login_id || "";

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingPermissions, setSavingPermissions] = useState(false);
    const [fullLoginId, setFullLoginId] = useState("");
    const [userData, setUserData] = useState(mapStaffToForm({}));
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState({
        password: false,
        confirmPassword: false,
    });
    const [activeDetailTab, setActiveDetailTab] = useState("personal");
    const [permissions, setPermissions] = useState(emptyPermissions);
    const [documents, setDocuments] = useState([]);
    const [removedDocPaths, setRemovedDocPaths] = useState([]);

    const passwordRules = useMemo(
        () => getPasswordRuleChecks(password),
        [password]
    );

    const passwordValidation = useMemo(() => {
        const passwordFailed = !password || !passwordRules.isValid;
        const passwordMsg = !password ? "Password is required" : passwordRules.message;

        let confirmMsg = "";
        let confirmFailed = false;
        if (!confirmPassword) {
            confirmMsg = "Confirm password is required";
            confirmFailed = true;
        } else if (confirmPassword !== password) {
            confirmMsg = "Confirm password does not match";
            confirmFailed = true;
        } else if (passwordRules.isValid) {
            confirmMsg = "Passwords match";
        } else {
            confirmMsg = "Fix password rules first";
            confirmFailed = true;
        }

        return {
            password: { failed: passwordFailed, message: passwordMsg },
            confirmPassword: { failed: confirmFailed, message: confirmMsg },
            isValid: !passwordFailed && !confirmFailed && !!loginId.trim(),
        };
    }, [password, confirmPassword, passwordRules, loginId]);

    const triggerAlert = (message, type = "success") => {
        const toastType = type === "danger" ? "error" : type;
        showToast(message, toastType);
    };

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await getStaff(id);
                if (cancelled) return;
                const staff = res.data;
                setUserData(mapStaffToForm(staff));
                setDocuments(documentsFromOtherImages(staff.staff_other_images));
                setRemovedDocPaths([]);
                setLoginId(staff.staff_login_id || "");
                setFullLoginId(staff.full_login_id || `${ownerLoginId}+${staff.staff_login_id || ""}`);
                setPermissions(mergePermissions(staff.permissions));
                setPassword("");
                setConfirmPassword("");
            } catch (err) {
                triggerAlert(err.message || "Failed to load staff", "danger");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        if (id) load();
        return () => { cancelled = true; };
    }, [id, ownerLoginId]);

    const handleProfileFile = (file) => {
        if (!file) return;
        setUserData((prev) => ({
            ...prev,
            photoFile: file,
            image: URL.createObjectURL(file),
        }));
    };

    const handleProfileRemove = () => {
        setUserData((prev) => ({
            ...prev,
            photoFile: null,
            image: DEFAULT_AVATAR,
        }));
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSaveProfileDetails = async () => {
        if (saving) return;
        if (!userData.firstName || !userData.lastName) {
            triggerAlert("First Name and Last Name are required!", "danger");
            return;
        }
        if (!userData.mobileNo) {
            triggerAlert("Mobile Number is required!", "danger");
            return;
        }

        setSaving(true);
        const payload = new FormData();
        payload.append("firstName", userData.firstName);
        payload.append("lastName", userData.lastName);
        payload.append("fatherName", userData.fatherName || "");
        payload.append("motherName", userData.motherName || "");
        payload.append("mobileNo", userData.mobileNo);
        payload.append("phoneNo", userData.phoneNo || "");
        payload.append("emailId", userData.emailId || "");
        payload.append("gender", userData.gender || "");
        payload.append("cast", userData.cast || "");
        payload.append("maritalStatus", userData.maritalStatus || "");
        payload.append("occupation", userData.occupation || "");
        payload.append("dateOfBirth", userData.dateOfBirth || "");
        payload.append("gstin", userData.gstin || "");
        payload.append("taxNo", userData.taxNo || "");
        payload.append("panNo", userData.panNo || "");
        payload.append("adhaarNo", userData.adhaarNo || "");
        payload.append("loginId", loginId || "");
        payload.append("permanentAddress", userData.permanentAddress || "");
        payload.append("currentAddress", userData.currentAddress || "");
        payload.append("village", userData.village || "");
        payload.append("wardNumber", userData.wardNumber || "");
        payload.append("tehsil", userData.tehsil || "");
        payload.append("city", userData.city || "");
        payload.append("state", userData.state || "");
        payload.append("country", userData.country || "");
        payload.append("pincode", userData.pincode || "");
        payload.append("bankName", userData.bankName || "");
        payload.append("bankAccNo", userData.bankAccNo || "");
        payload.append("ifscCode", userData.ifscCode || "");
        payload.append("otherInformation", userData.otherInformation || "");
        payload.append("staff_status", userData.status ? "Active" : "Inactive");
        if (userData.photoFile) payload.append("photo", userData.photoFile);
        appendOtherImagesToFormData(
            payload,
            getNewDocumentUploads(documents),
            removedDocPaths,
            collectExistingDocumentUpdates(documents)
        );

        try {
            const res = await updateStaff(id, payload);
            setUserData(mapStaffToForm(res.data));
            setDocuments(documentsFromOtherImages(res.data.staff_other_images));
            setRemovedDocPaths([]);
            setFullLoginId(res.data.full_login_id || fullLoginId);
            triggerAlert("Staff profile details saved successfully.");
        } catch (err) {
            triggerAlert(err.message || "Failed to save staff", "danger");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordUpdateOnly = async () => {
        if (savingPassword) return;
        setPasswordTouched({ password: true, confirmPassword: true });
        setShowRequirements(true);

        if (!loginId.trim()) {
            triggerAlert("Login ID cannot be empty!", "danger");
            return;
        }
        if (loginId.includes("+")) {
            triggerAlert("Enter staff login ID only (without owner prefix).", "danger");
            return;
        }
        if (!passwordValidation.isValid) {
            triggerAlert(
                passwordValidation.password.failed
                    ? passwordValidation.password.message
                    : passwordValidation.confirmPassword.message,
                "danger"
            );
            return;
        }

        setSavingPassword(true);
        try {
            const res = await updateStaffPassword(id, {
                loginId: loginId.trim().toLowerCase(),
                password,
                confirm_password: confirmPassword,
            });
            setLoginId(res.data.staff_login_id);
            setFullLoginId(res.data.full_login_id || `${ownerLoginId}+${res.data.staff_login_id}`);
            setPassword("");
            setConfirmPassword("");
            setShowRequirements(false);
            setPasswordTouched({ password: false, confirmPassword: false });
            triggerAlert("Login ID and password updated successfully.");
        } catch (err) {
            triggerAlert(err.message || "Failed to update password", "danger");
        } finally {
            setSavingPassword(false);
        }
    };

    const handleSavePermissions = async () => {
        if (savingPermissions) return;
        setSavingPermissions(true);
        try {
            const res = await updateStaffPermissions(id, permissions);
            setPermissions(mergePermissions(res.data.permissions));
            triggerAlert("Staff permissions saved successfully.");
        } catch (err) {
            triggerAlert(err.message || "Failed to save permissions", "danger");
        } finally {
            setSavingPermissions(false);
        }
    };

    const handleSectionSelectAll = (section, isChecked) => {
        setPermissions(prev => {
            const updatedSection = { ...prev[section] };
            for (const key in updatedSection) {
                updatedSection[key] = isChecked;
            }
            return { ...prev, [section]: updatedSection };
        });
    };

    const handlePermissionChange = (section, key, isChecked) => {
        setPermissions(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: isChecked
            }
        }));
    };

    const checkFullPermissionSelected = (permsState) => {
        return Object.values(permsState).every(section =>
            Object.values(section).every(val => val === true)
        );
    };

    const isFullPermissionSelected = () => {
        return checkFullPermissionSelected(permissions);
    };

    const handleFullPermissionToggle = () => {
        setPermissions(prev => {
            const nextValue = !checkFullPermissionSelected(prev);
            const updated = {};
            for (const section in prev) {
                updated[section] = {};
                for (const key in prev[section]) {
                    updated[section][key] = nextValue;
                }
            }
            return updated;
        });
    };
    const isSectionFullySelected = (section) => {
        return Object.values(permissions[section]).every(val => val === true);
    };

    if (loading) {
        return <div className="text-center text-muted py-5">Loading staff details...</div>;
    }

    return (
        <div className="staff-details-page pb-2 pb-md-0">
            <style>
                {`
          .custom-checkbox {
            width: 1.25em;
            height: 1.25em;
            cursor: pointer;
            border-color: #adb5bd;
            border-radius: 4px;
            margin-right: 8px;
          }
          .custom-checkbox:checked {
            background-color: var(--success) !important;
            border-color: var(--success) !important;
          }
          .custom-checkbox:focus {
            box-shadow: 0 0 0 0.25rem rgba(79, 144, 129, 0.25) !important;
            border-color: var(--success) !important;
          }
          .form-switch .custom-switch {
            width: 2.25em;
            height: 1.15em;
            cursor: pointer;
            background-color: #e5e7eb;
            border-color: #d1d5db;
          }
          .form-switch .custom-switch:checked {
            background-color: var(--success) !important;
            border-color: var(--success) !important;
          }
          .permission-label {
            font-size: 0.85rem;
            color: #374151;
            font-weight: 500;
            cursor: pointer;
          }
          .card-header-line {
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 1.25rem;
            padding-bottom: 0.75rem;
          }
          .user-details-card {
            background-color: #ffffff !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
            border: 1px solid #eef0f2 !important;
          }
          .user-details-card .gap-3 {
            gap: 0.5rem !important;
          }
          .user-details-card h6.text-secondary {
            margin-bottom: 0.75rem !important;
          }
          .staff-detail-tabs-wrap {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            margin-left: -4px;
            margin-right: -4px;
            padding-left: 4px;
            padding-right: 4px;
          }
          .staff-detail-tabs-wrap::-webkit-scrollbar {
            display: none;
          }
          .staff-detail-tabs {
            flex-wrap: nowrap !important;
            width: max-content;
            min-width: 100%;
          }
          .staff-detail-tabs .nav-item {
            flex-shrink: 0;
          }
          .staff-detail-tabs .nav-link {
            white-space: nowrap;
            font-size: 0.8rem;
          }
          @media (min-width: 768px) {
            .staff-profile-sidebar {
              align-items: center !important;
              text-align: center !important;
            }
            .staff-profile-actions {
              width: 100%;
            }
            .staff-profile-status {
              width: 100%;
              text-align: center;
              margin-top: 0.75rem;
            }
            .staff-profile-status .form-label {
              display: block;
              margin-bottom: 0.35rem;
            }
            .staff-profile-status .form-check {
              justify-content: center;
            }
          }
          @media (max-width: 767.98px) {
            .staff-profile-sidebar {
              width: 100% !important;
              flex-direction: column !important;
              align-items: center !important;
              text-align: center !important;
              gap: 0;
              padding-bottom: 1rem;
              margin-bottom: 0.75rem !important;
              border-bottom: 1px solid #eef0f2;
            }
            .staff-profile-avatar {
              width: 96px !important;
              height: 96px !important;
              flex-shrink: 0;
              margin-bottom: 0.75rem;
            }
            .staff-profile-actions {
              width: 100%;
              max-width: 220px;
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-bottom: 0.25rem;
            }
            .staff-profile-actions .btn {
              width: 100%;
              font-size: 0.8125rem;
              padding: 0.45rem 0.75rem;
              border-radius: 8px;
            }
            .staff-profile-status {
              margin-top: 1rem !important;
              max-width: 220px;
              text-align: center !important;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              width: 100%;
            }
            .staff-profile-status .form-label {
              margin-bottom: 0 !important;
            }
            .staff-profile-status .form-check {
              justify-content: center !important;
            }
            .staff-details-tab-content {
              min-height: auto !important;
            }
            .staff-details-save-row {
              position: sticky;
              bottom: calc(60px + env(safe-area-inset-bottom, 0px));
              background: #fff;
              margin-left: -0.75rem;
              margin-right: -0.75rem;
              padding: 0.75rem;
              z-index: 10;
              box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
            }
            .staff-permissions-header {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 0.5rem;
            }
            .staff-permission-section-head {
              flex-wrap: wrap;
              gap: 0.35rem;
            }
          }
        `}
            </style>




            {/* Details and Password split row */}
            <div className="row g-3 mb-3 mx-auto">
                {/* Left Card: Staff Details */}
                <div className="col-12 col-lg-9">
                    <div className="card border-0 h-100 bg-white user-details-card" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-3 p-md-4">
                            <h5 className="fw-bold text-brown mb-3 d-flex align-items-center">
                                <i className="bi bi-person-badge-fill me-2"></i> Staff Profile Details
                            </h5>

                            <div className="row g-4">
                                {/* Left Side: Profile Image */}
                                <div className="col-12 col-md-auto text-center mb-3 mb-md-0 d-flex flex-column align-items-center staff-profile-sidebar" style={{ width: '150px' }}>
                                    <div className="bg-light rounded p-2 d-inline-block position-relative staff-profile-avatar" style={{ width: '130px', height: '130px' }}>
                                        <img
                                            src={userData.image}
                                            alt={userData.firstName}
                                            className="rounded object-fit-cover w-100 h-100"
                                        />
                                    </div>
                                    <div className="mt-2 mt-md-2 w-100 staff-profile-actions">
                                        <label className="btn btn-sm btn-outline-secondary w-100 fw-bold staff-change-photo-btn">
                                            <i className="bi bi-camera me-1 d-md-none"></i>
                                            Change Photo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="d-none"
                                                onChange={(e) => {
                                                    const file = getValidatedUploadFile(e);
                                                    if (file) {
                                                        setUserData(prev => ({
                                                            ...prev,
                                                            photoFile: file,
                                                            image: URL.createObjectURL(file)
                                                        }));
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <div className="mt-3 w-100 staff-profile-status">
                                        <label className="form-label text-muted small fw-bold mb-1">Status</label>
                                        <div className="form-check form-switch d-flex justify-content-center m-0 p-0">
                                            <input
                                                className="form-check-input custom-switch m-0"
                                                type="checkbox"
                                                role="switch"
                                                checked={userData.status}
                                                onChange={(e) => setUserData(prev => ({ ...prev, status: e.target.checked }))}
                                            />
                                        </div>
                                    </div>
                                    {fullLoginId && (
                                        <div className="mt-2 small text-muted">
                                            Login: <strong className="text-success">{fullLoginId}</strong>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Tabbed Forms */}
                                <div className="col">
                                    <div className="staff-detail-tabs-wrap mb-3">
                                    <ul className="nav nav-pills gap-1 bg-light p-1 rounded staff-detail-tabs d-flex">
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link py-1 px-2 px-xl-3 fw-bold btn-sm rounded ${activeDetailTab === 'personal' ? 'active bg-success text-white' : 'text-secondary bg-transparent border-0'}`}
                                                onClick={() => setActiveDetailTab('personal')}
                                            >
                                                Personal
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link py-1 px-2 px-xl-3 fw-bold btn-sm rounded ${activeDetailTab === 'address' ? 'active bg-success text-white' : 'text-secondary bg-transparent border-0'}`}
                                                onClick={() => setActiveDetailTab('address')}
                                            >
                                                Address
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link py-1 px-2 px-xl-3 fw-bold btn-sm rounded ${activeDetailTab === 'details' ? 'active bg-success text-white' : 'text-secondary bg-transparent border-0'}`}
                                                onClick={() => setActiveDetailTab('details')}
                                            >
                                                Details
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link py-1 px-2 px-xl-3 fw-bold btn-sm rounded ${activeDetailTab === 'finance' ? 'active bg-success text-white' : 'text-secondary bg-transparent border-0'}`}
                                                onClick={() => setActiveDetailTab('finance')}
                                            >
                                                ID & Bank
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link py-1 px-2 px-xl-3 fw-bold btn-sm rounded ${activeDetailTab === 'documents' ? 'active bg-success text-white' : 'text-secondary bg-transparent border-0'}`}
                                                onClick={() => setActiveDetailTab('documents')}
                                            >
                                                Document
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link py-1 px-2 px-xl-3 fw-bold btn-sm rounded ${activeDetailTab === 'other' ? 'active bg-success text-white' : 'text-secondary bg-transparent border-0'}`}
                                                onClick={() => setActiveDetailTab('other')}
                                            >
                                                Other
                                            </button>
                                        </li>
                                    </ul>
                                    </div>

                                    <div className="tab-content pt-2 staff-details-tab-content" style={{ minHeight: '230px' }}>
                                        {activeDetailTab === 'personal' && (
                                            <div className="row g-3">
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">First Name <span className="text-danger">*</span></label>
                                                    <input type="text" name="firstName" className="form-control" required value={userData.firstName || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Last Name <span className="text-danger">*</span></label>
                                                    <input type="text" name="lastName" className="form-control" required value={userData.lastName || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Father Name</label>
                                                    <input type="text" name="fatherName" className="form-control" value={userData.fatherName || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Mother Name</label>
                                                    <input type="text" name="motherName" className="form-control" value={userData.motherName || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Mobile No <span className="text-danger">*</span></label>
                                                    <input type="tel" name="mobileNo" className="form-control" required value={userData.mobileNo || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Phone No</label>
                                                    <input type="tel" name="phoneNo" className="form-control" value={userData.phoneNo || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Email Id <span className="text-danger">*</span></label>
                                                    <input type="email" name="emailId" className="form-control" required value={userData.emailId || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Gender <span className="text-danger">*</span></label>
                                                    <select name="gender" className="form-select" required value={userData.gender || ""} onChange={handleFieldChange}>
                                                        <option value="" disabled>Select</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Date Of Birth</label>
                                                    <input type="date" name="dateOfBirth" className="form-control" value={userData.dateOfBirth || ""} onChange={handleFieldChange} />
                                                </div>
                                            </div>
                                        )}

                                        {activeDetailTab === 'address' && (
                                            <div className="row g-3">
                                                <div className="col-12 col-md-6">
                                                    <label className="form-label text-muted small fw-bold mb-1">Current Address</label>
                                                    <textarea name="currentAddress" className="form-control" rows="2" value={userData.currentAddress || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <label className="form-label text-muted small fw-bold mb-1">Permanent Address</label>
                                                    <textarea name="permanentAddress" className="form-control" rows="2" value={userData.permanentAddress || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Village</label>
                                                    <input type="text" name="village" className="form-control" value={userData.village || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Ward No</label>
                                                    <input type="text" name="wardNumber" className="form-control" value={userData.wardNumber || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Tehsil</label>
                                                    <input type="text" name="tehsil" className="form-control" value={userData.tehsil || ""} onChange={handleFieldChange} />
                                                </div>
                                            </div>
                                        )}

                                        {activeDetailTab === 'details' && (
                                            <div className="row g-3">
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Cast</label>
                                                    <input type="text" name="cast" className="form-control" value={userData.cast || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Marital Status</label>
                                                    <select name="maritalStatus" className="form-select" value={userData.maritalStatus || ""} onChange={handleFieldChange}>
                                                        <option value="" disabled>Select</option>
                                                        <option value="Single">Single</option>
                                                        <option value="Married">Married</option>
                                                        <option value="Divorced">Divorced</option>
                                                        <option value="Widowed">Widowed</option>
                                                    </select>
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Occupation</label>
                                                    <input type="text" name="occupation" className="form-control" value={userData.occupation || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">City</label>
                                                    <input type="text" name="city" className="form-control" value={userData.city || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">State</label>
                                                    <input type="text" name="state" className="form-control" value={userData.state || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Country</label>
                                                    <input type="text" name="country" className="form-control" value={userData.country || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Pincode</label>
                                                    <input type="text" name="pincode" className="form-control" value={userData.pincode || ""} onChange={handleFieldChange} />
                                                </div>
                                            </div>
                                        )}

                                        {activeDetailTab === 'finance' && (
                                            <div className="row g-3">
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">GSTIN</label>
                                                    <input type="text" name="gstin" className="form-control" value={userData.gstin || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">PAN No</label>
                                                    <input type="text" name="panNo" className="form-control" value={userData.panNo || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Aadhaar No</label>
                                                    <input type="text" name="adhaarNo" className="form-control" value={userData.adhaarNo || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Bank Name</label>
                                                    <input type="text" name="bankName" className="form-control" value={userData.bankName || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">Bank A/c No</label>
                                                    <input type="text" name="bankAccNo" className="form-control" value={userData.bankAccNo || ""} onChange={handleFieldChange} />
                                                </div>
                                                <div className="col-12 col-md-6 col-lg-4">
                                                    <label className="form-label text-muted small fw-bold mb-1">IFSC Code</label>
                                                    <input type="text" name="ifscCode" className="form-control" value={userData.ifscCode || ""} onChange={handleFieldChange} />
                                                </div>
                                            </div>
                                        )}

                                        {activeDetailTab === 'documents' && (
                                            <ProfileDocumentsSection
                                                profilePreview={userData.image}
                                                onProfileFile={handleProfileFile}
                                                onProfileRemove={handleProfileRemove}
                                                documents={documents}
                                                onAddDocument={(doc) => setDocuments((prev) => [...prev, doc])}
                                                onRemoveDocument={(index) => {
                                                    setDocuments((prev) => {
                                                        const removed = prev[index];
                                                        if (removed?.isExisting && removed.path) {
                                                            setRemovedDocPaths((paths) => [...paths, removed.path]);
                                                        }
                                                        return prev.filter((_, i) => i !== index);
                                                    });
                                                }}
                                                onReplaceDocument={(index, file) => {
                                                    setDocuments((prev) => {
                                                        const replaced = prev[index];
                                                        if (replaced?.isExisting && replaced.path) {
                                                            setRemovedDocPaths((paths) => [...paths, replaced.path]);
                                                        }
                                                        return prev.map((doc, i) =>
                                                            i === index
                                                                ? {
                                                                      ...doc,
                                                                      file,
                                                                      preview: URL.createObjectURL(file),
                                                                      isExisting: false,
                                                                      path: null,
                                                                  }
                                                                : doc
                                                        );
                                                    });
                                                }}
                                                onUpdateDocument={(index, patch) =>
                                                    setDocuments((prev) =>
                                                        prev.map((doc, i) => (i === index ? { ...doc, ...patch } : doc))
                                                    )
                                                }
                                            />
                                        )}

                                        {activeDetailTab === 'other' && (
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <div className="h-100 d-flex flex-column">
                                                        <label className="form-label text-muted small fw-bold mb-1">Other Information</label>
                                                        <textarea name="otherInformation" className="form-control flex-grow-1" rows="5" style={{ minHeight: '120px' }} value={userData.otherInformation || ""} onChange={handleFieldChange} />
                                                        <p className="text-muted small mt-2 mb-0">
                                                            Upload signature and other documents in the Documents tab with a label (e.g. Signature).
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-4 border-top pt-3 staff-details-save-row">
                                <button type="button" className="btn btn-success px-4 fw-bold w-100 w-md-auto" onClick={handleSaveProfileDetails} disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            Saving...
                                        </>
                                    ) : (
                                        <><i className="bi bi-save me-2"></i>Save Details</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Card: Update Password */}
                <div className="col-12 col-lg-3">
                    <div className="card border-0 h-100 bg-white user-details-card" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-3 p-md-4 d-flex flex-column">
                            <h5 className="fw-bold text-brown mb-3 d-flex align-items-center">
                                <i className="bi bi-shield-lock-fill me-2"></i> Update Password
                            </h5>
                            <div className="mb-2">
                                <label className="form-label text-muted small fw-bold mb-1">Staff Login ID</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                />
                                <div className="form-text text-muted small mt-1">
                                    Full login: <strong>{ownerLoginId ? `${ownerLoginId}+${loginId || "..."}` : loginId || "..."}</strong>
                                </div>
                            </div>
                            <div className="mb-2">
                                <label className="form-label text-muted small fw-bold mb-1">New Password</label>
                                <div className="input-group has-validation">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${
                                            passwordTouched.password && password
                                                ? passwordValidation.password.failed
                                                    ? "is-invalid"
                                                    : "is-valid"
                                                : ""
                                        }`}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
                                        onFocus={() => setShowRequirements(true)}
                                        onBlur={() => {
                                            setPasswordTouched((prev) => ({ ...prev, password: true }));
                                            if (!password) setShowRequirements(false);
                                        }}
                                        maxLength={PASSWORD_MAX_LENGTH}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}
                                    >
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                                {passwordTouched.password ? (
                                    <div className={`small mt-1 ${passwordValidation.password.failed ? "text-danger" : "text-success"}`}>
                                        <i className={`bi ${passwordValidation.password.failed ? "bi-x-circle" : "bi-check-circle"} me-1`}></i>
                                        {passwordValidation.password.message}
                                    </div>
                                ) : null}
                            </div>

                            {(showRequirements || password.length > 0) && (
                                <PasswordRequirementsPanel
                                    checks={passwordRules.checks}
                                    password={password}
                                    className="mb-2"
                                />
                            )}

                            <div className="mb-2">
                                <label className="form-label text-muted small fw-bold mb-1">Confirm Password</label>
                                <div className="input-group has-validation">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`form-control ${
                                            passwordTouched.confirmPassword && confirmPassword
                                                ? passwordValidation.confirmPassword.failed
                                                    ? "is-invalid"
                                                    : "is-valid"
                                                : ""
                                        }`}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value.slice(0, PASSWORD_MAX_LENGTH))}
                                        onBlur={() => setPasswordTouched((prev) => ({ ...prev, confirmPassword: true }))}
                                        maxLength={PASSWORD_MAX_LENGTH}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        tabIndex={-1}
                                    >
                                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                                {passwordTouched.confirmPassword ? (
                                    <div className={`small mt-1 ${passwordValidation.confirmPassword.failed ? "text-danger" : "text-success"}`}>
                                        <i className={`bi ${passwordValidation.confirmPassword.failed ? "bi-x-circle" : "bi-check-circle"} me-1`}></i>
                                        {passwordValidation.confirmPassword.message}
                                    </div>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-danger w-100 fw-bold mt-auto"
                                onClick={handlePasswordUpdateOnly}
                                disabled={savingPassword || !passwordValidation.isValid}
                            >
                                {savingPassword ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                                        Updating...
                                    </>
                                ) : (
                                    <><i className="bi bi-key-fill me-2"></i> Update Password</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permissions Section */}
            <div className="card border-0 mb-3 bg-white mx-auto user-details-card" style={{ borderRadius: '12px' }}>
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 card-header-line staff-permissions-header">
                        <h5 className="fw-bold mb-0 text-brown d-flex align-items-center">
                            <i className="bi bi-shield-check-fill me-2"></i> Permissions & Roles
                        </h5>
                        <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
                            <input
                                className="form-check-input custom-switch ms-0" type="checkbox" role="switch"
                                id="fullPermission"
                                checked={isFullPermissionSelected()}
                                onChange={handleFullPermissionToggle}
                            />
                            <label className="form-check-label text-muted small fw-bold" htmlFor="fullPermission" style={{ cursor: 'pointer' }}>
                                Full Permission
                            </label>
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-3 mt-3">
                        {/* Firm access */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-building-fill me-2"></i> Firm access :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="firm-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('firm')} onChange={(e) => handleSectionSelectAll('firm', e.target.checked)} />
                                    <label htmlFor="firm-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="firm-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.firm.view} onChange={(e) => handlePermissionChange('firm', 'view', e.target.checked)} />
                                        <label htmlFor="firm-view" className="permission-label m-0">List Firm</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="firm-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.firm.create} onChange={(e) => handlePermissionChange('firm', 'create', e.target.checked)} />
                                        <label htmlFor="firm-create" className="permission-label m-0">Create Firm</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="firm-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.firm.edit} onChange={(e) => handlePermissionChange('firm', 'edit', e.target.checked)} />
                                        <label htmlFor="firm-edit" className="permission-label m-0">Update Firm</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="firm-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.firm.delete} onChange={(e) => handlePermissionChange('firm', 'delete', e.target.checked)} />
                                        <label htmlFor="firm-delete" className="permission-label m-0">Delete Firm</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account access */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-wallet2 me-2"></i> Account access :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="account-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('account')} onChange={(e) => handleSectionSelectAll('account', e.target.checked)} />
                                    <label htmlFor="account-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="account-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.account.view} onChange={(e) => handlePermissionChange('account', 'view', e.target.checked)} />
                                        <label htmlFor="account-view" className="permission-label m-0">List Accounts</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="account-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.account.create} onChange={(e) => handlePermissionChange('account', 'create', e.target.checked)} />
                                        <label htmlFor="account-create" className="permission-label m-0">Create Account</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="account-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.account.edit} onChange={(e) => handlePermissionChange('account', 'edit', e.target.checked)} />
                                        <label htmlFor="account-edit" className="permission-label m-0">Update Account</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="account-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.account.delete} onChange={(e) => handlePermissionChange('account', 'delete', e.target.checked)} />
                                        <label htmlFor="account-delete" className="permission-label m-0">Delete Account</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Staff access */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-briefcase-fill me-2"></i> Staff access :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="staff-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('staff')} onChange={(e) => handleSectionSelectAll('staff', e.target.checked)} />
                                    <label htmlFor="staff-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="staff-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.staff.view} onChange={(e) => handlePermissionChange('staff', 'view', e.target.checked)} />
                                        <label htmlFor="staff-view" className="permission-label m-0">List Staff</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="staff-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.staff.create} onChange={(e) => handlePermissionChange('staff', 'create', e.target.checked)} />
                                        <label htmlFor="staff-create" className="permission-label m-0">Create Staff</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="staff-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.staff.edit} onChange={(e) => handlePermissionChange('staff', 'edit', e.target.checked)} />
                                        <label htmlFor="staff-edit" className="permission-label m-0">Update Staff</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="staff-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.staff.delete} onChange={(e) => handlePermissionChange('staff', 'delete', e.target.checked)} />
                                        <label htmlFor="staff-delete" className="permission-label m-0">Delete Staff</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User access */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-people-fill me-2"></i> User access :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="user-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('user')} onChange={(e) => handleSectionSelectAll('user', e.target.checked)} />
                                    <label htmlFor="user-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                {["view", "create", "edit", "delete"].map((action) => (
                                    <div key={action} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                            <input
                                                id={`user-${action}`}
                                                className="form-check-input custom-switch m-0 ms-0"
                                                type="checkbox"
                                                role="switch"
                                                checked={permissions.user?.[action] || false}
                                                onChange={(e) => handlePermissionChange("user", action, e.target.checked)}
                                            />
                                            <label htmlFor={`user-${action}`} className="permission-label m-0">
                                                {action === "view" ? "List Users" : `${action.charAt(0).toUpperCase()}${action.slice(1)} User`}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Money Lender access */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-cash-stack me-2"></i> Money Lender access :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="moneyLender-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('moneyLender')} onChange={(e) => handleSectionSelectAll('moneyLender', e.target.checked)} />
                                    <label htmlFor="moneyLender-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                {["view", "create", "edit", "delete"].map((action) => (
                                    <div key={action} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                            <input
                                                id={`moneyLender-${action}`}
                                                className="form-check-input custom-switch m-0 ms-0"
                                                type="checkbox"
                                                role="switch"
                                                checked={permissions.moneyLender?.[action] || false}
                                                onChange={(e) => handlePermissionChange("moneyLender", action, e.target.checked)}
                                            />
                                            <label htmlFor={`moneyLender-${action}`} className="permission-label m-0">
                                                {action === "view" ? "List Money Lenders" : `${action.charAt(0).toUpperCase()}${action.slice(1)} Money Lender`}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Loan access */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-journal-text me-2"></i> Loan access :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="loan-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('loan')} onChange={(e) => handleSectionSelectAll('loan', e.target.checked)} />
                                    <label htmlFor="loan-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.view} onChange={(e) => handlePermissionChange('loan', 'view', e.target.checked)} />
                                        <label htmlFor="loan-view" className="permission-label m-0">List Loans</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.create} onChange={(e) => handlePermissionChange('loan', 'create', e.target.checked)} />
                                        <label htmlFor="loan-create" className="permission-label m-0">Create Loan</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.edit} onChange={(e) => handlePermissionChange('loan', 'edit', e.target.checked)} />
                                        <label htmlFor="loan-edit" className="permission-label m-0">Update Loan</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.delete} onChange={(e) => handlePermissionChange('loan', 'delete', e.target.checked)} />
                                        <label htmlFor="loan-delete" className="permission-label m-0">Delete Loan</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-form8" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.form8} onChange={(e) => handlePermissionChange('loan', 'form8', e.target.checked)} />
                                        <label htmlFor="loan-form8" className="permission-label m-0">FORM 8</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-deposit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.deposit} onChange={(e) => handlePermissionChange('loan', 'deposit', e.target.checked)} />
                                        <label htmlFor="loan-deposit" className="permission-label m-0">Deposit</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-addPrincipal" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.addPrincipal} onChange={(e) => handlePermissionChange('loan', 'addPrincipal', e.target.checked)} />
                                        <label htmlFor="loan-addPrincipal" className="permission-label m-0">Additional Principal</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-transfer" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.transfer} onChange={(e) => handlePermissionChange('loan', 'transfer', e.target.checked)} />
                                        <label htmlFor="loan-transfer" className="permission-label m-0">Transfer Loan</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-release" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.release} onChange={(e) => handlePermissionChange('loan', 'release', e.target.checked)} />
                                        <label htmlFor="loan-release" className="permission-label m-0">Release Loan</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-auction" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.auction} onChange={(e) => handlePermissionChange('loan', 'auction', e.target.checked)} />
                                        <label htmlFor="loan-auction" className="permission-label m-0">Auction Loan</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-notice" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.notice} onChange={(e) => handlePermissionChange('loan', 'notice', e.target.checked)} />
                                        <label htmlFor="loan-notice" className="permission-label m-0">Send Notice</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-customize" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.customize} onChange={(e) => handlePermissionChange('loan', 'customize', e.target.checked)} />
                                        <label htmlFor="loan-customize" className="permission-label m-0">Customize Loan</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-print" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.print} onChange={(e) => handlePermissionChange('loan', 'print', e.target.checked)} />
                                        <label htmlFor="loan-print" className="permission-label m-0">Print Loan</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="loan-loanLogs" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.loan.loanLogs} onChange={(e) => handlePermissionChange('loan', 'loanLogs', e.target.checked)} />
                                        <label htmlFor="loan-loanLogs" className="permission-label m-0">Loan Logs</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Finance access */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-cash-coin me-2"></i> Finance access :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="finance-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('finance')} onChange={(e) => handleSectionSelectAll('finance', e.target.checked)} />
                                    <label htmlFor="finance-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="finance-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.finance.view} onChange={(e) => handlePermissionChange('finance', 'view', e.target.checked)} />
                                        <label htmlFor="finance-view" className="permission-label m-0">List Finance</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="finance-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.finance.create} onChange={(e) => handlePermissionChange('finance', 'create', e.target.checked)} />
                                        <label htmlFor="finance-create" className="permission-label m-0">Create Finance</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="finance-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.finance.edit} onChange={(e) => handlePermissionChange('finance', 'edit', e.target.checked)} />
                                        <label htmlFor="finance-edit" className="permission-label m-0">Update Finance</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="finance-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.finance.delete} onChange={(e) => handlePermissionChange('finance', 'delete', e.target.checked)} />
                                        <label htmlFor="finance-delete" className="permission-label m-0">Delete Finance</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="finance-payment" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.finance.payment} onChange={(e) => handlePermissionChange('finance', 'payment', e.target.checked)} />
                                        <label htmlFor="finance-payment" className="permission-label m-0">Finance Collection</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="finance-rollback" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.finance.rollback} onChange={(e) => handlePermissionChange('finance', 'rollback', e.target.checked)} />
                                        <label htmlFor="finance-rollback" className="permission-label m-0">Finance Collection Rollback</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="finance-history" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.finance.history} onChange={(e) => handlePermissionChange('finance', 'history', e.target.checked)} />
                                        <label htmlFor="finance-history" className="permission-label m-0">Finance History</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="finance-printReceipt" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.finance.printReceipt} onChange={(e) => handlePermissionChange('finance', 'printReceipt', e.target.checked)} />
                                        <label htmlFor="finance-printReceipt" className="permission-label m-0">Print EMI Receipt</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reports & Logs */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-eye-fill me-2"></i> Reports & Logs (List Only) :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="reports-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('reports')} onChange={(e) => handleSectionSelectAll('reports', e.target.checked)} />
                                    <label htmlFor="reports-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="reports-daybook" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.reports.daybook} onChange={(e) => handlePermissionChange('reports', 'daybook', e.target.checked)} />
                                        <label htmlFor="reports-daybook" className="permission-label m-0">List Daybook</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="reports-balanceSheet" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.reports.balanceSheet} onChange={(e) => handlePermissionChange('reports', 'balanceSheet', e.target.checked)} />
                                        <label htmlFor="reports-balanceSheet" className="permission-label m-0">List Balance Sheet</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="reports-logs" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.reports.logs} onChange={(e) => handlePermissionChange('reports', 'logs', e.target.checked)} />
                                        <label htmlFor="reports-logs" className="permission-label m-0">List Logs</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="reports-profitLoss" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.reports.profitLoss} onChange={(e) => handlePermissionChange('reports', 'profitLoss', e.target.checked)} />
                                        <label htmlFor="reports-profitLoss" className="permission-label m-0">List Profit & Loss</label>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="reports-trialBalance" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.reports?.trialBalance || false} onChange={(e) => handlePermissionChange('reports', 'trialBalance', e.target.checked)} />
                                        <label htmlFor="reports-trialBalance" className="permission-label m-0">List Trial Balance</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                                    <i className="bi bi-gear-fill me-2"></i> Settings access :
                                </p>
                                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                                    <input id="settings-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('settings')} onChange={(e) => handleSectionSelectAll('settings', e.target.checked)} />
                                    <label htmlFor="settings-all" className="permission-label m-0">Select all</label>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input
                                            id="settings-manage"
                                            className="form-check-input custom-switch m-0 ms-0"
                                            type="checkbox"
                                            role="switch"
                                            checked={permissions.settings?.manage || false}
                                            onChange={(e) => handlePermissionChange("settings", "manage", e.target.checked)}
                                        />
                                        <label htmlFor="settings-manage" className="permission-label m-0">Manage Rate / Purity / Backup</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="d-flex justify-content-end mt-3 pt-3 border-top">
                        <button
                            type="button"
                            className="btn btn-success px-4 fw-bold"
                            onClick={handleSavePermissions}
                            disabled={savingPermissions}
                        >
                            {savingPermissions ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Saving...
                                </>
                            ) : (
                                <><i className="bi bi-shield-lock-fill me-2"></i>Save Permissions</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetails;