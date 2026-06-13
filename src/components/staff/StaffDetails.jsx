import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUser } from "../../api/userApi";

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
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initializing permissions state based exactly on the image options
    const initialPermissions = {
        client: { view: true, create: false, edit: true, viewOnly: true, delete: true, viewCreds: true, viewAgreements: true },
        lead: { view: true, create: false, edit: true, delete: true, allowTurn: true, viewOnly: true },
        task: { view: true, create: false, edit: true, delete: true, viewOnly: true },
        user: { view: true, create: false, edit: true, delete: true, allowSet: true, viewOnly: true },
        calendar: { view: true, create: false, edit: true, delete: true, viewOnly: true },
        service: { view: true, create: false, edit: true, delete: true },
        supportCenter: { view: true, create: false, edit: true, delete: true },
        supportType: { view: true, create: false, edit: true, delete: true }
    };
    const [permissions, setPermissions] = useState(initialPermissions);

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            setError(null);
            if (id && id.includes("-")) {
                try {
                    const response = await getUser(id);
                    setUserData({
                        name: `${response.data.user_first_name} ${response.data.user_last_name}`,
                        phone: response.data.user_mobile_no,
                        email: response.data.user_email || "Not provided",
                        address: `${response.data.user_city}, ${response.data.user_state}`,
                        image: response.data.user_profile_img?.path ? `http://localhost:9000/${response.data.user_profile_img.path}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                        status: response.data.user_status === 'active'
                    });
                } catch (err) {
                    setError(err.message || "Failed to fetch user details from API.");
                }
            } else {
                const user = mockUsers.find((u) => u.id === parseInt(id)) || mockUsers[0];
                if (user) {
                    const email = user.email || user.name.split(" ")[0].toLowerCase() + "@example.com";
                    setUserData({ ...user, name: user.name, email: email, phone: user.phone, address: user.address, status: true });
                } else {
                    setError("User not found.");
                }
            }
            setLoading(false);
        };
        fetchUserDetails();
    }, [id]);

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

    const handleFullPermissionToggle = (isChecked) => {
        const updated = {};
        for (const section in permissions) {
            updated[section] = {};
            for (const key in permissions[section]) {
                updated[section][key] = isChecked;
            }
        }
        setPermissions(updated);
    };

    const isSectionFullySelected = (section) => {
        return Object.values(permissions[section]).every(val => val === true);
    };

    const isFullPermissionSelected = () => {
        return Object.values(permissions).every(section => Object.values(section).every(val => val === true));
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
                <div className="spinner-border" style={{ color: '#13a89e' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">{error}</div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-chevron-left me-2"></i>Back
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
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
          /* This makes the checkbox green when checked, matching the image */
          .custom-checkbox:checked {
            background-color: #13a89e !important;
            border-color: #13a89e !important;
          }
          .custom-checkbox:focus {
            box-shadow: 0 0 0 0.25rem rgba(19, 168, 158, 0.25) !important;
            border-color: #13a89e !important;
          }
          .form-switch .custom-switch {
            width: 2.25em;
            height: 1.15em;
            cursor: pointer;
          }
          .form-switch .custom-switch:checked {
            background-color: #13a89e !important;
            border-color: #13a89e !important;
          }
          .permission-label {
            font-size: 0.85rem;
            color: #374151;
            font-weight: 500;
            cursor: pointer;
          }
          .card-header-line {
            border-bottom: 2px solid #e5e7eb;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
          }
          .user-details-card {
            background-color: #ffffff !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
            border: 1px solid #eef0f2 !important;
          }
        `}
            </style>

            {/* Header matching the layout design */}
            <div className="d-flex justify-content-between align-items-center mb-4 mx-auto" style={{ maxWidth: '1400px' }}>
                <h3 className="fw-bold mb-0" style={{ color: '#0d253f' }}>User Details</h3>
                <div>
                    <button className="btn text-white me-3 px-4 py-2" style={{ backgroundColor: '#13a89e' }}>
                        <i className="bi bi-pencil-square me-2"></i>Edit/Update
                    </button>
                    <button className="btn bg-white px-4 py-2" style={{ color: '#13a89e', border: '1px solid #13a89e' }} onClick={() => navigate(-1)}>
                        <i className="bi bi-chevron-left me-1"></i> Back
                    </button>
                </div>
            </div>

            <div className="card border-0 mb-4 bg-white mx-auto user-details-card" style={{ borderRadius: '12px', maxWidth: '1400px', backgroundColor: '#FFFFFF' }}>
                <div className="card-body p-4 p-md-5">
                    {/* User Info Section */}
                    <div className="row mb-4 align-items-center">
                        <div className="col-auto me-3">
                            <div className="bg-light rounded p-2 d-inline-block" style={{ width: '150px', height: '150px', backgroundColor: '#f3f4f6' }}>
                                <img
                                    src={userData.image}
                                    alt={userData.name}
                                    className="rounded object-fit-cover w-100 h-100"
                                />
                            </div>
                        </div>

                        <div className="col px-3">
                            <div className="row mb-4 align-items-end">
                                <div className="col-md-3 d-flex flex-column justify-content-end">
                                    <p className="text-muted mb-2 small fw-bold d-flex align-items-center">
                                        <i className="bi bi-person-fill me-2 fs-6 text-secondary"></i>Full Name
                                    </p>
                                    <h5 className="fw-bold mb-0" style={{ color: '#1f2937', minHeight: '24px' }}>{userData.name}</h5>
                                </div>
                                <div className="col-md-3 d-flex flex-column justify-content-end">
                                    <p className="text-muted mb-2 small fw-bold d-flex align-items-center">
                                        <i className="bi bi-telephone-fill me-2 fs-6 text-secondary"></i>Contact Number
                                    </p>
                                    <h5 className="mb-0 fw-medium" style={{ color: '#1f2937', minHeight: '24px' }}>{userData.phone.split(',')[0]}</h5>
                                </div>
                                <div className="col-md-4 d-flex flex-column justify-content-end">
                                    <p className="text-muted mb-2 small fw-bold d-flex align-items-center">
                                        <i className="bi bi-envelope-fill me-2 fs-6 text-secondary"></i>Email Address
                                    </p>
                                    <h5 className="mb-0 fw-medium text-break" style={{ color: '#1f2937', minHeight: '24px' }}>{userData.email}</h5>
                                </div>
                                <div className="col-md-2 d-flex flex-column justify-content-end align-items-end pe-4">
                                    <p className="text-muted mb-2 small fw-bold text-center w-100 d-flex align-items-center justify-content-center" style={{ minHeight: '24px' }}>Status</p>
                                    <div className="form-check form-switch w-100 d-flex justify-content-center m-0 p-0" style={{ minHeight: '24px' }}>
                                        <input
                                            className="form-check-input custom-switch m-0"
                                            type="checkbox"
                                            role="switch"
                                            checked={userData.status}
                                            onChange={(e) => setUserData({...userData, status: e.target.checked})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12 border-top pt-3" style={{ borderColor: 'rgba(19, 168, 158, 0.4)' }}>
                                    <p className="text-muted mb-1 small fw-bold d-flex align-items-center">
                                        <i className="bi bi-geo-alt-fill me-2 fs-6 text-secondary"></i>Admin's Address
                                    </p>
                                    <h6 className="mb-0 fw-bold" style={{ color: '#374151' }}>{userData.address}</h6>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="mt-5 pt-3">
                        <div className="d-flex align-items-center mb-4">
                            <h5 className="fw-bold mb-0 me-4 pb-1" style={{ color: '#374151', borderBottom: '3px solid #6b7280' }}>Permission</h5>
                            <div className="form-check form-switch d-flex align-items-center gap-2 ms-2 mb-0 p-0">
                                <input
                                    className="form-check-input custom-switch ms-0" type="checkbox" role="switch"
                                    id="fullPermission"
                                    checked={isFullPermissionSelected()}
                                    onChange={(e) => handleFullPermissionToggle(e.target.checked)}
                                />
                                <label className="form-check-label text-muted small fw-medium" htmlFor="fullPermission" style={{ cursor: 'pointer' }}>
                                    Full Permission
                                </label>
                            </div>
                        </div>

                        <div className="row g-5 mt-1">
                            {/* Client access */}
                            <div className="col-md-3">
                                <h6 className="fw-bold mb-3 small" style={{ color: '#374151' }}>Client access :</h6>
                                <div className="d-flex flex-column gap-3 text-muted small fw-medium">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="client-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('client')} onChange={(e) => handleSectionSelectAll('client', e.target.checked)} />
                                        <label htmlFor="client-all" className="permission-label m-0">Select all</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="client-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.client.view} onChange={(e) => handlePermissionChange('client', 'view', e.target.checked)} />
                                        <label htmlFor="client-view" className="permission-label m-0">View Clients</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="client-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.client.create} onChange={(e) => handlePermissionChange('client', 'create', e.target.checked)} />
                                        <label htmlFor="client-create" className="permission-label m-0">Create Clients</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="client-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.client.edit} onChange={(e) => handlePermissionChange('client', 'edit', e.target.checked)} />
                                        <label htmlFor="client-edit" className="permission-label m-0">Edit/Update Clients</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="client-viewonly" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.client.viewOnly} onChange={(e) => handlePermissionChange('client', 'viewOnly', e.target.checked)} />
                                        <label htmlFor="client-viewonly" className="permission-label m-0">View Only Created Clients</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="client-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.client.delete} onChange={(e) => handlePermissionChange('client', 'delete', e.target.checked)} />
                                        <label htmlFor="client-delete" className="permission-label m-0">Delete Client</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="client-viewcreds" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.client.viewCreds} onChange={(e) => handlePermissionChange('client', 'viewCreds', e.target.checked)} />
                                        <label htmlFor="client-viewcreds" className="permission-label m-0">Can view credentials sections</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="client-viewagree" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.client.viewAgreements} onChange={(e) => handlePermissionChange('client', 'viewAgreements', e.target.checked)} />
                                        <label htmlFor="client-viewagree" className="permission-label m-0">Can view agreements, upfront fees, and monthly fees</label>
                                    </div>
                                </div>
                            </div>

                            {/* Lead access */}
                            <div className="col-md-3">
                                <h6 className="fw-bold mb-3 small" style={{ color: '#374151' }}>Lead access :</h6>
                                <div className="d-flex flex-column gap-3 text-muted small fw-medium">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="lead-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('lead')} onChange={(e) => handleSectionSelectAll('lead', e.target.checked)} />
                                        <label htmlFor="lead-all" className="permission-label m-0">Select all</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="lead-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.lead.view} onChange={(e) => handlePermissionChange('lead', 'view', e.target.checked)} />
                                        <label htmlFor="lead-view" className="permission-label m-0">View Leads</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="lead-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.lead.create} onChange={(e) => handlePermissionChange('lead', 'create', e.target.checked)} />
                                        <label htmlFor="lead-create" className="permission-label m-0">Create Leads</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="lead-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.lead.edit} onChange={(e) => handlePermissionChange('lead', 'edit', e.target.checked)} />
                                        <label htmlFor="lead-edit" className="permission-label m-0">Edit/Update Leads</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="lead-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.lead.delete} onChange={(e) => handlePermissionChange('lead', 'delete', e.target.checked)} />
                                        <label htmlFor="lead-delete" className="permission-label m-0">Delete Leads</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="lead-allow" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.lead.allowTurn} onChange={(e) => handlePermissionChange('lead', 'allowTurn', e.target.checked)} />
                                        <label htmlFor="lead-allow" className="permission-label m-0">Allow to turns Lead into Client</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="lead-viewonly" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.lead.viewOnly} onChange={(e) => handlePermissionChange('lead', 'viewOnly', e.target.checked)} />
                                        <label htmlFor="lead-viewonly" className="permission-label m-0">View Only Created Leads</label>
                                    </div>
                                </div>
                            </div>

                            {/* Global Task access */}
                            <div className="col-md-3">
                                <h6 className="fw-bold mb-3 small" style={{ color: '#374151' }}>Global Task access :</h6>
                                <div className="d-flex flex-column gap-3 text-muted small fw-medium">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="task-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('task')} onChange={(e) => handleSectionSelectAll('task', e.target.checked)} />
                                        <label htmlFor="task-all" className="permission-label m-0">Select all</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="task-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.task.view} onChange={(e) => handlePermissionChange('task', 'view', e.target.checked)} />
                                        <label htmlFor="task-view" className="permission-label m-0">View Task</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="task-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.task.create} onChange={(e) => handlePermissionChange('task', 'create', e.target.checked)} />
                                        <label htmlFor="task-create" className="permission-label m-0">Create Task</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="task-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.task.edit} onChange={(e) => handlePermissionChange('task', 'edit', e.target.checked)} />
                                        <label htmlFor="task-edit" className="permission-label m-0">Edit/Update Task</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="task-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.task.delete} onChange={(e) => handlePermissionChange('task', 'delete', e.target.checked)} />
                                        <label htmlFor="task-delete" className="permission-label m-0">Delete Task</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="task-viewonly" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.task.viewOnly} onChange={(e) => handlePermissionChange('task', 'viewOnly', e.target.checked)} />
                                        <label htmlFor="task-viewonly" className="permission-label m-0">View Only Created Task</label>
                                    </div>
                                </div>
                            </div>

                            {/* User access */}
                            <div className="col-md-3">
                                <h6 className="fw-bold mb-3 small" style={{ color: '#374151' }}>User access :</h6>
                                <div className="d-flex flex-column gap-3 text-muted small fw-medium">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="user-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('user')} onChange={(e) => handleSectionSelectAll('user', e.target.checked)} />
                                        <label htmlFor="user-all" className="permission-label m-0">Select all</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="user-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.user.view} onChange={(e) => handlePermissionChange('user', 'view', e.target.checked)} />
                                        <label htmlFor="user-view" className="permission-label m-0">View Users</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="user-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.user.create} onChange={(e) => handlePermissionChange('user', 'create', e.target.checked)} />
                                        <label htmlFor="user-create" className="permission-label m-0">Create User</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="user-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.user.edit} onChange={(e) => handlePermissionChange('user', 'edit', e.target.checked)} />
                                        <label htmlFor="user-edit" className="permission-label m-0">Edit/Update User</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="user-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.user.delete} onChange={(e) => handlePermissionChange('user', 'delete', e.target.checked)} />
                                        <label htmlFor="user-delete" className="permission-label m-0">Delete Users</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="user-allow" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.user.allowSet} onChange={(e) => handlePermissionChange('user', 'allowSet', e.target.checked)} />
                                        <label htmlFor="user-allow" className="permission-label m-0">Allow to Set Permissions</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="user-viewonly" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.user.viewOnly} onChange={(e) => handlePermissionChange('user', 'viewOnly', e.target.checked)} />
                                        <label htmlFor="user-viewonly" className="permission-label m-0">View only created users</label>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar access */}
                            <div className="col-md-3">
                                <h6 className="fw-bold mb-3 small" style={{ color: '#374151' }}>Calendar access :</h6>
                                <div className="d-flex flex-column gap-3 text-muted small fw-medium">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="cal-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('calendar')} onChange={(e) => handleSectionSelectAll('calendar', e.target.checked)} />
                                        <label htmlFor="cal-all" className="permission-label m-0">Select all</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="cal-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.calendar.view} onChange={(e) => handlePermissionChange('calendar', 'view', e.target.checked)} />
                                        <label htmlFor="cal-view" className="permission-label m-0">View Events</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="cal-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.calendar.create} onChange={(e) => handlePermissionChange('calendar', 'create', e.target.checked)} />
                                        <label htmlFor="cal-create" className="permission-label m-0">Create Events</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="cal-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.calendar.edit} onChange={(e) => handlePermissionChange('calendar', 'edit', e.target.checked)} />
                                        <label htmlFor="cal-edit" className="permission-label m-0">Edit/Update Events</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="cal-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.calendar.delete} onChange={(e) => handlePermissionChange('calendar', 'delete', e.target.checked)} />
                                        <label htmlFor="cal-delete" className="permission-label m-0">Delete Events</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="cal-viewonly" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.calendar.viewOnly} onChange={(e) => handlePermissionChange('calendar', 'viewOnly', e.target.checked)} />
                                        <label htmlFor="cal-viewonly" className="permission-label m-0">View Only Created Events</label>
                                    </div>
                                </div>
                            </div>

                            {/* Service access */}
                            <div className="col-md-3">
                                <h6 className="fw-bold mb-3 small" style={{ color: '#374151' }}>Service access :</h6>
                                <div className="d-flex flex-column gap-3 text-muted small fw-medium">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="srv-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('service')} onChange={(e) => handleSectionSelectAll('service', e.target.checked)} />
                                        <label htmlFor="srv-all" className="permission-label m-0">Select all</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="srv-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.service.view} onChange={(e) => handlePermissionChange('service', 'view', e.target.checked)} />
                                        <label htmlFor="srv-view" className="permission-label m-0">View Services</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="srv-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.service.create} onChange={(e) => handlePermissionChange('service', 'create', e.target.checked)} />
                                        <label htmlFor="srv-create" className="permission-label m-0">Create Services</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="srv-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.service.edit} onChange={(e) => handlePermissionChange('service', 'edit', e.target.checked)} />
                                        <label htmlFor="srv-edit" className="permission-label m-0">Edit/Update Services</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="srv-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.service.delete} onChange={(e) => handlePermissionChange('service', 'delete', e.target.checked)} />
                                        <label htmlFor="srv-delete" className="permission-label m-0">Delete Services</label>
                                    </div>
                                </div>
                            </div>

                            {/* Support Center access */}
                            <div className="col-md-3">
                                <h6 className="fw-bold mb-3 small" style={{ color: '#374151' }}>Support Center access :</h6>
                                <div className="d-flex flex-column gap-3 text-muted small fw-medium">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="sc-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('supportCenter')} onChange={(e) => handleSectionSelectAll('supportCenter', e.target.checked)} />
                                        <label htmlFor="sc-all" className="permission-label m-0">Select all</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="sc-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.supportCenter.view} onChange={(e) => handlePermissionChange('supportCenter', 'view', e.target.checked)} />
                                        <label htmlFor="sc-view" className="permission-label m-0">View Tickets</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="sc-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.supportCenter.create} onChange={(e) => handlePermissionChange('supportCenter', 'create', e.target.checked)} />
                                        <label htmlFor="sc-create" className="permission-label m-0">Create Tickets</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="sc-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.supportCenter.edit} onChange={(e) => handlePermissionChange('supportCenter', 'edit', e.target.checked)} />
                                        <label htmlFor="sc-edit" className="permission-label m-0">Edit/Update Tickets</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="sc-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.supportCenter.delete} onChange={(e) => handlePermissionChange('supportCenter', 'delete', e.target.checked)} />
                                        <label htmlFor="sc-delete" className="permission-label m-0">Delete Tickets</label>
                                    </div>
                                </div>
                            </div>

                            {/* Support Type access */}
                            <div className="col-md-3">
                                <h6 className="fw-bold mb-3 small" style={{ color: '#374151' }}>Support Type access :</h6>
                                <div className="d-flex flex-column gap-3 text-muted small fw-medium">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="st-all" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={isSectionFullySelected('supportType')} onChange={(e) => handleSectionSelectAll('supportType', e.target.checked)} />
                                        <label htmlFor="st-all" className="permission-label m-0">Select all</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="st-view" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.supportType.view} onChange={(e) => handlePermissionChange('supportType', 'view', e.target.checked)} />
                                        <label htmlFor="st-view" className="permission-label m-0">View Support Type</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="st-create" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.supportType.create} onChange={(e) => handlePermissionChange('supportType', 'create', e.target.checked)} />
                                        <label htmlFor="st-create" className="permission-label m-0">Create Support Type</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="st-edit" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.supportType.edit} onChange={(e) => handlePermissionChange('supportType', 'edit', e.target.checked)} />
                                        <label htmlFor="st-edit" className="permission-label m-0">Edit/Update Support Type</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                                        <input id="st-delete" className="form-check-input custom-switch m-0 ms-0" type="checkbox" role="switch" checked={permissions.supportType.delete} onChange={(e) => handlePermissionChange('supportType', 'delete', e.target.checked)} />
                                        <label htmlFor="st-delete" className="permission-label m-0">Delete Support Type</label>
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