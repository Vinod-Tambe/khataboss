import React from "react";
import {
  MODULE_META,
  groupCatalogByModule,
  isMatrixFullySelected,
  isSectionFullySelected,
} from "../../utils/permissionMatrix";

const StaffPermissionPanel = ({
  catalog = [],
  permissions = {},
  saving = false,
  onSave,
  onChange,
}) => {
  const grouped = groupCatalogByModule(catalog);

  const handleSectionSelectAll = (section, isChecked) => {
    onChange((prev) => {
      if (!prev[section]) return prev;
      const updatedSection = { ...prev[section] };
      for (const key of Object.keys(updatedSection)) {
        updatedSection[key] = isChecked;
      }
      return { ...prev, [section]: updatedSection };
    });
  };

  const handlePermissionChange = (section, key, isChecked) => {
    onChange((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: isChecked,
      },
    }));
  };

  const handleFullPermissionToggle = () => {
    onChange((prev) => {
      const nextValue = !isMatrixFullySelected(prev);
      const updated = {};
      for (const section of Object.keys(prev)) {
        updated[section] = {};
        for (const key of Object.keys(prev[section])) {
          updated[section][key] = nextValue;
        }
      }
      return updated;
    });
  };

  if (!grouped.length) {
    return (
      <div className="text-muted small py-3">
        Loading permission catalog...
      </div>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 card-header-line staff-permissions-header">
        <h5 className="fw-bold mb-0 text-brown d-flex align-items-center">
          <i className="bi bi-shield-check-fill me-2"></i> Permissions & Roles
        </h5>
        <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
          <input
            className="form-check-input custom-switch ms-0"
            type="checkbox"
            role="switch"
            id="fullPermission"
            checked={isMatrixFullySelected(permissions)}
            onChange={handleFullPermissionToggle}
          />
          <label
            className="form-check-label text-muted small fw-bold"
            htmlFor="fullPermission"
            style={{ cursor: "pointer" }}
          >
            Full Permission
          </label>
        </div>
      </div>

      <div className="d-flex flex-column gap-3 mt-3">
        {grouped.map(({ module, items }) => {
          const meta = MODULE_META[module] || {
            label: `${module} access`,
            icon: "bi-shield-lock",
          };

          return (
            <div key={module} className="border rounded p-2 bg-light bg-opacity-25">
              <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom border-light-subtle staff-permission-section-head">
                <p className="fw-bold mb-1 small text-secondary d-flex align-items-center">
                  <i className={`bi ${meta.icon} me-2`}></i> {meta.label} :
                </p>
                <div className="form-check form-switch mb-1 d-flex align-items-center gap-2 m-0 p-0">
                  <input
                    id={`${module}-all`}
                    className="form-check-input custom-switch m-0 ms-0"
                    type="checkbox"
                    role="switch"
                    checked={isSectionFullySelected(permissions, module)}
                    onChange={(e) => handleSectionSelectAll(module, e.target.checked)}
                  />
                  <label htmlFor={`${module}-all`} className="permission-label m-0">
                    Select all
                  </label>
                </div>
              </div>
              <div className="row g-3">
                {items.map((item) => (
                  <div key={item.perm_key} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div className="form-check form-switch d-flex align-items-center gap-2 p-0 m-0">
                      <input
                        id={item.perm_key.replace(".", "-")}
                        className="form-check-input custom-switch m-0 ms-0"
                        type="checkbox"
                        role="switch"
                        checked={permissions?.[module]?.[item.perm_action] || false}
                        onChange={(e) =>
                          handlePermissionChange(module, item.perm_action, e.target.checked)
                        }
                      />
                      <label
                        htmlFor={item.perm_key.replace(".", "-")}
                        className="permission-label m-0"
                      >
                        {item.perm_label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="d-flex justify-content-end mt-3 pt-3 border-top">
        <button
          type="button"
          className="btn btn-success px-4 fw-bold"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-shield-lock-fill me-2"></i>Save Permissions
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default StaffPermissionPanel;
