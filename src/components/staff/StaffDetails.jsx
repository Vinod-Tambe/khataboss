import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { showToast } from "../common/ToastAlert";

// Using the same mock data as StaffGrid for fallback support
const mockUsers = [
    { id: 1, name: "Vinod Gokul Tambe", phone: "9579082528, 8010445844", address: "Hadapsar, Pune, 411039", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 2, name: "Rahul Patil", phone: "9876543210", address: "Wakad, Pune, 411057", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 3, name: "Amit Kulkarni", phone: "9823456789", address: "Kothrud, Pune, 411038", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 4, name: "Sneha Joshi", phone: "9765432198", address: "Karve Nagar, Pune, 411052", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 5, name: "Rohit Deshmukh", phone: "9890123456", address: "Aundh, Pune, 411007", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 6, name: "Pooja Shinde", phone: "9012345678", address: "Baner, Pune, 411045", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 7, name: "Sanket Pawar", phone: "9123456789", address: "Pimple Saudagar, Pune, 411027", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 8, name: "Neha Chavan", phone: "9988776655", address: "Hinjewadi, Pune, 411057", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 9, name: "Akash Jadhav", phone: "9345678123", address: "Viman Nagar, Pune, 411014", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { id: 10, name: "Kiran More", phone: "9765123490", address: "Katraj, Pune, 411046", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }
];

const StaffDetails = () => {
    const { id } = useParams();
    // Resolve static staff details on load
    const selectedMockUser = mockUsers.find((u) => u.id === parseInt(id)) || mockUsers[0];
    const first = selectedMockUser ? selectedMockUser.name.split(" ")[0] : "Vinod";
    const last = selectedMockUser ? (selectedMockUser.name.split(" ").slice(1).join(" ") || "") : "Tambe";
    const email = selectedMockUser ? (selectedMockUser.email || first.toLowerCase() + "@example.com") : "vinod@example.com";

    const [userData, setUserData] = useState({
        firstName: first,
        lastName: last,
        fatherName: "Gokul Tambe",
        motherName: "Lata Tambe",
        mobileNo: selectedMockUser ? selectedMockUser.phone.split(',')[0].trim() : "9579082528",
        phoneNo: selectedMockUser ? (selectedMockUser.phone.split(',')[1]?.trim() || "") : "",
        emailId: email,
        gender: "Male",
        cast: "Maratha",
        maritalStatus: "Married",
        occupation: "Software Engineer",
        dateOfBirth: "1990-01-01",
        gstin: "27AAAAA1111A1Z1",
        taxNo: first.toLowerCase() + "123",
        panNo: "Admin@123",
        adhaarNo: "Admin@123",
        permanentAddress: selectedMockUser ? selectedMockUser.address : "Hadapsar, Pune, 411039",
        currentAddress: selectedMockUser ? selectedMockUser.address : "Hadapsar, Pune, 411039",
        village: "Hadapsar",
        wardNumber: "12",
        tehsil: "Haveli",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        pincode: "411039",
        bankName: "State Bank of India",
        bankAccNo: "30012345678",
        ifscCode: "SBIN0001234",
        otherInformation: "No extra info.",
        aadhaarFront: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
        aadhaarBack: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
        panCard: "https://cdn-icons-png.flaticon.com/512/281/281764.png",
        signature: "https://cdn-icons-png.flaticon.com/512/2921/2921226.png",
        image: selectedMockUser ? selectedMockUser.image : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        status: true
    });

    // Password and Login ID states
    const [loginId, setLoginId] = useState(first.toLowerCase() + "123");
    const [password, setPassword] = useState("Admin@123");
    const [confirmPassword, setConfirmPassword] = useState("Admin@123");

    // Scoped Details tab state
    const [activeDetailTab, setActiveDetailTab] = useState("personal");

    // Initializing permissions state based exactly on the user options
    const initialPermissions = {
        firm: { view: true, create: false, edit: true, delete: true },
        account: { view: true, create: false, edit: true, delete: true },
        staff: { view: true, create: false, edit: true, delete: true },
        loan: {
            view: true,
            create: false,
            edit: true,
            delete: true,
            form8: true,
            deposit: true,
            addPrincipal: false,
            transfer: false,
            release: true,
            auction: false,
            notice: true,
            customize: true,
            print: true,
            loanLogs: true
        },
        finance: {
            view: true,
            create: false,
            edit: true,
            delete: true,
            payment: true,
            rollback: false,
            history: true,
            printReceipt: true
        },
        reports: { daybook: true, balanceSheet: true, logs: true, profitLoss: true }
    };
    const [permissions, setPermissions] = useState(initialPermissions);

    const triggerAlert = (message, type = "success") => {
        const toastType = type === "danger" ? "error" : type;
        showToast(message, toastType);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSaveProfileDetails = () => {
        if (!userData.firstName || !userData.lastName) {
            triggerAlert("First Name and Last Name are required!", "danger");
            return;
        }
        if (!userData.mobileNo) {
            triggerAlert("Mobile Number is required!", "danger");
            return;
        }

        // Simulating save details locally
        triggerAlert("Staff profile details saved successfully ...");
    };

    const handlePasswordUpdateOnly = () => {
        if (!password) {
            triggerAlert("Password cannot be empty!", "danger");
            return;
        }
        if (password !== confirmPassword) {
            triggerAlert("Password and Confirm Password do not match!", "danger");
            return;
        }

        // Simulating password save locally
        setUserData(prev => prev ? { ...prev, panNo: password, adhaarNo: confirmPassword, taxNo: loginId } : null);
        triggerAlert("Login ID and password updated successfully ...");
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

    return (
        <div className="" style={{ minHeight: '100vh' }}>
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
                                <div className="col-12 col-md-auto text-center text-md-start mb-3 mb-md-0 d-flex flex-column align-items-center" style={{ width: '150px' }}>
                                    <div className="bg-light rounded p-2 d-inline-block position-relative" style={{ width: '130px', height: '130px' }}>
                                        <img
                                            src={userData.image}
                                            alt={userData.firstName}
                                            className="rounded object-fit-cover w-100 h-100"
                                        />
                                    </div>
                                    <div className="mt-2 w-100">
                                        <label className="btn btn-sm btn-outline-secondary w-100 fw-bold">
                                            Change Photo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="d-none"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
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
                                    <div className="mt-3 w-100 text-center">
                                        <label className="form-label text-muted small fw-bold mb-1 d-block">Status</label>
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
                                </div>

                                {/* Right Side: Tabbed Forms */}
                                <div className="col">
                                    <ul className="nav nav-pills mb-3 gap-1 bg-light p-1 rounded" style={{ width: 'fit-content' }}>
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

                                    <div className="tab-content pt-2" style={{ minHeight: '230px' }}>
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
                                            <div className="row g-3">
                                                <div className="col-12 col-md-4">
                                                    <div className="card bg-light border-0 p-2 text-center" style={{ borderRadius: '8px' }}>
                                                        <span className="small fw-bold text-muted mb-2">Aadhaar Front</span>
                                                        <div className="bg-white rounded p-1 mb-2 mx-auto d-flex align-items-center justify-content-center" style={{ width: '100%', height: '120px' }}>
                                                            <img src={userData.aadhaarFront} alt="Aadhaar Front" className="object-fit-contain w-100 h-100 rounded" />
                                                        </div>
                                                        <label className="btn btn-sm btn-outline-success fw-bold w-100">
                                                            Upload Aadhaar Front
                                                            <input type="file" accept="image/*" className="d-none" onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setUserData(prev => ({ ...prev, aadhaarFront: URL.createObjectURL(file) }));
                                                            }} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <div className="card bg-light border-0 p-2 text-center" style={{ borderRadius: '8px' }}>
                                                        <span className="small fw-bold text-muted mb-2">Aadhaar Back</span>
                                                        <div className="bg-white rounded p-1 mb-2 mx-auto d-flex align-items-center justify-content-center" style={{ width: '100%', height: '120px' }}>
                                                            <img src={userData.aadhaarBack} alt="Aadhaar Back" className="object-fit-contain w-100 h-100 rounded" />
                                                        </div>
                                                        <label className="btn btn-sm btn-outline-success fw-bold w-100">
                                                            Upload Aadhaar Back
                                                            <input type="file" accept="image/*" className="d-none" onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setUserData(prev => ({ ...prev, aadhaarBack: URL.createObjectURL(file) }));
                                                            }} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <div className="card bg-light border-0 p-2 text-center" style={{ borderRadius: '8px' }}>
                                                        <span className="small fw-bold text-muted mb-2">PAN Card</span>
                                                        <div className="bg-white rounded p-1 mb-2 mx-auto d-flex align-items-center justify-content-center" style={{ width: '100%', height: '120px' }}>
                                                            <img src={userData.panCard} alt="PAN Card" className="object-fit-contain w-100 h-100 rounded" />
                                                        </div>
                                                        <label className="btn btn-sm btn-outline-success fw-bold w-100">
                                                            Upload PAN Card
                                                            <input type="file" accept="image/*" className="d-none" onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setUserData(prev => ({ ...prev, panCard: URL.createObjectURL(file) }));
                                                            }} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeDetailTab === 'other' && (
                                            <div className="row g-3">
                                                <div className="col-12 col-md-4">
                                                    <div className="card bg-light border-0 p-2 text-center" style={{ borderRadius: '8px' }}>
                                                        <span className="small fw-bold text-muted mb-2">Signature</span>
                                                        <div className="bg-white rounded p-1 mb-2 mx-auto d-flex align-items-center justify-content-center" style={{ width: '100%', height: '120px' }}>
                                                            <img src={userData.signature} alt="Signature" className="object-fit-contain w-100 h-100 rounded" />
                                                        </div>
                                                        <label className="btn btn-sm btn-outline-success fw-bold w-100">
                                                            Upload Signature
                                                            <input type="file" accept="image/*" className="d-none" onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setUserData(prev => ({ ...prev, signature: URL.createObjectURL(file) }));
                                                            }} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-8">
                                                    <div className="h-100 d-flex flex-column">
                                                        <label className="form-label text-muted small fw-bold mb-1">Other Information</label>
                                                        <textarea name="otherInformation" className="form-control flex-grow-1" rows="5" style={{ minHeight: '120px' }} value={userData.otherInformation || ""} onChange={handleFieldChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-4 border-top pt-3">
                                <button type="button" className="btn btn-success px-4 fw-bold" onClick={handleSaveProfileDetails}>
                                    <i className="bi bi-save me-2"></i>Save Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Card: Update Password */}
                <div className="col-12 col-lg-3">
                    <div className="card border-0 h-100 bg-white user-details-card" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
                            <div>
                                <h5 className="fw-bold text-brown mb-3 d-flex align-items-center">
                                    <i className="bi bi-shield-lock-fill me-2"></i> Update Password
                                </h5>
                                <div className="mb-2">
                                    <label className="form-label text-muted small fw-bold mb-1">Login ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={loginId}
                                        onChange={(e) => {
                                            setLoginId(e.target.value);
                                            setUserData(prev => prev ? { ...prev, taxNo: e.target.value } : null);
                                        }}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label text-muted small fw-bold mb-1">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        maxLength={10}
                                    />
                                    <div className="form-text text-muted small mt-1">Max 10 characters.</div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline-danger w-100 fw-bold mt-1"
                                onClick={handlePasswordUpdateOnly}
                            >
                                <i className="bi bi-key-fill me-2"></i> Update Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permissions Section */}
            <div className="card border-0 mb-3 bg-white mx-auto user-details-card" style={{ borderRadius: '12px' }}>
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 card-header-line">
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
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle">
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
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle">
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
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle">
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

                        {/* Loan access */}
                        <div className="border rounded p-2 bg-light bg-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle">
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
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle">
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
                            <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle">
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
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetails;