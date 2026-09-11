import React from 'react';

const OwnerModulePermissionPanel = ({
  catalog = [],
  modules = {},
  saving = false,
  onSave,
  onChange,
  hideSaveButton = false,
}) => {
  const sorted = [...catalog].sort(
    (a, b) => (a.module_sort_order || 0) - (b.module_sort_order || 0)
  );

  const allEnabled =
    sorted.length > 0 && sorted.every((item) => modules[item.module_key]);

  const handleToggleAll = () => {
    const nextValue = !allEnabled;
    onChange((prev) => {
      const next = { ...prev };
      for (const item of sorted) {
        next[item.module_key] = nextValue;
      }
      return next;
    });
  };

  const handleToggle = (moduleKey, checked) => {
    onChange((prev) => ({
      ...prev,
      [moduleKey]: checked,
    }));
  };

  if (!sorted.length) {
    return <div className="text-muted small py-3">Loading module catalog...</div>;
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 card-header-line staff-permissions-header">
        <h5 className="fw-bold mb-0 text-brown d-flex align-items-center">
          <i className="bi bi-shield-check-fill me-2" />
          Module Permissions
        </h5>
        <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
          <input
            className="form-check-input custom-switch ms-0"
            type="checkbox"
            role="switch"
            id="ownerFullModuleAccess"
            checked={allEnabled}
            onChange={handleToggleAll}
          />
          <label
            className="form-check-label text-muted small fw-bold"
            htmlFor="ownerFullModuleAccess"
            style={{ cursor: 'pointer' }}
          >
            All Modules
          </label>
        </div>
      </div>

      <p className="text-muted small mb-3">
        Enable whole modules for this owner. Inside each module, the owner can assign detailed
        permissions to staff.
      </p>

      <div className="row g-3">
        {sorted.map((item) => (
          <div key={item.module_key} className="col-12 col-sm-6 col-md-4 col-xl-3">
            <div className="border rounded p-3 h-100 bg-light bg-opacity-25">
              <div className="form-check form-switch d-flex align-items-center justify-content-between gap-2 p-0 m-0">
                <label
                  htmlFor={`owner-mod-${item.module_key}`}
                  className="fw-bold small text-secondary d-flex align-items-center mb-0"
                  style={{ cursor: 'pointer' }}
                >
                  <i className={`bi ${item.module_icon || 'bi-grid'} me-2`} />
                  {item.module_label}
                </label>
                <input
                  id={`owner-mod-${item.module_key}`}
                  className="form-check-input custom-switch m-0"
                  type="checkbox"
                  role="switch"
                  checked={!!modules[item.module_key]}
                  onChange={(e) => handleToggle(item.module_key, e.target.checked)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hideSaveButton && (
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
                <i className="bi bi-shield-lock-fill me-2" />
                Save Module Permissions
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default OwnerModulePermissionPanel;
