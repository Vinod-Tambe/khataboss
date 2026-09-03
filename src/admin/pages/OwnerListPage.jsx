import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import List from '../../components/common/List';
import {
  deleteOwner,
  getOwners,
  resetOwnerPassword,
  updateOwnerStatus,
} from '../api/ownerApi';

const formatOwnerName = (owner) =>
  [owner?.own_first_name, owner?.own_middle_name, owner?.own_last_name].filter(Boolean).join(' ');

const OwnerListPage = () => {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOwners();
      const rows = (res.data || []).map((owner) => ({
        own_id: owner.own_id ?? '',
        own_uuid: owner.own_uuid ?? '',
        owner_name: formatOwnerName(owner),
        own_login_id: owner.own_login_id ?? '',
        own_email: owner.own_email ?? '',
        own_mobile_no: owner.own_mobile_no ?? '',
        own_phone_no: owner.own_phone_no ?? '',
        own_db: owner.own_db ?? '',
        own_status: owner.own_status ?? 'Inactive',
        own_city: owner.own_city ?? '',
        own_state: owner.own_state ?? '',
        own_created_at: owner.own_created_at || owner.own_add_date || '',
      }));
      setOwners(rows);
      setSummary({
        total: rows.length,
        active: rows.filter((row) => row.own_status === 'Active').length,
        inactive: rows.filter((row) => row.own_status === 'Inactive').length,
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load owners');
      setOwners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleFilteredRowsChange = useCallback((filteredRows = []) => {
    setSummary((prev) => {
      const next = {
        total: filteredRows.length,
        active: filteredRows.filter((row) => row.own_status === 'Active').length,
        inactive: filteredRows.filter((row) => row.own_status === 'Inactive').length,
      };
      if (
        prev.total === next.total &&
        prev.active === next.active &&
        prev.inactive === next.inactive
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const handleToggleStatus = useCallback(async (owner) => {
    const nextStatus = owner.own_status === 'Active' ? 'Inactive' : 'Active';
    const label = nextStatus === 'Active' ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${label} ${formatOwnerName(owner)}?`)) return;

    try {
      await updateOwnerStatus(owner.own_uuid, nextStatus);
      toast.success(`Owner ${label}d successfully.`);
      fetchOwners();
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  }, [fetchOwners]);

  useEffect(() => {
    const handleOwnerActions = (e) => {
      const resetBtn = e.target.closest('.owner-reset-btn');
      const statusBtn = e.target.closest('.owner-status-btn');

      if (resetBtn) {
        e.preventDefault();
        e.stopPropagation();
        const uuid = resetBtn.getAttribute('data-uuid');
        const owner = owners.find((row) => row.own_uuid === uuid);
        if (owner) setResetTarget(owner);
        return;
      }

      if (statusBtn) {
        e.preventDefault();
        e.stopPropagation();
        const uuid = statusBtn.getAttribute('data-uuid');
        const owner = owners.find((row) => row.own_uuid === uuid);
        if (owner) handleToggleStatus(owner);
      }
    };

    document.addEventListener('click', handleOwnerActions);
    return () => document.removeEventListener('click', handleOwnerActions);
  }, [owners, handleToggleStatus]);

  const columns = useMemo(
    () => [
      { key: 'own_id', title: 'ID', orderable: true, searchable: true },
      {
        key: 'owner_name',
        title: 'Owner Name',
        orderable: true,
        searchable: true,
        render: (val, type, row) =>
          `<span class="text-brown fw-bold">${val || formatOwnerName(row)}</span>`,
      },
      { key: 'own_login_id', title: 'Login ID', orderable: true, searchable: true },
      { key: 'own_email', title: 'Email', orderable: true, searchable: true },
      { key: 'own_mobile_no', title: 'Mobile', orderable: true, searchable: true },
      { key: 'own_phone_no', title: 'Phone', orderable: false, searchable: true },
      {
        key: 'own_db',
        title: 'Database',
        orderable: true,
        searchable: true,
        render: (val) => `<code class="text-primary">${val || '-'}</code>`,
      },
      {
        key: 'own_status',
        title: 'Status',
        orderable: true,
        searchable: true,
        render: (val) => {
          const isActive = val === 'Active';
          const badgeClass = isActive ? 'bg-success' : 'bg-secondary';
          return `<span class="badge ${badgeClass}">${val || 'Inactive'}</span>`;
        },
      },
      { key: 'own_city', title: 'City', orderable: true, searchable: true },
      { key: 'own_state', title: 'State', orderable: true, searchable: true },
      {
        key: 'own_created_at',
        title: 'Created Date',
        orderable: true,
        searchable: true,
        render: (val) => (val ? moment(val).format('DD/MM/YYYY') : 'N/A'),
      },
      {
        key: 'own_uuid',
        title: 'More',
        orderable: false,
        searchable: false,
        render: (val, type, row) => {
          const statusLabel = row.own_status === 'Active' ? 'Deactivate' : 'Activate';
          const toggleIcon = row.own_status === 'Active' ? 'bi-toggle-on' : 'bi-toggle-off';
          return `
            <button type="button" class="btn btn-sm btn-warning pt-0 mt-0 pb-0 mb-0 owner-reset-btn me-1" data-uuid="${val}" title="Reset Password">
              <i class="bi bi-key-fill"></i>
            </button>
            <button type="button" class="btn btn-sm btn-info pt-0 mt-0 pb-0 mb-0 owner-status-btn me-1" data-uuid="${val}" data-status="${row.own_status || ''}" title="${statusLabel}">
              <i class="bi ${toggleIcon}"></i>
            </button>
          `;
        },
      },
    ],
    []
  );

  const handleEdit = useCallback(
    (rowData) => {
      navigate(`/admin/owners/details/${rowData.own_uuid}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (rowData) => {
      try {
        await deleteOwner(rowData.own_uuid);
        toast.success('Owner deleted successfully.');
        fetchOwners();
      } catch (error) {
        toast.error(error.message || 'Failed to delete owner');
      }
    },
    [fetchOwners]
  );

  const deleteConfirmMessage = useCallback(
    (row) => `Are you sure you want to delete owner: ${row?.owner_name || formatOwnerName(row)}?`,
    []
  );

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetTarget) return;
    try {
      await resetOwnerPassword(resetTarget.own_uuid, newPassword, confirmPassword);
      toast.success('Password reset successfully.');
      setResetTarget(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <Link to="/admin/owners/new" className="btn btn-primary">
          <i className="bi bi-person-plus me-1" />
          Add Owner
        </Link>
      </div>

      <List
        data={owners}
        columns={columns}
        title="All Owner List"
        primaryKey="owner_name"
        subtitleKey="own_login_id"
        amountKey="own_id"
        applyDefaultDateFilter={false}
        showFooter={false}
        isLoading={loading}
        onFilteredRowsChange={handleFilteredRowsChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        hasEdit
        hasDelete
        hasPrint={false}
        deleteConfirmMessage={deleteConfirmMessage}
      />

      <div className="row p-3 m-1">
        <div className="col-6" />
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light text-uppercase">
          Total Owners :
        </div>
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light">
          {summary.total}
        </div>
        <div className="col-6" />
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light text-uppercase">
          Active Owners :
        </div>
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-success bg-light">
          {summary.active}
        </div>
        <div className="col-6" />
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-dark bg-light text-uppercase">
          Inactive Owners :
        </div>
        <div className="col-3 bg-white border border-secondary text-end fw-bold p-1 text-secondary bg-light">
          {summary.inactive}
        </div>
      </div>

      {resetTarget && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <h5 className="fw-bold mb-3 text-brown">
              Reset Password — {formatOwnerName(resetTarget)}
            </h5>
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={() => setResetTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerListPage;
